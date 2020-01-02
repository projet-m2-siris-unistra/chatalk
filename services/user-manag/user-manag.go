package main

import (
	"encoding/json"
	"log"
	"os"
	"os/signal"
	"regexp"
	"strconv"
	"syscall"

	"chatalk.fr/utils"
	stan "github.com/nats-io/stan.go"
	"golang.org/x/crypto/bcrypt"
)

type userManagRequest struct {
	Action  string `json:"action"`
	WsID    string `json:"ws-id"`
	Payload struct {
		UserID       string `json:"userid"`
		Username     string `json:"username"`
		Displayname  string `json:"displayname"`
		Email        string `json:"email"`
		Password     string `json:"password"`
		PasswordConf string `json:"passwordconf"`
	} `json:"payload"`
}

type userManagResponse struct {
	Success     bool   `json:"success"`
	Action      string `json:"action"`
	Error       string `json:"error,omitempty"`
	UserID      int    `json:"userid,omitempty"`
	Username    string `json:"username,omitempty"`
	Displayname string `json:"displayname,omitempty"`
	Picture     string `json:"picture,omitempty"`
	PublicKey   string `json:"picture,omitempty"`
}

func main() {
	log.Println("User management service started…")
	channelName := "service.user-manag"

	db := utils.DBConnect()
	nc, sc := utils.InitBus()

	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGINT, syscall.SIGTERM)

	sub, _ := sc.QueueSubscribe(channelName, channelName, func(m *stan.Msg) {
		log.Println("User management service is handling a new request")

		var msg userManagRequest
		err := json.Unmarshal(m.Data, &msg)
		if err != nil {
			log.Print("failed to parse JSON", err)
			return
		}

		var response userManagResponse
		response.Action = "user-manag"
		response.Success = true
		var userID int
		var change int
		// var allmembers string

		userID, _ = strconv.Atoi(msg.Payload.UserID)
		change = 0

		if msg.Payload.Username != "" && response.Success {
			re := regexp.MustCompile("[a-zA-Z0-9_]+")
			if !re.MatchString(msg.Payload.Username) {
				response.Success = false
				response.Error = "only alphanumeric and underscore characters are allowed"
			} else {
				_, err = db.Write().Query(`
					UPDATE users
					SET username = $1
					WHERE user_id = $2;
				`, msg.Payload.Username, userID)
				change = 1
			}
		}

		if msg.Payload.Displayname != "" && response.Success {
			_, err = db.Write().Query(`
				UPDATE users
				SET display_name = $1
				WHERE user_id = $2;
			`, msg.Payload.Displayname, userID)
			change = 1
		}

		if msg.Payload.Password != "" && response.Success {
			if msg.Payload.Password != msg.Payload.PasswordConf {
				response.Success = false
				response.Error = "both password fields do not match"
			} else if len(msg.Payload.Password) < 5 {
				response.Success = false
				response.Error = "password should be at least 5 characters long"
			} else {
				hash, err := bcrypt.GenerateFromPassword([]byte(msg.Payload.Password), 14)
				if err != nil {
					log.Print("failed to hash password", err)
					return
				}
				_, err = db.Write().Query(`
					UPDATE users
					SET pw_hash = $1
					WHERE user_id = $2;
				`, hash, userID)
				response.Success = true
				response.Error = "Changes Made"
			}
		}

		if change == 1 && response.Success {
			err = db.Read().QueryRow(`
			SELECT user_id, username, display_name, pic_url
			FROM users
			WHERE user_id = $1`, userID).Scan(&response.UserID,
				&response.Username, &response.Displayname, &response.Picture)

			err = db.Read().QueryRow(`
				SELECT pubkey
				FROM pubkeys
				WHERE user_id = $1;`, userID).Scan(&response.PublicKey)
			rows, _ := db.Read().Query(`
			SELECT user_id
			FROM users
			WHERE user_id != $1`, userID)

			jm, _ := json.Marshal(response)
			for rows.Next() {
				_ = rows.Scan(&userID)
				nc.Publish("user."+strconv.Itoa(userID), []byte(jm))
			}
		}

		j, _ := json.Marshal(response)
		nc.Publish("ws."+msg.WsID+".send", j)

	}, stan.DurableName(channelName))

	<-c

	sub.Unsubscribe()
	sc.Close()
}
