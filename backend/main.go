package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"

	"github.com/joho/godotenv"

	authApis "serverless-tesseract/apis/auth"
	serviceApis "serverless-tesseract/apis/service"

	_ "serverless-tesseract/docs"

	"github.com/gin-contrib/cors"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

//	@title			OCR API
//	@version		1.0
//	@description	This is a lightweight API with JWT authentication for OCR and LLM services.

//	@license.name	MIT
//	@license.url	https://opensource.org/licenses/MIT

// @host		localhost:8001
// @BasePath	/api/
func main() {
	// Load .env file if it exists
	_ = godotenv.Load()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "X-API-Key"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Create a group for protected API service routes
	service := r.Group("/api/service")

	service.Use(authApis.APIMiddleware())

	// service routes
	service.POST("/ocr", serviceApis.OCRService2)

	// conditionally serve swagger docs
	if os.Getenv("ENV") == "development" {
		log.Println("Serving swagger docs on /swagger")
		r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	}

	// Start the server
	log.Println("Server starting on port 8001")
	r.Run(":8001")
}
