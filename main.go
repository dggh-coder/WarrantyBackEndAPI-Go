package main

import (
	"log"
	"os"
	"time"

	"warrantybackendapi-go/config"
	"warrantybackendapi-go/models"
	"warrantybackendapi-go/routes"
	"warrantybackendapi-go/scheduler"
)

func main() {
	config.LoadEnv()

	dbConfig := config.LoadDatabaseConfig()
	db, err := config.ConnectDatabase(dbConfig)
	if err != nil {
		log.Fatalf("database connection failed: %v", err)
	}

	if err := models.AutoMigrate(db); err != nil {
		log.Fatalf("auto migration failed: %v", err)
	}

	interval := 24 * time.Hour
	if os.Getenv("SCHEDULER_INTERVAL") != "" {
		if parsed, err := time.ParseDuration(os.Getenv("SCHEDULER_INTERVAL")); err == nil {
			interval = parsed
		} else {
			log.Printf("invalid SCHEDULER_INTERVAL, using default 24h: %v", err)
		}
	}

	scheduler.NewReminderScheduler(db, interval).Start()

	router := routes.SetupRouter(db)
	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("server listening on :%s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
