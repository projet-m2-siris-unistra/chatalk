package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"strconv"

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
		UserID 	 string    `json:"userid"`
		Convname string `json:"convname"`
		Topic    string `json:"topic"`
		Picture  string `json:"picture"`
	} `json:"payload"`
}

type registerResponse struct {
	Success bool  `json:"success"`
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
	log.Println("Conversation creation service started…")
	channelName := "service.conv_creation"
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
		log.Println("conversation creation service is handling a new request")
		var msg registerRequest
		err := json.Unmarshal(m.Data, &msg)
		if err != nil {
			log.Print("failed to parse JSON", err)
			return
		}

		var response registerResponse
		var userID int
		var convID int

		userID, err = strconv.Atoi(msg.Payload.UserID)

		if err != nil {
			response = registerResponse{
				Success: false,
				Error: "UserID not valid",
			}
			goto send_msg
		}


		if msg.Payload.Convname == "" {
			response = registerResponse{
				Success: false,
				Error: "Conversation name is not valid",
			}
		} else {
			err = db.QueryRow(
				`INSERT INTO conversations(convname, topic, pic_url, archived)
				VALUES($1, $2, $3, false)
				RETURNING conv_id;`, msg.Payload.Convname, msg.Payload.Topic, msg.Payload.Picture).Scan(&convID)

			if err == nil {

				_, err = db.Query(
					`INSERT INTO conv_keys(user_id, conv_id, shared_key, timefrom, timeto, favorite, audio)
					VALUES($1, $2, 0, current_timestamp, NULL, false, false);`, userID, convID)

				if err == nil {
					message := fmt.Sprintf("Creation OK.\n conv ID is: %s", convID)
					response = registerResponse{
						Success: true,
						Error:   message,
					}
				} else {
					dberr := dberror.GetError(err)
					switch e := dberr.(type) {
					case *dberror.Error:
						errmsg := e.Error()
						response = registerResponse{
							Success: false,
							Error:   errmsg,
						}
					default :
						response = registerResponse {
							Success: false,
						}
					}

					_, err = db.Query(
						`DELETE FROM conversations WHERE conv_id = $1;`, convID)
				}
			} else {
				dberr := dberror.GetError(err)
				switch e := dberr.(type) {
				case *dberror.Error:
					errmsg := e.Error()
					response = registerResponse{
						Success: false,
						Error:   errmsg,
					}
				default :
					response = registerResponse {
						Success: false,
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
