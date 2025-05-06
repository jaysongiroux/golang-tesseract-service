package utils

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"strconv"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func CompareAPIKeys(apiKey *string, apiKeyHash *string) bool {
	token_hash := HashJWT(*apiKey)
	return token_hash == *apiKeyHash
}

func CheckAPIKeyExpiration(expiration_time *time.Time) bool {
	if expiration_time == nil {
		return true
	}

	return expiration_time.Before(time.Now())
}

func ValidateAndParseAPIKey(jwtToken string) (userId *string, orgId *int64, scope *[]string, one_time bool, err error) {
	// 1. verify the token
	token, err := jwt.Parse(jwtToken, func(token *jwt.Token) (interface{}, error) {
		return []byte(SECRET_KEY), nil
	})

	if err != nil {
		return nil, nil, nil, false, err
	}

	// 2. get the scope of the token
	// Extract scopes from token claims
	scopesClaim, ok := token.Claims.(jwt.MapClaims)["scopes"]
	if !ok {
		return nil, nil, nil, false, errors.New("missing scopes in token")
	}

	// Convert the scopes claim to a string slice
	scopesInterface, ok := scopesClaim.([]interface{})
	if !ok {
		return nil, nil, nil, false, errors.New("invalid scopes format in token")
	}

	// Convert each interface{} to string
	scopes := make([]string, len(scopesInterface))
	for i, scope := range scopesInterface {
		scopeStr, ok := scope.(string)
		if !ok {
			return nil, nil, nil, false, errors.New("invalid scope type in token")
		}
		scopes[i] = scopeStr
	}

	if !ok {
		return nil, nil, nil, false, errors.New("invalid token scopes")
	}

	// 4. check expiration
	expiration := int64(token.Claims.(jwt.MapClaims)["exp"].(float64))
	if expiration < time.Now().Unix() {
		return nil, nil, nil, false, errors.New("token expired")
	}

	// 5. return the user id and the organization id
	userID := token.Claims.(jwt.MapClaims)["sub"]
	orgID := token.Claims.(jwt.MapClaims)["orgId"]

	// 6. if userID or orgID is not provided, return an error
	if userID == nil || orgID == nil {
		return nil, nil, nil, false, errors.New("invalid token claims")
	}

	// The variables userID and orgID are shadowed in the if statements above
	// Extract them properly from the token claims
	userIDStr := userID.(string)
	orgIDStr := orgID.(string)

	orgIDInt, err := strconv.ParseInt(orgIDStr, 10, 64)
	if err != nil {
		return nil, nil, nil, false, errors.New("invalid organization ID")
	}

	// oneTime is optional
	oneTime := token.Claims.(jwt.MapClaims)["oneTime"]
	var oneTimeBool bool
	if oneTime == nil {
		oneTimeBool = false
	} else {
		oneTimeBool, ok = oneTime.(bool)
		if !ok {
			return nil, nil, nil, false, errors.New("invalid oneTime format in token")
		}
	}

	return &userIDStr, &orgIDInt, &scopes, oneTimeBool, nil
}

func HashJWT(jwtToken string) string {
	hash := sha256.Sum256([]byte(jwtToken))
	return hex.EncodeToString(hash[:])
}

func GetSHA256Hash(data []byte) string {
	hash := sha256.Sum256(data)
	return hex.EncodeToString(hash[:])
}

func CountTokens(text string) int {
	words := strings.Split(text, " ")
	return len(words)
}

func Contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

func IsValidEngine(engine string) bool {
	for _, valid := range OCREngineValues {
		if string(valid) == engine {
			return true
		}
	}
	return false
}

func IsValidCachePolicy(cachePolicy string) bool {
	for _, valid := range CachePolicyValues {
		if string(valid) == cachePolicy {
			return true
		}
	}
	return false
}
