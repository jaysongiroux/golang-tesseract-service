package utils

import (
	"regexp"
)

// ValidateEmail checks if the email is valid
func ValidateEmail(email string) bool {
	// Simple regex for email validation
	re := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	return re.MatchString(email)
}

// ValidatePassword checks if the password is valid
// Minimum 8 characters, at least one letter and one number
func ValidatePassword(password string) bool {
	if len(password) < 8 {
		return false
	}

	hasLetter := regexp.MustCompile(`[a-zA-Z]`).MatchString(password)
	hasNumber := regexp.MustCompile(`[0-9]`).MatchString(password)

	return hasLetter && hasNumber
}

// ValidateName checks if the name is valid
func ValidateName(name string) bool {
	// Name should be at least 2 characters and contain only letters, spaces, hyphens
	if len(name) < 2 {
		return false
	}

	re := regexp.MustCompile(`^[a-zA-Z\s\-]+$`)
	return re.MatchString(name)
}

func ValidateOrganizationName(name string) bool {
	if len(name) < 2 {
		return false
	}

	re := regexp.MustCompile(`^[a-zA-Z\s\-]+$`)
	return re.MatchString(name)
}
