package authApis

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"serverless-tesseract/db"
	"serverless-tesseract/models"
	"serverless-tesseract/utils"
)

// RenewToken handles token refresh
func RenewToken(c *gin.Context) {
	tokenString := c.GetHeader("Authorization")

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(utils.SECRET_KEY), nil
	})

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	email := claims["email"].(string)

	var user models.User
	result := db.DB.Where("email = ?", email).First(&user)
	if result.Error != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Create a new token
	newToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email": email,
		"id":    user.ID,
		"role":  user.Role,
		"exp":   time.Now().Add(utils.JWT_EXPIRATION_TIME).Unix(),
	})

	newTokenString, err := newToken.SignedString([]byte(utils.SECRET_KEY))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": newTokenString})
}

// HandleRegister registers a new user
func HandleRegister(c *gin.Context) {
	email := c.PostForm("email")
	password := c.PostForm("password")
	first_name := c.PostForm("first_name")
	last_name := c.PostForm("last_name")

	// validate email
	if !utils.ValidateEmail(email) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email"})
		return
	}

	// validate password
	if !utils.ValidatePassword(password) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid password"})
		return
	}

	// validate first name
	if !utils.ValidateName(first_name) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid first name"})
		return
	}

	// validate last name
	if !utils.ValidateName(last_name) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid last name"})
		return
	}

	// check if user already exists
	var user models.User
	result := db.DB.Where("email = ?", email).First(&user)
	if result.Error == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User already exists"})
		return
	}

	hashed_password, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	user = models.User{
		Email:        email,
		FirstName:    first_name,
		LastName:     last_name,
		PasswordHash: string(hashed_password),
	}

	created_user := db.DB.Create(&user)
	if created_user.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// generate token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email": email,
		"id":    user.ID,
		"role":  user.Role,
		"exp":   time.Now().Add(utils.JWT_EXPIRATION_TIME).Unix(),
	})

	tokenString, err := token.SignedString([]byte(utils.SECRET_KEY))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User created successfully", "token": tokenString})
}

// HandleLogin authenticates a user and returns a JWT token
func HandleLogin(c *gin.Context) {
	// Extract email and password from request
	email := c.PostForm("email")
	password := c.PostForm("password")

	// Find user by email
	var user models.User
	result := db.DB.Where("email = ?", email).First(&user)
	if result.Error != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Check the password hash
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Create a new token object, specifying signing method and the claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email": email,
		"id":    user.ID,
		"role":  user.Role,
		"exp":   time.Now().Add(utils.JWT_EXPIRATION_TIME).Unix(),
	})

	// Sign and get the complete encoded token as a string
	tokenString, err := token.SignedString([]byte(utils.SECRET_KEY))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": tokenString})
}
