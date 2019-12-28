package main

import (
	"encoding/json"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/google/uuid"
	nats "github.com/nats-io/nats.go"
	stan "github.com/nats-io/stan.go"
)

type pingRequest struct {
	Action string `json:"action"`
	WsID   string `json:"ws-id"`
}

// get environment variable, if not found will be set to `fallback` value
func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func main() {
	log.Println("ping service started…")

	channelName := "service.ping"
	natsURL := getEnv("NATS_URL", "nats://localhost:4222")
	clusterID := getEnv("NATS_CLUSTER_ID", "nats-cluster")
	clientID := uuid.New().String()

	// connect to nats
	nc, err := nats.Connect(natsURL)
	if err != nil {
		log.Fatal(err)
	}

	// connect to stan (nats-streaming)
	sc, err := stan.Connect(clusterID, clientID, stan.NatsConn(nc))
	if err != nil {
		log.Fatal(err)
	}

	// create a channel to listen for a terminaison signal
	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGINT, syscall.SIGTERM)

	sub, _ := sc.QueueSubscribe(channelName, channelName, func(m *stan.Msg) {
		log.Println("ping service is handling a new request")
		var msg pingRequest
		err := json.Unmarshal(m.Data, &msg)
		if err != nil {
			log.Print("failed to parse JSON", err)
			return
		}

		nc.Publish("ws."+msg.WsID+".send", m.Data)
	}, stan.DurableName(channelName))

	<-c // just wait for terminaison signal to continue (exit)

	sub.Unsubscribe()
	sc.Close()

	log.Println("ping service exited…")
}
