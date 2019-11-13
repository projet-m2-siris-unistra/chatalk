package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	nats "github.com/nats-io/nats.go"
	stan "github.com/nats-io/stan.go"
)

var natsURL = getEnv("NATS_URL", "nats://localhost:4222")
var clusterID = getEnv("NATS_CLUSTER_ID", "nats-cluster")
var clientID = uuid.New().String()
var stanConnection stan.Conn

// get environment variable, if not found will be set to `fallback` value
func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

// check if service name is valid
func isValidServiceName(name string) bool {
	switch name {
	case
		"register",
		"login":
		return true
	}
	return false
}

func handleWS(w http.ResponseWriter, r *http.Request) {
	wsID := uuid.New().String()
	log.Printf("New websocket connection (#%s)", wsID)

	upgrader := websocket.Upgrader{}
	upgrader.CheckOrigin = func(r *http.Request) bool {
		return true
	}

	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade: ", wsID, " -- ", err)
	}

	sub, _ := stanConnection.Subscribe(wsID, func(m *stan.Msg) {
		log.Printf("Received a message: %s\n", string(m.Data))
	})

	defer c.Close()
	defer sub.Unsubscribe()

	for {
		mt, message, err := c.ReadMessage()
		if err != nil {
			log.Print("read: ", wsID, " -- ", err)
			break
		}
		log.Printf("recv (#%s): %s", wsID, message)

		// parse JSON receved message
		var j map[string]interface{}
		json.Unmarshal([]byte(message), &j)
		if action, ok := j["action"].(string); ok {
			if isValidServiceName(action) {
				channelName := fmt.Sprintf("service-%s", action)
				stanConnection.Publish(channelName, []byte(message)) // does not return until an ack has been received from NATS Streaming
			} else {
				log.Printf("Service '%s' is not valid (#%s)", action, wsID)
			}
		} else {
			log.Printf("unable to get action (#%s)", wsID)
		}

		err = c.WriteMessage(mt, message)
		if err != nil {
			log.Print("write: ", wsID, " -- ", err)
			break
		}
	}

	log.Printf("Websocket connection closed (#%s)", wsID)
}

func main() {
	log.Println("Entrypoint service started…")
	nc, err := nats.Connect(natsURL)
	if err != nil {
		log.Fatal(err)
	}
	sc, err := stan.Connect(clusterID, clientID, stan.NatsConn(nc))
	if err != nil {
		log.Fatal(err)
	}
	stanConnection = sc

	defer stanConnection.Close()
	defer nc.Close()

	http.HandleFunc("/", handleWS)
	log.Fatal(http.ListenAndServe(":42042", nil))
}
