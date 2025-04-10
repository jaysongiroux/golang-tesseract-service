package utils

import (
	"os"
	"time"
)

var SECRET_KEY = os.Getenv("SECRET_KEY")

var JWT_EXPIRATION_TIME = time.Hour * 1

var ORG_USER_LIMIT = 3

var FILE_SIZE_LIMIT = 20 * 1024 * 1024 // 20MB
