package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/google/uuid"
	_ "github.com/lib/pq"
	nats "github.com/nats-io/nats.go"
	stan "github.com/nats-io/stan.go"
	"golang.org/x/crypto/bcrypt"
)

type loginRequest struct {
	Action  string `json:"action"`
	WsID    string `json:"ws-id"`
	Payload struct {
		Username string `json:"username"`
		Password string `json:"password"`
	} `json:"payload"`
}

type loginResponse struct {
	Success     bool    `json:"success"`
	Action      string  `json:"action"`
	Error       string  `json:"error,omitempty"`
	WsID        string  `json:"ws-id,omitempty"`
	UserID      int     `json:"userid,omitempty"`
	Username    *string `json:"username,omitempty"`
	Displayname *string `json:"displayname,omitempty"`
	Picture     *string `json:"picture,omitempty"`
}

type sendInfoRequest struct {
	Action string `json:"action"`
	WsID   string `json:"ws-id"`
	UserID int    `json:"userid"`
}

// get environment variable, if not found will be set to `fallback` value
func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

// connect to a PostgreSQL database
func dbConnect() *sql.DB {
	dbHost := getEnv("DB_HOST", "localhost")
	dbDb := getEnv("DB_DB", "app")
	dbUser := getEnv("DB_USER", "root")
	dbPass := getEnv("DB_PASS", "root")
	dbMode := getEnv("DB_MODE", "disable")

	connStr := fmt.Sprintf("postgres://%s:%s@%s/%s?sslmode=%s", dbUser, dbPass, dbHost, dbDb, dbMode)
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}

	return db
}

func main() {
	log.Println("Login service started…")
	channelName := "service.login"
	db := dbConnect()

	natsURL := getEnv("NATS_URL", "nats://localhost:4222")
	clusterID := getEnv("NATS_CLUSTER_ID", "nats-cluster")
	clientID := uuid.New().String()
	nc, err := nats.Connect(natsURL)
	if err != nil {
		log.Fatal(err)
	}

	sc, err := stan.Connect(clusterID, clientID, stan.NatsConn(nc))
	if err != nil {
		log.Fatal(err)
	}

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

		var response loginResponse
		var userID int
		var hash []byte
		var dispName, picURL, userUsername *string

		if err != nil {
			log.Print("failed to hash password", err)
			return
		}

		if msg.Payload.Password == "" {
			message := fmt.Sprintf("No password given")

			response = loginResponse{
				Success: false,
				Error:   message,
			}
		} else if msg.Payload.Username == "" {
			message := fmt.Sprintf("No username given")

			response = loginResponse{
				Success: false,
				Error:   message,
			}
		} else {
			row := db.QueryRow(`
			SELECT user_id, pw_hash, display_name, pic_url, username
			FROM users
			WHERE username = $1;
		`, msg.Payload.Username)

			errSQL := row.Scan(&userID, &hash, &dispName, &picURL, &userUsername)

			switch errSQL {
			case sql.ErrNoRows:
				log.Println("No rows were returned!")
				message := fmt.Sprintf("User not registered")

				response = loginResponse{
					Success: false,
					Action:  "login",
					Error:   message,
				}
			case nil:
				errHash := bcrypt.CompareHashAndPassword(hash, []byte(msg.Payload.Password))
				if errHash == nil {

					response = loginResponse{
						Success:     true,
						Action:      "login",
						WsID:        msg.WsID,
						UserID:      userID,
						Username:    userUsername,
						Displayname: dispName,
						Picture:     picURL,
					}

					var req sendInfoRequest
					req = sendInfoRequest{
						Action: "all",
						WsID:   msg.WsID,
						UserID: userID,
					}

					j, _ := json.Marshal(req)
					sendInfo := fmt.Sprintf("service.%s", "send-info")
					sc.Publish(sendInfo, []byte(j))
				} else {
					message := fmt.Sprintf("Password not ok")

					response = loginResponse{
						Success: false,
						Action:  "login",
						Error:   message,
					}
				}
			default:
				message := fmt.Sprintf("ERROR")

				response = loginResponse{
					Success: false,
					Action:  "login",
					Error:   message,
				}
			}
		}

		j, err := json.Marshal(response)
		nc.Publish("ws."+msg.WsID+".send", j)

	})

	<-c

	sub.Unsubscribe()
	sc.Close()
}
