package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"strconv"

	"chatalk.fr/utils"
	stan "github.com/nats-io/stan.go"
	"golang.org/x/crypto/bcrypt"
	"gopkg.in/guregu/null.v3"
)

/*
	A shared key encrypted with a user public key
 */
type userSharedKey struct {
	UserID    int32  `json:"userid"`
	SharedKey string `json:"sharedkey"`
}

type sharedKeyRequest struct {
	Action string            `json:"action"`
	WsID   string            `json:"ws-id"`
	Payload struct {
		ConvID int32           `json:"convid"`
		Keys   UserSharedKey[] `json:"keys"`
	} `json:"payload"`
}

type sharedKeyResponse struct {
	Action  string        `json:"action"`
	Success bool          `json:"success"`
	Error   string        `json:"error,omitempty"`
	ConvID  int32         `json:"convid,omitempty"`
	Key     UserSharedKey `json:"key,omitempty"`
}

// Receives shared keys from "WebsocketProvider.serviceResponseConvCreation"
// Stores shared keys in database
// Sends shared keys to corresponding users on its user channel
func main() {
	log.Println("Shared key management service started…")
	channelName := "service.shared-key-mngr"

	db := utils.DBConnect()
	nc, sc := utils.InitBus()

	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGINT, syscall.SIGTERM)

	sub, _ := sc.Subscribe(channelName, func(m *stan.Msg) {
		log.Println("New key to dispatch")

		var msg sharedKeyRequest
		err := json.Unmarshal(m.Data, &msg)
		if err != nil {
			log.Print("failed to parse JSON", err)
			return
		}

		response := sharedKeyResponse {
			Action:  "shared-key-mngr",
			Success: false,
		}

		for _, key := range msg.Payload.Keys {
			// Write keys to database
			err = db.Write().QueryRow(`
				UPDATE conv_keys
				SET shared_key = $1
				WHERE conv_id = $2 AND user_id = $3;
			`, key.SharedKey, msg.Payload.ConvID, key.UserID)

			response.Success = true
			response.Key     = key
			response.ConvID  = msg.Payload.ConvID

			// Send key to user
			j, err := json.Marshal(response)
			nc.Publish("user."+strconv.ItoA(key.UserID), j)
		}
	})

	<-c

	sub.Unsubscribe()
	sc.Close()
}
