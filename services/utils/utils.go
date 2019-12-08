package utils

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/google/uuid"
	"github.com/ludovicm67/go-rwdatabasepool"
	nats "github.com/nats-io/nats.go"
	stan "github.com/nats-io/stan.go"
)

// GetEnv get one environment variable, if not found will be set to `fallback` value
func GetEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

// DBConnect returns a read-write pool (DB_HOST = write (default), DB_HOST_READ = read)
func DBConnect() *rwdatabasepool.RWDatabasePool {
	var readDB, writeDB *sql.DB

	dbDb := GetEnv("DB_DB", "app")
	dbUser := GetEnv("DB_USER", "root")
	dbPass := GetEnv("DB_PASS", "root")
	dbMode := GetEnv("DB_MODE", "disable")
	dbHost := GetEnv("DB_HOST", "localhost")

	writeConnStr := fmt.Sprintf(
		"postgres://%s:%s@%s/%s?sslmode=%s",
		dbUser, dbPass, dbHost, dbDb, dbMode,
	)
	writeDB, err := sql.Open("postgres", writeConnStr)
	if err != nil {
		log.Fatal(err)
	}

	if dbHostRead, ok := os.LookupEnv("DB_HOST_READ"); ok {
		readConnStr := fmt.Sprintf(
			"postgres://%s:%s@%s/%s?sslmode=%s",
			dbUser, dbPass, dbHostRead, dbDb, dbMode,
		)
		readDB, err = sql.Open("postgres", readConnStr)
		if err != nil {
			log.Println(err)
			readDB = nil
		}
	}

	return rwdatabasepool.Init([]*sql.DB{writeDB}, []*sql.DB{readDB})
}

// InitBus instantiates Nats and Nats Streaming
func InitBus() (*nats.Conn, stan.Conn) {
	natsURL := GetEnv("NATS_URL", "nats://localhost:4222")
	clusterID := GetEnv("NATS_CLUSTER_ID", "nats-cluster")

	clientID := uuid.New().String()
	nc, err := nats.Connect(natsURL)
	if err != nil {
		log.Fatal(err)
	}

	sc, err := stan.Connect(clusterID, clientID, stan.NatsConn(nc))
	if err != nil {
		log.Fatal(err)
	}

	return nc, sc
}
