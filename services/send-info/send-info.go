package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/signal"
	"reflect"
	"syscall"
	"strconv"

	dberror "github.com/Shyp/go-dberror"
	"github.com/google/uuid"
	_ "github.com/lib/pq"
	nats "github.com/nats-io/nats.go"
	stan "github.com/nats-io/stan.go"
)

type sendInfoRequest struct {
	Action string `json:"action"`
	WsID   string `json:"ws-id"`
	UserID int    `json:"userid"`
}

type User struct {
	UserID      int        `json:"userid"`
	Username    string     `json:"username"`
	DisplayName NullString `json:"displayname"`
	PictureUrl  NullString `json:"picture"`
}

type Conv struct {
	ConvID    int    `json:"convid"`
	Convname  string `json:"convname"`
	SharedKey string `json:"shared_key"`
	Members   string `json:"members"`
}

type sendInfoResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error,omitempty"`
	Users   []User `json:"users,omitempty"`
	Convs   []Conv `json:"convs,omitempty"`
}

type NullString sql.NullString

// Scan implements the Scanner interface for NullString
func (ns *NullString) Scan(value interface{}) error {
	var s sql.NullString
	if err := s.Scan(value); err != nil {
		return err
	}

	// if nil then make Valid false
	if reflect.TypeOf(value) == nil {
		*ns = NullString{s.String, false}
	} else {
		*ns = NullString{s.String, true}
	}

	return nil
}

// MarshalJSON for NullString
func (ns *NullString) MarshalJSON() ([]byte, error) {
	log.Println("ouais")
	if !ns.Valid {
		log.Println("ouais1")
		return []byte("null"), nil
	}
	return json.Marshal(ns.String)
}

// UnmarshalJSON for NullString
func (ns *NullString) UnmarshalJSON(b []byte) error {
	err := json.Unmarshal(b, &ns.String)
	ns.Valid = (err == nil)
	return err
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
	log.Println("Send Information service started…")
	channelName := "service.send-info"
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
		log.Println("Send Information service is handling a new request")
		var msg sendInfoRequest
		err := json.Unmarshal(m.Data, &msg)
		if err != nil {
			log.Print("failed to parse JSON", err)
			return
		}

		var response sendInfoResponse
		var uId int
		var usrname string
		var dispName, picUrl NullString
		var usersArr []User
		var cnv Conv
		var convsArr []Conv
		userID := msg.UserID

		rows, err := db.Query(`
		SELECT user_id, username, display_name, pic_url
		FROM users`)

		if err != nil {
			response = sendInfoResponse{
				Success: false,
				Error:   "Issue on Database, reload later",
			}
			goto send_msg
		}

		for rows.Next() {
			err := rows.Scan(&uId, &usrname, &dispName, &picUrl)
			if err == sql.ErrNoRows {
				log.Println("No rows were returned!")
				response = sendInfoResponse{
					Success: false,
					Error:   "No rows were returned!",
				}
				goto send_msg
			} else if err != nil {
				dberr := dberror.GetError(err)
				switch e := dberr.(type) {
				case *dberror.Error:
					errmsg := e.Error()
					response = sendInfoResponse{
						Success: false,
						Error:   errmsg,
					}
				default:
					log.Println("err:", err)
					response = sendInfoResponse{
						Success: false,
					}
				}
				goto send_msg
			}

			usersArr = append(usersArr, User{UserID: uId, Username: usrname, DisplayName: dispName, PictureUrl: picUrl})
		}
		rows.Close()

		rows, err = db.Query(`
		SELECT c.conv_id,
						c.convname,
						k.shared_key,
						ARRAY_AGG(q.user_id) users
		FROM conversations c, conv_keys k, conv_keys q
		WHERE k.user_id = $1
		AND k.conv_id = c.conv_id
		AND k.conv_id = q.conv_id
		GROUP BY c.conv_id, c.convname, k.shared_key`, userID)

		if err != nil {
			response = sendInfoResponse{
				Success: false,
				Error:   "Issue on Database, reload later",
			}
			goto send_msg
		}

		for rows.Next() {
			err := rows.Scan(&cnv.ConvID, &cnv.Convname, &cnv.SharedKey, &cnv.Members)
			if err != nil {
				log.Println("err:", err)
				response = sendInfoResponse{
					Success: false,
					Error:   "Issue on Database, reload later",
				}
				goto send_msg
			}

			convsArr = append(convsArr, cnv)
			topicName := "conv." + strconv.Itoa(cnv.ConvID)
			nc.Publish("ws."+msg.WsID+".sub", []byte(topicName))
		}
		rows.Close()

		response = sendInfoResponse{
			Success: true,
			Users:   usersArr,
			Convs:   convsArr,
		}

	send_msg:
		j, err := json.Marshal(response)
		nc.Publish("ws."+msg.WsID+".send", j)

	})

	<-c

	sub.Unsubscribe()
	sc.Close()
}
