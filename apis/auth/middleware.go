package authApis

import (
	"log"
	"math/big"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"serverless-tesseract/db"
	"serverless-tesseract/models"
	"serverless-tesseract/utils"
)

// AuthMiddleware validates JWT tokens
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")

		// Remove Bearer prefix if present
		tokenString = strings.TrimPrefix(tokenString, "Bearer ")

		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
			c.Abort()
			return
		}

		// Parse the token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, http.ErrAbortHandler
			}
			return []byte(utils.SECRET_KEY), nil
		})

		if err != nil {
			c.JSON(http.StatusUnauthorized, utils.ErrorResponse{Error: utils.ErrInvalidToken.Error()})
			c.Abort()
			return
		}

		if !token.Valid {
			c.JSON(http.StatusUnauthorized, utils.ErrorResponse{Error: utils.ErrInvalidToken.Error()})
			c.Abort()
			return
		}

		// Set the token claims to the context
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			c.Set("claims", claims)
			//  convert float64 to string
			authed_user_id_float := claims["id"].(float64)
			authed_user_id_string := big.NewFloat(authed_user_id_float).String()

			c.Set("authed_user_id", authed_user_id_string)
		} else {
			c.JSON(http.StatusUnauthorized, utils.ErrorResponse{Error: utils.ErrInvalidToken.Error()})
			c.Abort()
			return
		}

		c.Next() // Proceed to the next handler if authorized
	}
}

// APIMiddleware validates API keys
func APIMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKey := c.GetHeader("X-API-Key")

		if apiKey == "" {
			log.Println("AUTH: No API key provided")
			c.JSON(http.StatusUnauthorized, utils.ErrorResponse{Error: utils.ErrTokenRequired.Error()})
			c.Abort()
			return
		}

		authed_user_id, authed_organization_id, err := utils.ValidateAndParseAPIKey(apiKey)
		if err != nil {
			log.Printf("AUTH: Invalid API key: %v", err)
			c.JSON(http.StatusUnauthorized, utils.ErrorResponse{Error: utils.ErrInvalidAPIKey.Error()})
			c.Abort()
			return
		}

		// check against the database
		var organization_member_api models.OrganizationMemberAPI
		db.DB.Where("user_id = ? AND organization_id = ?", authed_user_id, authed_organization_id).First(&organization_member_api)

		if !utils.CompareAPIKeys(&apiKey, &organization_member_api.KeyHash) {
			c.JSON(http.StatusUnauthorized, utils.ErrorResponse{Error: utils.ErrInvalidAPIKey.Error()})
			c.Abort()
			return
		}

		if !utils.CheckAPIKeyExpiration(organization_member_api.ExpiresAt) {
			c.JSON(http.StatusUnauthorized, utils.ErrorResponse{Error: utils.ErrAPIKeyExpired.Error()})
			c.Abort()
			return
		}

		c.Set("authed_user_id", authed_user_id)
		c.Set("authed_organization_id", authed_organization_id)

		c.Next()
	}
}
