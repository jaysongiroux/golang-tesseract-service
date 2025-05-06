package utils

import "errors"

var (
	ErrTokenRequired = errors.New("token required")
	ErrInvalidAPIKey = errors.New("invalid API key")
	ErrAPIKeyExpired = errors.New("API key expired")
)
