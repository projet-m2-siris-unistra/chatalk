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

	"github.com/google/uuid"
	_ "github.com/lib/pq"
	nats "github.com/nats-io/nats.go"
	stan "github.com/nats-io/stan.go"
)

type messageIngress struct {
	WsID    string `json:"ws-id"`
	Src     string `json:"source"`
	Dst     string `json:"destination"`
	Dev     string `json:"device"`
	Payload string `json:"payload"`
}

type messageBroad struct {
	Src     string `json:"source"`
	Dst     string `json:"destination"`
	Payload string `json:"payload"`
}

type messageResponse struct {
	Message string `json:"message,omitempty"`
	Error   error  `json:"error,omitempty"`
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
	log.Println("Message broadcast service started…")
	channelName := "service.msg_sender"
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
		log.Println("message broadcast service is handling a new request")
		var msg messageIngress
		err := json.Unmarshal(m.Data, &msg)
		if err != nil {
			log.Print("failed to parse JSON", err)
			return
		}

		var response messageResponse

		if msg.Payload == "" {
			response = messageResponse{
				Message: "Message is empty",
			}
		} else {
			var msgID int
			var userID int
			var convID int

			userID, err = strconv.Atoi(msg.Src)
			convID, err = strconv.Atoi(msg.Dst)

			err = db.QueryRow(`
				INSERT INTO messages(time, user_id, conv_id, content, archived)
				VALUES (now(), $1, $2, $3, false)
				RETURNING msg_id;
			`, userID, convID, msg.Payload).Scan(&msgID)

			message := fmt.Sprintf("Message ID is: %s", msgID)
			jm, err := json.Marshal(messageBroad{Src: msg.Src, Dst: msg.Dst, Payload: msg.Payload})
			nc.Publish("conv."+msg.Dst, []byte(jm))

			response = messageResponse{
				Message: message,
				Error:   err,
			}
		}

		j, err := json.Marshal(response)
		nc.Publish("ws."+msg.WsID+".send", j)
	})

	<-c

	sub.Unsubscribe()
	sc.Close()
}
