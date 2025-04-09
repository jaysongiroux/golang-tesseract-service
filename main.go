package main

import (
	"log"

	"github.com/gin-gonic/gin"

	"github.com/joho/godotenv"

	authApis "serverless-tesseract/apis/auth"
	organizationApis "serverless-tesseract/apis/organization"
	serviceApis "serverless-tesseract/apis/service"
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
	auth := r.Group("/api/auth")
	auth.POST("/login", authApis.HandleLogin)
	auth.POST("/renew-token", authApis.RenewToken)
	auth.POST("/register", authApis.HandleRegister)

	// Create a group for protected organization routes
	org := r.Group("/api/organization")
	// Create a group for protected user routes
	user := r.Group("/api/user")
	// Create a group for protected API service routes
	service := r.Group("/api/service")

	// Apply auth middleware only to the protected routes
	org.Use(authApis.AuthMiddleware())
	user.Use(authApis.AuthMiddleware())
	service.Use(authApis.APIMiddleware())

	// User routes
	user.GET("/user/:id", userApis.GetUser)

	// Organization routes
	org.POST("/", organizationApis.CreateOrganization)
	org.GET("/organizations", organizationApis.GetOrganizations)
	org.GET("/:organization_id/members", organizationApis.GetOrganizationMembers)
	org.GET("/:organization_id", organizationApis.GetOrganization)
	org.POST("/:organization_id/api-key", organizationApis.CreateOrganizationMemberAPI)

	// service routes
	service.POST("/ocr", serviceApis.OCRService)

	// Start the server
	log.Println("Server starting on port 8001")
	r.Run(":8001")
}
