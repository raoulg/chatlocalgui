package main

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
	_ "github.com/mattn/go-sqlite3"
	"github.com/sirupsen/logrus"
)

// type User struct {
// 	ID           uuid.UUID `db:"id"`
// 	Username     string    `db:"username"`
// 	PasswordHash string    `db:"password_hash"`
// 	Email        string    `db:"email"`
// }

type Session struct {
	ID        uuid.UUID `json:"id"`
	Title     string    `json:"title"`
	Timestamp string    `json:"timestamp"`
}

type Message struct {
	ID        uuid.UUID `db:"id"`
	ChatID    uuid.UUID `db:"chat_id"`
	Content   string    `db:"content"`
	Sources   string    `db:"sources"`
	IsBot     bool      `db:"is_bot"`
	Timestamp time.Time `db:"timestamp"`
}

func createNewChat(w http.ResponseWriter, r *http.Request) {
	chatID := uuid.New()
	timestamp := time.Now().Format("2006-01-02 15:04:05")

	chat := Session{
		ID:        chatID,
		Timestamp: timestamp,
		Title:     "Untitled",
	}

	json.NewEncoder(w).Encode(chat)
}

func FetchChatSessions(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Query the database to fetch the chat sessions
		rows, err := db.Query("SELECT id, title, timestamp FROM chats ORDER BY timestamp DESC LIMIT 10")
		if err != nil {
			http.Error(w, "Failed to fetch chat sessions", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		// Create a struct to store the retrieved sessions
		var sessions []Session

		// Iterate over the rows and populate the sessions struct
		for rows.Next() {
			var session Session
			if err := rows.Scan(&session.ID, &session.Title, &session.Timestamp); err != nil {
				logrus.Error("Failed to scan row: ", err)
				http.Error(w, "Failed to fetch chat sessions", http.StatusInternalServerError)
				return
			}
			sessions = append(sessions, session)
		}

		// Convert the sessions struct to JSON
		response, err := json.Marshal(sessions)
		if err != nil {
			logrus.Error("Failed to marshal sessions: ", err)
			http.Error(w, "Failed to fetch chat sessions", http.StatusInternalServerError)
			return
		}
		logrus.Info("Successfully fetched chat sessions")

		// Set the Content-Type header and write the response
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(response)
	}
}

func StoreChatSession(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var chatSession Session

		if err := json.NewDecoder(r.Body).Decode(&chatSession); err != nil {
			http.Error(w, "Failed to parse request body", http.StatusBadRequest)
			return
		}

		// Store the chat session in the database
		_, err := db.Exec("INSERT INTO chats (id, timestamp, title) VALUES ($1, $2, $3)", chatSession.ID, chatSession.Timestamp, chatSession.Title)
		if err != nil {
			http.Error(w, "Failed to store chat session", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}

func initDB() (*sql.DB, error) {
	db, err := sql.Open("sqlite3", "./db/sqlite3_data.db")
	if err != nil {
		logrus.Error("failed to connect to database: ", err)
		return nil, err
	}

	// Create tables if they don't exist
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			username TEXT NOT NULL,
			password_hash TEXT NOT NULL,
			email TEXT
		);

		CREATE TABLE IF NOT EXISTS chats (
			id TEXT PRIMARY KEY,
			user_id TEXT,
			timestamp TIMESTAMP,
			title TEXT,
			FOREIGN KEY(user_id) REFERENCES users(id)
		);

		CREATE TABLE IF NOT EXISTS messages (
			id INTEGER PRIMARY KEY,
			chat_id TEXT,
			content TEXT,
			sources TEXT,
			is_bot BOOLEAN,
			timestamp TIMESTAMP,
			FOREIGN KEY(chat_id) REFERENCES chats(id)
		);
	`)

	if err != nil {
		logrus.Error("failed to created tables: ", err)
		return nil, err
	}
	logrus.Info("successfully initialized the database")

	return db, nil
}

func storeResultHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Parse the request JSON
		var request struct {
			Question string `json:"question"`
			Answer   string `json:"answer"`
			Sources  string `json:"sources"`
			Chatid   string `json:"chatid"`
		}

		// debugging request, printing to console
		logrus.Info("request received by storeResultHandler: ", r.Body)

		err := json.NewDecoder(r.Body).Decode(&request)
		if err != nil {
			logrus.Error("failed to parse request JSON: ", err)
			http.Error(w, "failed to parse request JSON", http.StatusBadRequest)
			return
		} else {
			logrus.Info("successfully parsed request JSON: ", request)
		}

		// Insert the result into the database
		stmt, err := db.Prepare(`
			INSERT INTO messages (chat_id, content, sources, is_bot, timestamp)
			VALUES (?, ?, ?, ?, ?)
		`)

		if err != nil {
			logrus.Error("failed to prepare database statement: ", err)
			http.Error(w, "failed to prepare database statement", http.StatusInternalServerError)
			return
		}

		_, err = stmt.Exec(request.Chatid, request.Answer, request.Sources, true, time.Now())
		if err != nil {
			logrus.Error("failed to insert message into the database: ", err)
			http.Error(w, "failed to insert message into the database", http.StatusInternalServerError)
			return
		}
		logrus.Info("successfully inserted into the database")

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)

		// Return an empty JSON object as the response
		w.Write([]byte("{}"))
	}
}
