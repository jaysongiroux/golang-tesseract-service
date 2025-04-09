package main

import (
	"log"

	"github.com/gin-gonic/gin"

	"github.com/joho/godotenv"

	authApis "serverless-tesseract/apis/auth"
	organizationApis "serverless-tesseract/apis/organization"
	userApis "serverless-tesseract/apis/user"
	"serverless-tesseract/db"
)

func main() {
	// Load .env file if it exists
	_ = godotenv.Load()

	// Initialize database connection
	db.ConnectDatabase()

	r := gin.Default()

	// Public routes
	r.POST("/login", authApis.HandleLogin)
	r.POST("/renew-token", authApis.RenewToken)
	r.POST("/register", authApis.HandleRegister)

	// Create a group for protected routes
	api := r.Group("/api")
	// Apply auth middleware only to the /api routes
	api.Use(authApis.AuthMiddleware())

	// User routes
	api.GET("/user/:id", userApis.GetUser)

	// Organization routes
	api.POST("/organization", organizationApis.CreateOrganization)
	api.GET("/organizations", organizationApis.GetOrganizations)
	// Start the server
	log.Println("Server starting on port 8001")
	r.Run(":8001")
}
