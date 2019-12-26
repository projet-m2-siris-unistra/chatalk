package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"chatalk.fr/utils"
	"github.com/dgrijalva/jwt-go"
	"github.com/ludovicm67/go-rwdatabasepool"
	stan "github.com/nats-io/stan.go"
	"golang.org/x/crypto/bcrypt"
	"gopkg.in/guregu/null.v3"
)

type claim struct {
	UserID int `json:"user-id"`
	jwt.StandardClaims
}

type loginRequest struct {
	Action  string `json:"action"`
	WsID    string `json:"ws-id"`
	Payload struct {
		Method   string `json:"method"` // "standard" or "jwt"
		Action   string `json:"action"` // "login" or "refresh"
		Username string `json:"username,omitempty"`
		Password string `json:"password,omitempty"`
		Token    string `json:"token,omitempty"`
	} `json:"payload"`
}

type loginResponse struct {
	Success     bool        `json:"success"`
	Action      string      `json:"action"`
	Error       string      `json:"error,omitempty"`
	WsID        string      `json:"ws-id,omitempty"`
	UserID      int         `json:"userid,omitempty"`
	Username    string      `json:"username,omitempty"`
	Displayname null.String `json:"displayname,omitempty"`
	Picture     null.String `json:"picture,omitempty"`
	Token       null.String `json:"token,omitempty"`
}

type sendInfoRequest struct {
	Action string `json:"action"`
	WsID   string `json:"ws-id"`
	UserID int    `json:"userid"`
}

// default response
func initResponse() loginResponse {
	return loginResponse{
		Action:  "login",
		Success: false,
	}
}

func verifyStandardPayload(request loginRequest) error {
	if request.Payload.Password == "" {
		return errors.New("no password given")
	} else if request.Payload.Username == "" {
		return errors.New("no username given")
	}
	return nil
}

func verifyTokenPayload(request loginRequest) error {
	if request.Payload.Token == "" {
		return errors.New("no token given")
	}
	return nil
}

func generateToken(userID int) (string, error) {
	expirationTime := time.Now().Add(5 * time.Minute) // token expires in 5 minutes
	userClaim := &claim{
		UserID: userID,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, userClaim)
	jwtKey := []byte(utils.GetEnv("JWT_SECRET", "jwt-secret-key"))
	return token.SignedString(jwtKey)
}

func standardLoginPayloadHandler(request loginRequest, db *rwdatabasepool.RWDatabasePool) loginResponse {
	response := initResponse()
	payload := request.Payload

	// verify payload
	err := verifyStandardPayload(request)
	if err != nil {
		response.Error = err.Error()
		return response
	}

	// find user by username or email
	row := db.Read().QueryRow(`
		SELECT user_id, pw_hash, display_name, pic_url, username
		FROM users
		WHERE username = $1 OR email = $1;
	`, payload.Username)

	var userID int
	var hash []byte
	var dispName, picURL null.String
	var userUsername string
	err = row.Scan(&userID, &hash, &dispName, &picURL, &userUsername)

	switch err {
	case sql.ErrNoRows:
		response.Error = "user not registred"
	case nil:
		err := bcrypt.CompareHashAndPassword(hash, []byte(payload.Password))
		if err != nil {
			response.Error = "bad password"
			return response
		}

		// generate JWT token (expires in 5min)
		token, err := generateToken(userID)
		if err != nil {
			response.Error = "could not generate token"
			return response
		}

		response.Success = true
		response.UserID = userID
		response.Username = userUsername
		response.Displayname = dispName
		response.Picture = picURL
		response.Token = null.StringFrom(token)
	default:
		response.Error = err.Error()
	}

	return response
}

func jwtLoginPayloadHandler(request loginRequest, db *rwdatabasepool.RWDatabasePool) loginResponse {
	response := initResponse()

	return response
}

func jwtRefreshPayloadHandler(request loginRequest, db *rwdatabasepool.RWDatabasePool) loginResponse {
	response := initResponse()

	return response
}

func callPayloadHandler(request loginRequest, db *rwdatabasepool.RWDatabasePool) loginResponse {
	payload := request.Payload

	if payload.Method == "jwt" {
		// login using a JWT token
		if payload.Action == "login" {
			return jwtLoginPayloadHandler(request, db)
		}

		// refresh the JWT token
		if payload.Action == "refresh" {
			return jwtRefreshPayloadHandler(request, db)
		}

		// bad action
		return loginResponse{
			Action:  "login",
			Success: false,
			Error:   "bad action or unspecified action for JWT login",
		}
	}

	return standardLoginPayloadHandler(request, db)
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
	log.Println("login service started…")
	channelName := "service.login"

	db := utils.DBConnect()
	nc, sc := utils.InitBus()

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

		response := callPayloadHandler(msg, db)
		if response.Success {
			topicName := "user." + strconv.Itoa(response.UserID)
			nc.Publish("ws."+msg.WsID+".sub", []byte(topicName))
			triggerSendInfos(sc, msg.WsID, response.UserID)
		}

		j, err := json.Marshal(response)
		nc.Publish("ws."+msg.WsID+".send", j)
	})

	<-c

	sub.Unsubscribe()
	sc.Close()
}
