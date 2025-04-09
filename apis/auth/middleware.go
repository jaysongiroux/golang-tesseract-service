package authApis

import (
	"log"
	"math/big"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"serverless-tesseract/utils"
)

// AuthMiddleware validates JWT tokens
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")

		// Remove Bearer prefix if present
		tokenString = strings.TrimPrefix(tokenString, "Bearer ")

		if tokenString == "" {
			log.Println("AUTH: No token provided")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
			c.Abort()
			return
		}

		// Parse the token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				log.Printf("AUTH: Invalid signing method: %v", token.Header["alg"])
				return nil, http.ErrAbortHandler
			}
			return []byte(utils.SECRET_KEY), nil
		})

		if err != nil {
			log.Printf("AUTH: Token parsing error: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		if !token.Valid {
			log.Println("AUTH: Token is invalid")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
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
			log.Println("AUTH: Failed to extract claims")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format"})
			c.Abort()
			return
		}

		c.Next() // Proceed to the next handler if authorized
	}
}
