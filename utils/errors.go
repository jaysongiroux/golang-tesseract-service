package utils

import "errors"

var (
	ErrInvalidToken  = errors.New("invalid token")
	ErrTokenRequired = errors.New("token required")
	ErrInvalidAPIKey = errors.New("invalid API key")
	ErrAPIKeyExpired = errors.New("API key expired")
)
