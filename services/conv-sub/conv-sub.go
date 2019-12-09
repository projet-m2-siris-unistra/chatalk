package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"os"
	"os/signal"
	"syscall"
	"strconv"

	"chatalk.fr/utils"
	stan "github.com/nats-io/stan.go"
)

type ConvSubRequest struct {
	Action  string `json:"action"`
	WsID    string `json:"ws-id"`
	Payload struct {
		UserID string `json:"userid"`
		ConvID string `json:"convid"`
	} `json:"payload"`
}

type ConvSubResponse struct {
	Action  string `json:"action"`
	Success bool   `json:"success"`
	Error   string `json:"error,omitempty"`
}

func main() {
	log.Println("Conversation Subscription service started…")
	channelName := "service.conv-sub"

	db := utils.DBConnect()
	nc, sc := utils.InitBus()

	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGINT, syscall.SIGTERM)

	sub, _ := sc.Subscribe(channelName, func(m *stan.Msg) {
		log.Println("Conversation Subscription service is handling a new request")

		var msg ConvSubRequest
		err := json.Unmarshal(m.Data, &msg)
		if err != nil {
			log.Print("failed to parse JSON", err)
			return
		}

		userID, _ := strconv.Atoi(msg.Payload.UserID)
		convID, _ := strconv.Atoi(msg.Payload.ConvID)

		response := ConvSubResponse{
			Action:  "Conv-sub",
			Success: false,
		}
		row := db.Read().QueryRow(`
				SELECT user_id
		    FROM conv_keys
				WHERE user_id = $1 AND conv_id = $2
		`, userID, convID)

		err = row.Scan(&userID)

		switch err {
		case sql.ErrNoRows:
			response.Error = "User "+msg.Payload.UserID+" is not in conversation "+msg.Payload.ConvID+"."
		case nil:
			response.Success = true
			topicName := "conv." + msg.Payload.ConvID
			nc.Publish("ws."+msg.WsID+".sub", []byte(topicName))
		default:
			response.Error = err.Error()
		}

		j, err := json.Marshal(response)
		nc.Publish("ws."+msg.WsID+".send", j)
	})

	<-c

	sub.Unsubscribe()
	sc.Close()
}
