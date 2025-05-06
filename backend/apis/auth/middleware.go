package authApis

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"serverless-tesseract/db"
	"serverless-tesseract/utils"
)

func APIMiddleware() gin.HandlerFunc {
	// received is a
	return func(c *gin.Context) {
		jwtToken := c.GetHeader("X-API-Key")

		if jwtToken == "" {
			c.JSON(http.StatusUnauthorized, utils.ErrorResponse{Error: utils.ErrTokenRequired.Error()})
			c.Abort()
			return
		}

		authed_user_id, authed_organization_id, scopes, one_time, err := utils.ValidateAndParseAPIKey(jwtToken)

		if err != nil {
			c.JSON(http.StatusUnauthorized, utils.ErrorResponse{Error: utils.ErrInvalidAPIKey.Error()})
			c.Abort()
			return
		}

		// since one time tokes are short lived, we do not need to check against the database
		if !one_time {
			jwt_hash := utils.HashJWT(jwtToken)
			hash, err := db.GetApiKeyHash(&jwt_hash, authed_organization_id, authed_user_id)
			if err != nil {
				c.JSON(http.StatusUnauthorized, utils.ErrorResponse{Error: utils.ErrInvalidAPIKey.Error()})
				c.Abort()
				return
			}

			if !one_time && !utils.CompareAPIKeys(&jwtToken, &hash) {
				log.Println("AUTH: Invalid API key")
				c.JSON(http.StatusUnauthorized, utils.ErrorResponse{Error: utils.ErrInvalidAPIKey.Error()})
				c.Abort()
				return
			}
		}

		c.Set("authed_user_id", *authed_user_id)
		c.Set("authed_organization_id", *authed_organization_id)
		c.Set("authed_scopes", *scopes)
		c.Set("authed_one_time", one_time)
		c.Next()
	}
}
