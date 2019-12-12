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
	"strings"

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
		ConvID     string `json:"convid"`
		Convname   string `json:"convname,omitempty"`
		Convtopic  string `json:"convtopic,omitempty"`
		Newmembers string `json:"newmembers,omitempty"`
	} `json:"payload"`
}

type registerResponse struct {
	Action   string `json:"action"`
	Success  bool   `json:"success"`
	Error    string `json:"error,omitempty"`
	ConvID   string `json:"convid"`
	Convname string `json:"convname,omitempty"`
	Members  string `json:"members,omitempty"`
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
		var convID int
		var userID int
		var members []int
		var spliMem []string
		var allmembers string

		spliMem = strings.Split(msg.Payload.Newmembers,"}")
		spliMem = strings.Split(spliMem[0],"{")
		spliMem = strings.Split(spliMem[1],",")

		for _, v := range spliMem {
			userID, _  = strconv.Atoi(v)
			members = append(members, userID)
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

		if msg.Payload.Convname != "" {

		}

		if msg.Payload.Convtopic != "" {

		}

		if len(members) > 0 {

		}
	// to old members send a conv-mana msg
	// to new members send a conv-creation msg with creator 0

	send_msg:
		j, err := json.Marshal(response)
		nc.Publish("ws."+msg.WsID+".send", j)
	})

	<-c

	sub.Unsubscribe()
	sc.Close()
}
