package main

import (
	"encoding/json"
	"log"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"syscall"

	"chatalk.fr/utils"
	_ "github.com/lib/pq"
	stan "github.com/nats-io/stan.go"
)

type convManagRequest struct {
	Action  string `json:"action"`
	WsID    string `json:"ws-id"`
	Payload struct {
		ConvID     string `json:"convid"`
		Convname   string `json:"convname,omitempty"`
		Convtopic  string `json:"convtopic,omitempty"`
		Newmembers string `json:"newmembers,omitempty"`
	} `json:"payload"`
}

type convManagResponse struct {
	Action    string `json:"action"`
	Success   bool   `json:"success"`
	Error     string `json:"error,omitempty"`
	Creator   int    `json:"creator,omitempty"`
	ConvID    string `json:"convid,omitempty"`
	Convname  string `json:"convname,omitempty"`
	Sharedkey string `json:"sharedkey,omitempty"`
	Members   string `json:"members,omitempty"`
}

func main() {
	log.Println("Conversation management service started…")
	channelName := "service.conv_manag"

	db := utils.DBConnect()
	nc, sc := utils.InitBus()

	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGINT, syscall.SIGTERM)

	sub, _ := sc.Subscribe(channelName, func(m *stan.Msg) {
		log.Println("conversation management service is handling a new request")

		var msg convManagRequest
		err := json.Unmarshal(m.Data, &msg)
		if err != nil {
			log.Print("failed to parse JSON", err)
			return
		}

		var response convManagResponse
		response.Success = true
		var convID int
		var userID int
		var change int
		var members []int
		var spliMem []string
		// var allmembers string

		change = 0

		spliMem = strings.Split(msg.Payload.Newmembers, "}")
		spliMem = strings.Split(spliMem[0], "{")
		spliMem = strings.Split(spliMem[1], ",")

		for _, v := range spliMem {
			userID, _ = strconv.Atoi(v)
			members = append(members, userID)
		}

		convID, err = strconv.Atoi(msg.Payload.ConvID)

		if err != nil {
			response = convManagResponse{
				Action:  "conv_manag",
				Success: false,
				Error:   "Conversation ID is not valid",
			}
		}

		if msg.Payload.Convname != "" && response.Success {
			_, err = db.Write().Query(`
				UPDATE conversations
				SET convname = $1
				WHERE conv_id = $2;
			`, msg.Payload.Convname, convID)
			change = 1
		}

		if msg.Payload.Convtopic != "" && response.Success {
			_, err = db.Write().Query(`
				UPDATE conversations
				SET topic = $1
				WHERE conv_id = $2;
			`, msg.Payload.Convtopic, convID)
			change = 1
		}

		if len(members) > 0 && response.Success {
			for _, v := range members {
				_, err = db.Write().Query(
					`INSERT INTO conv_keys(user_id, conv_id, shared_key, timefrom, timeto, favorite, audio)
					VALUES($1, $2, 0, current_timestamp, NULL, false, false);`, v, convID)
			}
			change = 1
		}

		if change == 1 && response.Success {
			err = db.Read().QueryRow(`
				SELECT c.conv_id,
								c.convname,
								q.shared_key,
								ARRAY_AGG(q.user_id) users
				FROM conversations c, conv_keys q
				WHERE c.conv_id =$1
				AND c.conv_id = q.conv_id
				GROUP BY c.conv_id, c.convname, q.shared_key`, convID).Scan(&response.ConvID, &response.Convname, &response.Sharedkey, &response.Members)

			if err != nil {
				response = convManagResponse{
					Action:  "conv_manag",
					Success: false,
					Error:   "Issue on Database, reload later",
				}
			}

		}
		// to old members send a conv-mana msg
		// to new members send a conv-creation msg with creator 0

		response = convManagResponse{
			Action:  "conv_manag",
			Success: false,
			Error:   "Processing",
		}
		j, err := json.Marshal(response)
		nc.Publish("ws."+msg.WsID+".send", j)

	})

	<-c

	sub.Unsubscribe()
	sc.Close()
}
