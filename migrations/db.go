package migrations

import (
	"log"
	"time"

	"gorm.io/gorm"

	"serverless-tesseract/models"
)

// Run executes all migrations
func Run(db *gorm.DB) {
	startTime := time.Now()
	log.Println("Starting database migrations...")

	// AutoMigrate will create tables and add missing columns
	err := db.AutoMigrate(
		&models.User{},
		&models.Organization{},
		&models.OrganizationMember{},
		&models.OrganizationMemberAPI{},
		&models.OrganizationFileCache{},
	)

	if err != nil {
		log.Fatalf("Migration failed: %v", err)
	}

	log.Printf("Migration completed successfully in %v", time.Since(startTime))
}
