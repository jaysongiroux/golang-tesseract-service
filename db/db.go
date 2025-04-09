package db

import (
	"log"
	"os"
	"serverless-tesseract/migrations"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/joho/godotenv"
)

var DB *gorm.DB

// ConnectDatabase initializes the database connection
func ConnectDatabase() {
	var err error

	// Load environment variables from .env file if it exists
	_ = godotenv.Load()

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL environment variable not set")
	}

	// Configure GORM
	config := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	}

	// Connect to the database
	DB, err = gorm.Open(postgres.Open(dsn), config)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Run migrations
	migrations.Run(DB)

	log.Println("Connected to database successfully")
}
