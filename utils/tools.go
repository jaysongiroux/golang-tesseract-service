package utils

import (
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func GetFormattedAuthedUserIdFromContext(c *gin.Context) (*int64, error) {
	// get user from context
	authed_user_id, ok := c.Get("authed_user_id")
	if !ok {
		return nil, errors.New("user not found")
	}

	// string to int64
	authed_user_id_int, err := strconv.ParseInt(authed_user_id.(string), 10, 64)
	if err != nil {
		return nil, errors.New("failed to convert authed_user_id to int64")
	}

	return &authed_user_id_int, nil

}

func CompareAPIKeys(apiKey *string, apiKeyHash *string) bool {
	// given a base64 encoded apiKey hashed it and compare to apiKeyHash
	token_hash := sha256.New().Sum([]byte(*apiKey))
	return hex.EncodeToString(token_hash) == *apiKeyHash
}

func CheckAPIKeyExpiration(expiration_time *time.Time) bool {
	if expiration_time == nil {
		return true
	}

	return expiration_time.Before(time.Now())
}

// GenerateAPIKey generates an API key for a user ID
// expiration_time is optional, if not provided, the token will not expire
func GenerateAPIKey(authedUserID *int64, organization_id_int *int64, expiration_time *time.Time) (string, string, error) {
	// 1. generate a jwt token with the authed user id and the expiration time
	claims := jwt.MapClaims{
		"user_id":         *authedUserID,
		"organization_id": *organization_id_int,
		"seed":            time.Now().Unix(),
	}

	// Add expiration time only if provided
	if expiration_time != nil {
		claims["exp"] = expiration_time.Unix()
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	token_string, err := token.SignedString([]byte(SECRET_KEY))

	if err != nil {
		return "", "", err
	}

	// 2. base64 encode the token
	token_base64 := base64.StdEncoding.EncodeToString([]byte(token_string))

	// 3. hash the base63 token
	token_hash := sha256.New().Sum([]byte(token_base64))

	// 4. return the base64 token and the hash
	return token_base64, hex.EncodeToString(token_hash), nil
}

func ValidateAndParseAPIKey(apiKey string) (*int64, *int64, error) {
	// 1. decode the base64 token
	token_base64, err := base64.StdEncoding.DecodeString(apiKey)
	if err != nil {
		return nil, nil, err
	}

	// 2. verify the token
	token, err := jwt.Parse(string(token_base64), func(token *jwt.Token) (interface{}, error) {
		return []byte(SECRET_KEY), nil
	})

	if err != nil {
		return nil, nil, err
	}

	// 3. get the claims
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, nil, errors.New("invalid token claims")
	}
	// 4. return the user id and the organization id
	userID := int64(claims["user_id"].(float64))
	orgID := int64(claims["organization_id"].(float64))

	return &userID, &orgID, nil
}

func GetSHA256Hash(data []byte) string {
	hash := sha256.Sum256(data)
	return hex.EncodeToString(hash[:])
}
