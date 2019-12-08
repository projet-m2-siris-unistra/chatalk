package main

import (
	"encoding/json"
	"errors"
	"log"
	"os"
	"os/signal"
	"regexp"
	"strings"
	"syscall"

	"chatalk.fr/utils"
	dberror "github.com/Shyp/go-dberror"
	stan "github.com/nats-io/stan.go"
	"golang.org/x/crypto/bcrypt"
)

type registerRequest struct {
	Action  string `json:"action"`
	WsID    string `json:"ws-id"`
	Payload struct {
		Username             string `json:"username"`
		Email                string `json:"email"`
		Password             string `json:"password"`
		PasswordConfirmation string `json:"password-confirmation"`
	} `json:"payload"`
}

type registerResponse struct {
	Action   string `json:"action"`
	Success  bool   `json:"success"`
	Error    string `json:"error,omitempty"`
	WsID     string `json:"ws-id,omitempty"`
	UserID   int    `json:"userid,omitempty"`
	Username string `json:"username,omitempty"`
	Email    string `json:"email,omitempty"`
}

type sendInfoRequest struct {
	Action string `json:"action"`
	WsID   string `json:"ws-id"`
	UserID int    `json:"userid"`
}

func verifyPayload(request registerRequest) error {
	re := regexp.MustCompile("[a-zA-Z0-9_]+")
	if !re.MatchString(request.Payload.Username) {
		return errors.New("only alphanumeric and underscore characters are allowed")
	} else if !strings.Contains(request.Payload.Email, "@") {
		return errors.New("not a email address")
	} else if request.Payload.Password != request.Payload.PasswordConfirmation {
		return errors.New("both password fields do not match")
	} else if len(request.Payload.Password) < 5 {
		return errors.New("password should be at least 5 characters long")
	}
	return nil
}

func triggerSendInfos(sc stan.Conn, wsID string, userID int) {
	req := sendInfoRequest{
		Action: "send-info",
		WsID:   wsID,
		UserID: userID,
	}
	j, _ := json.Marshal(req)
	sc.Publish("service.send-info", []byte(j))
}

func main() {
	log.Println("register service started…")
	channelName := "service.register"

	db := utils.DBConnect()
	nc, sc := utils.InitBus()

	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGINT, syscall.SIGTERM)

	sub, _ := sc.Subscribe(channelName, func(m *stan.Msg) {
		log.Println("register service is handling a new request")

		var msg registerRequest
		err := json.Unmarshal(m.Data, &msg)
		if err != nil {
			log.Print("failed to parse JSON", err)
			return
		}

		response := registerResponse{
			Action:  "register",
			Success: false,
		}

		err = verifyPayload(msg)
		if err != nil {
			response.Error = err.Error()
		} else {
			var userID int
			var userUsername, userEmail string

			hash, err := bcrypt.GenerateFromPassword([]byte(msg.Payload.Password), 14)
			if err != nil {
				log.Print("failed to hash password", err)
				return
			}

			err = db.Write().QueryRow(`
				INSERT INTO users(username, email, pw_hash, display_name, status, pic_url)
				VALUES($1, $2, $3, NULL, NULL, NULL)
				RETURNING user_id, username, email;
			`, msg.Payload.Username, msg.Payload.Email, hash).Scan(&userID, &userUsername, &userEmail)

			if err != nil {
				dberr := dberror.GetError(err)
				switch e := dberr.(type) {
				case *dberror.Error:
					response.Error = e.Error()
				default:
					response.Error = "unknown error"
				}
			} else {
				response.Success = true
				response.UserID = userID
				response.Username = userUsername
				response.Email = userEmail

				triggerSendInfos(sc, msg.WsID, userID)
			}
		}

		j, err := json.Marshal(response)
		nc.Publish("ws."+msg.WsID+".send", j)
	})

	<-c // just wait for terminaison signal to continue (exit)

	sub.Unsubscribe()
	sc.Close()
}
