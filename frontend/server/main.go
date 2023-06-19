package main

import (
	"log"
	"net/http"
	"os"

	_ "github.com/mattn/go-sqlite3"
	"github.com/sirupsen/logrus"
)

func initLogger() {
	logrus.SetFormatter(&logrus.TextFormatter{
		FullTimestamp:   true,
		TimestampFormat: "2006-01-02 15:04:05",
	})
	logrus.SetReportCaller(true)
}

func main() {
	initLogger()
	// Connect to sql
	db, err := initDB()
	if err != nil {
		logrus.Error("Failed to initialize database: ", err)
		os.Exit(1)
	}
	defer db.Close()

	// Test database connection
	err = db.Ping()
	if err != nil {
		logrus.Error("Failed to ping database: ", err)
		os.Exit(1)
	}
	logrus.Info("Successfully pinged database")
	http.HandleFunc("/db/store-result", storeResultHandler(db))
	http.HandleFunc("/db/store-session", StoreChatSession(db))

	http.HandleFunc("/db/fetch-sessions", FetchChatSessions(db))

	http.HandleFunc("/newchat", createNewChat)

	// Serve static files
	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/", fs)

	// Start the server
	log.Println("Listening on :3000...")
	err = http.ListenAndServe(":3000", nil)
	if err != nil {
		log.Fatal(err)
	}
}
