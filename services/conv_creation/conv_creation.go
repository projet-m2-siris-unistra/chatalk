package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/signal"
	"strings"
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
		UserID   string `json:"userid"`
		Convname string `json:"convname"`
		Topic    string `json:"topic"`
		Picture  string `json:"picture"`
		Members  string `json:"members"`
	} `json:"payload"`
}

type registerResponse struct {
	Action  string `json:"action"`
	Success bool   `json:"success"`
	Error   string `json:"error,omitempty"`
	Creator int    `json:"creator,omitempty"`
	ConvID  string `json:"convid,omitempty"`
	Convname 	string `json:"convname,omitempty"`
	Sharedkey	string `json:"sharedkey,omitempty"`
	Members		string `json:"members,omitempty"`
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
		var members []int
		var topicName string
		var spliMem []string
		var allmembers string

		spliMem = strings.Split(msg.Payload.Members,"}")
		allmembers= spliMem[0]
		spliMem = strings.Split(spliMem[0],"{")
		spliMem = strings.Split(spliMem[1],",")

		for _, v := range spliMem {
			userID, _  = strconv.Atoi(v)
			members = append(members, userID)
		}
		userID, err = strconv.Atoi(msg.Payload.UserID)
		allmembers=allmembers + "," + msg.Payload.UserID + "}"


		if err != nil {
			response = registerResponse{
				Action:  "conv_creation",
				Success: false,
				Error:   "UserID not valid",
			}
			goto send_msg
		}

		if msg.Payload.Convname == "" {
			response = registerResponse{
				Action:  "conv_creation",
				Success: false,
				Error:   "Conversation name is not valid",
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
				for _, v := range members {
					_, err = db.Query(
						`INSERT INTO conv_keys(user_id, conv_id, shared_key, timefrom, timeto, favorite, audio)
						VALUES($1, $2, 0, current_timestamp, NULL, false, false);`, v, convID)
				}

				response = registerResponse{
					Action:  "conv_creation",
					Success: true,
					Creator: userID,
					ConvID: strconv.Itoa(convID),
					Convname: msg.Payload.Convname,
					Sharedkey: "0",
					Members: allmembers,
				}
				jm, _ := json.Marshal(response)
				for _, v := range members{
					nc.Publish("user."+strconv.Itoa(v), []byte(jm))
				}
				topicName = "conv." + strconv.Itoa(convID)
				nc.Publish("ws."+msg.WsID+".sub", []byte(topicName))
			} else {
				dberr := dberror.GetError(err)
				switch e := dberr.(type) {
				case *dberror.Error:
					errmsg := e.Error()
					response = registerResponse{
						Action:  "conv_creation",
						Success: false,
						Error:   errmsg,
					}
				default:
					response = registerResponse{
						Action:  "conv_creation",
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
