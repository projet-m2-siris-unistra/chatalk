package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	dberror "github.com/Shyp/go-dberror"
	"github.com/google/uuid"
	_ "github.com/lib/pq"
	nats "github.com/nats-io/nats.go"
	stan "github.com/nats-io/stan.go"
)

type registerRequest struct {
	Action  string `json:"action"`
	WsID    string `json:"ws-id"`
	Payload struct {
		Type   int    `json:"type"`
		Userid string `json:"user_id"`
		Convid string `json:"conv_id"`
	} `json:"payload"`
}

type registerResponse struct {
	Success bool  `json:"success"`
	Error   error `json:"error,omitempty"`
}

// get environment variable, if not found will be set to `fallback` value
func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

// connect to a PostgreSQL database
func dbConnect() *sql.DB {
	dbHost := getEnv("DB_HOST", "localhost")
	dbDb := getEnv("DB_DB", "app")
	dbUser := getEnv("DB_USER", "root")
	dbPass := getEnv("DB_PASS", "root")
	dbMode := getEnv("DB_MODE", "disable")

	connStr := fmt.Sprintf("postgres://%s:%s@%s/%s?sslmode=%s", dbUser, dbPass, dbHost, dbDb, dbMode)
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}

	return db
}

func main() {
	log.Println("Conversation management service started…")
	channelName := "service.conv_manag"
	db := dbConnect()

	natsURL := getEnv("NATS_URL", "nats://localhost:4222")
	clusterID := getEnv("NATS_CLUSTER_ID", "nats-cluster")
	clientID := uuid.New().String()
	nc, err := nats.Connect(natsURL)
	if err != nil {
		log.Fatal(err)
	}

	sc, err := stan.Connect(clusterID, clientID, stan.NatsConn(nc))
	if err != nil {
		log.Fatal(err)
	}

	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGINT, syscall.SIGTERM)

	sub, _ := sc.Subscribe(channelName, func(m *stan.Msg) {
		log.Println("conversation management service is handling a new request")
		var msg registerRequest
		err := json.Unmarshal(m.Data, &msg)
		if err != nil {
			log.Print("failed to parse JSON", err)
			return
		}

		var response registerResponse

		if msg.Payload.Userid == nil {
			response = registerResponse{
				Success: false,
				Message: "User ID is not valid",
			}
		} else if msg.Payload.Convid == nil {
			response = registerResponse{
				Success: false,
				Message: "Conversation ID is not valid",
			}
		} else if msg.Payload.Type == 1 { // add participant
			err = db.QueryRow(`
				INSERT INTO conv_keys(user_id, conv_id, timefrom, shared_key, favorite, audio)
				VALUES($1, $2, 0, 0, false, false)
				RETURNING key_id;
			`, msg.Payload.Userid, msg.Payload.Convid).Scan(&convID)

			if err == nil {
				response = registerResponse{
					Success: true,
				}
			} else {
				dberr := dberror.GetError(err)
				switch e := dberr.(type) {
				case *dberror.Error:
					errmsg := e.Error()
				}
				response = registerResponse{
					Success: false,
					Error:   errmsg,
				}
			}
		} else if msg.Payload.Type == 2 { //delete participant
			err = db.Query(`
				DELETE FROM conv_keys
				WHERE user_id = $1 AND conv_id = $2
			`, msg.Payload.Userid, msg.Payload.Convid)

			if err == nil {
				response = registerResponse{
					Success: true,
				}
			} else {
				dberr := dberror.GetError(err)
				switch e := dberr.(type) {
				case *dberror.Error:
					errmsg := e.Error()
				}
				response = registerResponse{
					Success: false,
					Error:   errmsg,
				}
			}
		}

		j, err := json.Marshal(response)
		nc.Publish("ws."+msg.WsID+".send", j)
	})

	<-c

	sub.Unsubscribe()
	sc.Close()
}
