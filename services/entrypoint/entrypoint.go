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

var nc *nats.Conn
var sc stan.Conn

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
		"ping",
		"conv_creation",
		"conv_manag",
		"msg_sender",
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

	// send data back to the websocket
	subWsSend, _ := nc.Subscribe("ws."+wsID+".send", func(m *nats.Msg) {
		err = c.WriteMessage(websocket.TextMessage, m.Data)
		if err != nil {
			log.Print("subWsSend/write: ", wsID, " -- ", err)
		}
	})

	defer subWsSend.Unsubscribe()
	defer c.Close()

	for {
		_, message, err := c.ReadMessage()
		if err != nil {
			log.Print("read: ", wsID, " -- ", err)
			break
		}
		log.Printf("recv (#%s): %s", wsID, message)

		// parse JSON receved message
		var j map[string]interface{}
		err = json.Unmarshal([]byte(message), &j)
		if err != nil {
			log.Print("error while decoding JSON: ", err)
			break
		}

		if action, ok := j["action"].(string); ok {
			if isValidServiceName(action) {
				j["ws-id"] = wsID
				msg, err := json.Marshal(j)
				if err != nil {
					log.Print("error while encoding JSON: ", err)
					break
				}
				channelName := fmt.Sprintf("service.%s", action)
				// does not return until an ack has been received from NATS Streaming
				sc.Publish(channelName, []byte(msg))
			} else {
				log.Printf("Service '%s' is not valid (#%s)", action, wsID)
			}
		} else {
			log.Printf("unable to get action (#%s)", wsID)
		}
	}

	log.Printf("Websocket connection closed (#%s)", wsID)
}

func initBus(natsURL, clusterID, clientID string) error {
	var err error
	nc, err = nats.Connect(natsURL)
	if err != nil {
		return err
	}
	sc, err = stan.Connect(clusterID, clientID, stan.NatsConn(nc))
	if err != nil {
		return err
	}
	return nil
}

func closeBus() {
	sc.Close()
	nc.Close()
}

func main() {
	log.Println("Entrypoint service started…")

	// fetch env
	natsURL := getEnv("NATS_URL", "nats://localhost:4222")
	clusterID := getEnv("NATS_CLUSTER_ID", "nats-cluster")
	clientID := uuid.New().String()

	err := initBus(natsURL, clusterID, clientID)
	if err != nil {
		log.Fatal(err)
	}

	defer closeBus()

	http.HandleFunc("/", handleWS)
	log.Fatal(http.ListenAndServe(":42042", nil))
}
