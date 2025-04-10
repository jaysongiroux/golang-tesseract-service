package authApis

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"serverless-tesseract/db"
	"serverless-tesseract/models"
	"serverless-tesseract/utils"
)

// RenewToken godoc
//
//	@Summary		Renew your access token given a valid refresh token
//	@Description	given a valid refresh token, return a new access token
//	@Tags			Authentication
//	@Accept			json
//	@Produce		json
//	@Param			refresh_token	header		string	true	"Refresh Token"
//	@Success		200				{object}	utils.RenewTokenResponse
//	@Failure		400				{object}	utils.ErrorResponse
//	@Failure		404				{object}	utils.ErrorResponse
//	@Failure		500				{object}	utils.ErrorResponse
//	@Router			/api/auth/renew-token [post]
func RenewToken(c *gin.Context) {
	tokenString := c.GetHeader("Refresh-Token")

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(utils.SECRET_KEY), nil
	})

	if err != nil {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse{Error: "Unauthorized"})
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse{Error: "Invalid token"})
		return
	}

	email := claims["email"].(string)

	var user models.User
	result := db.DB.Where("email = ?", email).First(&user)
	if result.Error != nil {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse{Error: "Invalid credentials"})
		return
	}

	access_token, _, err := utils.GenerateJWTToken(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, utils.RenewTokenResponse{Token: access_token})
}

// HandleRegister godoc
//
//	@Summary		Register a new user
//	@Description	register a new user with email, password, first name, and last name
//	@Tags			Authentication
//	@Accept			json
//	@Produce		json
//	@Param			email		formData	string	true	"Email"
//	@Param			password	formData	string	true	"Password"
//	@Param			first_name	formData	string	true	"First Name"
//	@Param			last_name	formData	string	true	"Last Name"
//	@Success		200			{object}	utils.TokenResponse
//	@Failure		400			{object}	utils.ErrorResponse
//	@Router			/api/auth/register [post]
func HandleRegister(c *gin.Context) {
	email := c.PostForm("email")
	password := c.PostForm("password")
	first_name := c.PostForm("first_name")
	last_name := c.PostForm("last_name")

	// validate email
	if !utils.ValidateEmail(email) {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse{Error: "Invalid email"})
		return
	}

	// validate password
	if !utils.ValidatePassword(password) {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse{Error: "Invalid password"})
		return
	}

	// validate first name
	if !utils.ValidateName(first_name) {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse{Error: "Invalid first name"})
		return
	}

	// validate last name
	if !utils.ValidateName(last_name) {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse{Error: "Invalid last name"})
		return
	}

	// check if user already exists
	var user models.User
	result := db.DB.Where("email = ?", email).First(&user)
	if result.Error == nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse{Error: "User already exists"})
		return
	}

	hashed_password, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: "Failed to hash password"})
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
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: "Failed to create user"})
		return
	}

	// generate token
	access_token, refresh_token, err := utils.GenerateJWTToken(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, utils.TokenResponse{Token: access_token, RefreshToken: refresh_token})
}

// HandleLogin godoc
//
//	@Summary		Login a user
//	@Description	login a user with email and password
//	@Tags			Authentication
//	@Accept			json
//	@Produce		json
//	@Param			email		formData	string	true	"Email"
//	@Param			password	formData	string	true	"Password"
//	@Success		200			{object}	utils.TokenResponse
//	@Failure		400			{object}	utils.ErrorResponse
//	@Router			/api/auth/login [post]
func HandleLogin(c *gin.Context) {
	// Extract email and password from request
	email := c.PostForm("email")
	password := c.PostForm("password")

	// Find user by email
	var user models.User
	result := db.DB.Where("email = ?", email).First(&user)
	if result.Error != nil {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse{Error: "Invalid credentials"})
		return
	}

	// Check the password hash
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse{Error: "Invalid credentials"})
		return
	}

	access_token, refresh_token, err := utils.GenerateJWTToken(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, utils.TokenResponse{Token: access_token, RefreshToken: refresh_token})
}
