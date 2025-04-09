package userApis

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"serverless-tesseract/db"
	"serverless-tesseract/models"
)

// GetUser retrieves a user by ID
func GetUser(c *gin.Context) {
	// Extract user ID from URL parameter
	idParam := c.Param("id")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	// Find user by ID
	var user models.User
	result := db.DB.First(&user, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Return user data (excluding password hash for security)
	c.JSON(http.StatusOK, gin.H{
		"id":         user.ID,
		"email":      user.Email,
		"first_name": user.FirstName,
		"last_name":  user.LastName,
		"role":       user.Role,
		"created_at": user.CreatedAt,
	})
}
