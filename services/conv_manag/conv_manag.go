package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/signal"
	"strconv"
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
		TypeManag string `json:"type"`
		UserID    string `json:"userid"`
		ConvID    string `json:"convid"`
	} `json:"payload"`
}

type registerResponse struct {
	Action  string `json:"action"`
	Success bool   `json:"success"`
	Error   string `json:"error,omitempty"`
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
		var userID int
		var convID int
		var typeManag int
		var topicName string

		userID, err = strconv.Atoi(msg.Payload.UserID)

		if err != nil {
			if userID != 0 {
				log.Println("conv management: userid = %s", userID)
			}
			response = registerResponse{
				Action:  "conv_manag",
				Success: false,
				Error:   "User ID is not valid",
			}
			goto send_msg
		}

		convID, err = strconv.Atoi(msg.Payload.ConvID)

		if err != nil {
			response = registerResponse{
				Action:  "conv_manag",
				Success: false,
				Error:   "Conversation ID is not valid",
			}
			goto send_msg
		}

		typeManag, err = strconv.Atoi(msg.Payload.TypeManag)
		if err != nil {
			response = registerResponse{
				Action:  "conv_manag",
				Success: false,
				Error:   "Management Type is not valid",
			}
			goto send_msg
		}

		if typeManag == 1 { // add participant
			topicName = "conv." + strconv.Itoa(convID)
			_, err = db.Query(`
				INSERT INTO conv_keys(user_id, conv_id, shared_key, timefrom, timeto, favorite, audio)
				VALUES($1, $2, 0, current_timestamp, NULL, false, false);
			`, userID, convID)

			if err == nil {
				response = registerResponse{
					Action:  "conv_manag",
					Success: true,
				}
				nc.Publish("ws."+msg.WsID+".sub", []byte(topicName))
			} else {
				dberr := dberror.GetError(err)
				switch e := dberr.(type) {
				case *dberror.Error:
					errmsg := e.Error()
					response = registerResponse{
						Action:  "conv_manag",
						Success: false,
						Error:   errmsg,
					}
				}
			}
			goto send_msg
		}

		if typeManag == 2 { //delete participant
			_, err = db.Query(`
				DELETE FROM conv_keys
				WHERE user_id = $1 AND conv_id = $2
			`, userID, convID)

			if err == nil {
				response = registerResponse{
					Action:  "conv_manag",
					Success: true,
				}
			} else {
				dberr := dberror.GetError(err)
				switch e := dberr.(type) {
				case *dberror.Error:
					errmsg := e.Error()
					response = registerResponse{
						Action:  "conv_manag",
						Success: false,
						Error:   errmsg,
					}
				}
			}
		}
	send_msg:
		j, err := json.Marshal(response)
		nc.Publish("ws."+msg.WsID+".send", j)
	})

	<-c

	sub.Unsubscribe()
	sc.Close()
}
