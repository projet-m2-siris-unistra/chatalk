package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/signal"
	"regexp"
	"strings"
	"syscall"

	dberror "github.com/Shyp/go-dberror"
	"github.com/google/uuid"
	_ "github.com/lib/pq"
	nats "github.com/nats-io/nats.go"
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

/*type err struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}*/

type registerResponse struct {
	Action   string `json:"action"`
	Success  bool   `json:"success"`
	Error    string `json:"errors,omitempty"` //Errors []err
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
	log.Println("Register service started…")
	channelName := "service.register"
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
		log.Println("register service is handling a new request")
		var msg registerRequest
		err := json.Unmarshal(m.Data, &msg)
		if err != nil {
			log.Print("failed to parse JSON", err)
			return
		}

		var response registerResponse

		re := regexp.MustCompile("[a-zA-Z0-9_]+")

		if !re.MatchString(msg.Payload.Username) {
			response = registerResponse{
				Action:  "register",
				Success: false,
				Error:   "Only alphanumeric and underscore characters are allowed.",
			}
		} else if !strings.Contains(msg.Payload.Email, "@") {
			response = registerResponse{
				Action:  "register",
				Success: false,
				Error:   "Not an email address",
			}
		} else if msg.Payload.Password != msg.Payload.PasswordConfirmation {
			response = registerResponse{
				Action:  "register",
				Success: false,
				Error:   "Both password fields do not match",
			}
		} else if len(msg.Payload.Password) < 5 {
			response = registerResponse{
				Action:  "register",
				Success: false,
				Error:   "Password is too weak",
			}
		} else {
			var userID int
			var userUsername, userEmail string

			hash, err := bcrypt.GenerateFromPassword([]byte(msg.Payload.Password), 14)
			if err != nil {
				log.Print("failed to hash password", err)
				return
			}

			err = db.QueryRow(`
				INSERT INTO users(username, email, pw_hash, display_name, status, pic_url)
				VALUES($1, $2, $3, NULL, NULL, NULL)
				RETURNING user_id, username, email;
			`, msg.Payload.Username, msg.Payload.Email, hash).Scan(&userID, &userUsername, &userEmail)

			if err == nil {
				response = registerResponse{
					Action:   "register",
					Success:  true,
					UserID:   userID,
					Username: userUsername,
					Email:    userEmail,
				}
				var req sendInfoRequest
				req = sendInfoRequest{
					Action: "all",
					WsID:   msg.WsID,
					UserID: userID,
				}
				j, _ := json.Marshal(req)
				sendInfo := fmt.Sprintf("service.%s", "sendInfo")
				sc.Publish(sendInfo, []byte(j))
			} else {
				dberr := dberror.GetError(err)
				switch e := dberr.(type) {
				case *dberror.Error:
					errmsg := e.Error()
					response = registerResponse{
						Action:  "register",
						Success: false,
						Error:   errmsg,
					}
				default:
					response = registerResponse{
						Action:  "register",
						Success: false,
					}
				}

			}
		}

		j, err := json.Marshal(response)
		nc.Publish("ws."+msg.WsID+".send", j)
	})

	<-c // just wait for terminaison signal to continue (exit)

	sub.Unsubscribe()
	sc.Close()
}
