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
	stan "github.com/nats-io/stan.go"
	"golang.org/x/crypto/bcrypt"
	"gopkg.in/guregu/null.v3"
)

// global variables
var db = utils.DBConnect()
var nc, sc = utils.InitBus()
var jwtKey = []byte(utils.GetEnv("JWT_SECRET", "jwt-secret-key"))

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
	Type        string      `json:"type,omitempty"`
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
	expirationTime := time.Now().Add(60 * time.Minute) // token expires in 1 hour
	userClaim := &claim{
		UserID: userID,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, userClaim)
	return token.SignedString(jwtKey)
}

func standardLoginPayloadHandler(request loginRequest) loginResponse {
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

		// generate JWT token
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

// returns (userID, error)
func checkToken(jwtToken string) (int, error) {
	userClaim := &claim{}
	token, err := jwt.ParseWithClaims(jwtToken, userClaim, func(t *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})
	if err != nil {
		if err == jwt.ErrSignatureInvalid {
			return 0, errors.New("invalid token signature")
		}
		return 0, errors.New("session has expired, please log in again")
	}
	if !token.Valid {
		return 0, errors.New("invalid token")
	}
	return userClaim.UserID, nil
}

func jwtLoginPayloadHandler(request loginRequest) loginResponse {
	response := initResponse()

	// verify payload
	err := verifyTokenPayload(request)
	if err != nil {
		response.Error = err.Error()
		return response
	}

	// check token
	userID, err := checkToken(request.Payload.Token)
	if err != nil {
		response.Error = err.Error()
		return response
	}

	// find user by user id
	row := db.Read().QueryRow(`
		SELECT display_name, pic_url, username
		FROM users
		WHERE user_id = $1;
	`, userID)

	var dispName, picURL null.String
	var userUsername string
	err = row.Scan(&dispName, &picURL, &userUsername)

	switch err {
	case sql.ErrNoRows:
		response.Error = "user not registred"
	case nil:
		// generate JWT token
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

func jwtRefreshPayloadHandler(request loginRequest) loginResponse {
	response := initResponse()
	response.Type = "token-refresh"

	// verify payload
	err := verifyTokenPayload(request)
	if err != nil {
		response.Error = err.Error()
		return response
	}

	// check token
	userID, err := checkToken(request.Payload.Token)
	if err != nil {
		response.Error = err.Error()
		return response
	}

	// generate a new JWT token
	token, err := generateToken(userID)
	if err != nil {
		response.Error = "could not generate a new token"
		return response
	}

	response.Success = true
	response.Token = null.StringFrom(token)

	return response
}

func jwtLogoutPayloadHandler(request loginRequest) loginResponse {
	response := initResponse()
	response.Type = "logout"

	// verify payload
	err := verifyTokenPayload(request)
	if err != nil {
		response.Error = err.Error()
		return response
	}

	response.Success = true
	return response
}

func callPayloadHandler(request loginRequest) loginResponse {
	payload := request.Payload

	if payload.Method == "jwt" {
		// login using a JWT token
		if payload.Action == "login" {
			return jwtLoginPayloadHandler(request)
		}

		// refresh the JWT token
		if payload.Action == "refresh" {
			return jwtRefreshPayloadHandler(request)
		}

		// log the user out from his current device
		if payload.Action == "logout" {
			return jwtLogoutPayloadHandler(request)
		}

		// bad action
		return loginResponse{
			Action:  "login",
			Success: false,
			Error:   "bad action or unspecified action for JWT login",
		}
	}

	return standardLoginPayloadHandler(request)
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

	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGINT, syscall.SIGTERM)

	sub, _ := sc.QueueSubscribe(channelName, channelName, func(m *stan.Msg) {
		log.Println("login service is handling a new request")

		var msg loginRequest
		err := json.Unmarshal(m.Data, &msg)
		if err != nil {
			log.Print("failed to parse JSON", err)
			return
		}

		response := callPayloadHandler(msg)
		if response.Success {
			topicName := "user." + strconv.Itoa(response.UserID)
			nc.Publish("ws."+msg.WsID+".sub", []byte(topicName))
			triggerSendInfos(sc, msg.WsID, response.UserID)
		}

		j, err := json.Marshal(response)
		nc.Publish("ws."+msg.WsID+".send", j)
	}, stan.DurableName(channelName))

	<-c

	sub.Unsubscribe()
	sc.Close()
}
