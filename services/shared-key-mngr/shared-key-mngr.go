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

// Message with
// - Conv ID
// - Tuple (
//   - User ID
//   - Shared key
//   )

func main() {
	log.Println("login service started…")
	channelName := "service.login"

	db := utils.DBConnect()
	nc, sc := utils.InitBus()

	// Receives shared keys from "WebsocketProvider.serviceResponseConvCreation"
	// Stores shared keys in database
	// Sends shared keys to corresponding users

	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGINT, syscall.SIGTERM)

	sub, _ := sc.Subscribe(channelName, func(m *stan.Msg) {
		log.Println("login service is handling a new request")

		var msg loginRequest
		err := json.Unmarshal(m.Data, &msg)
		if err != nil {
			log.Print("failed to parse JSON", err)
			return
		}

		response := loginResponse{
			Action:  "login",
			Success: false,
		}

		err = verifyPayload(msg)
		if err != nil {
			response.Error = err.Error()
		} else {
			row := db.Read().QueryRow(`
				SELECT user_id, pw_hash, display_name, pic_url, username
				FROM users
				WHERE username = $1 OR email = $1;
			`, msg.Payload.Username)

			var userID int
			var hash []byte
			var dispName, picURL null.String
			var userUsername string
			err = row.Scan(&userID, &hash, &dispName, &picURL, &userUsername)

			switch err {
			case sql.ErrNoRows:
				log.Println("No rows were returned!")
				message := fmt.Sprintf("User not registered")

				response = loginResponse{
					Success: false,
					Action:  "login",
					Error:   message,
				}
			case nil:
				err := bcrypt.CompareHashAndPassword(hash, []byte(msg.Payload.Password))
				if err != nil {
					response.Error = "bad password"
				} else {
					response.Success = true
					response.UserID = userID
					response.Username = userUsername
					response.Displayname = dispName
					response.Picture = picURL

					topicName := "user." + strconv.Itoa(userID)
					nc.Publish("ws."+msg.WsID+".sub", []byte(topicName))

					triggerSendInfos(sc, msg.WsID, userID)
				}
			default:
				response.Error = err.Error()
			}
		}

		j, err := json.Marshal(response)
		nc.Publish("ws."+msg.WsID+".send", j)
	})

	<-c

	sub.Unsubscribe()
	sc.Close()
}
