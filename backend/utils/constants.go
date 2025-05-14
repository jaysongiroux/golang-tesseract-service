package utils

import (
	"fmt"
	"os"
	"time"
)

var SECRET_KEY = os.Getenv("SECRET_KEY")

var JWT_EXPIRATION_TIME = time.Hour * 1

var ORG_USER_LIMIT = 3

var FILE_SIZE_LIMIT = 20 * 1024 * 1024 // 20MB

var PDF_RENDER_DPI = 120.0

var POLAR_FREE_PAGE_LIMIT = 100

// configuration for R2
var R2_ACCESS_KEY_ID = os.Getenv("R2_ACCESS_KEY_ID")
var R2_SECRET_ACCESS_KEY = os.Getenv("R2_SECRET_ACCESS_KEY")
var R2_ENDPOINT = fmt.Sprintf("https://%s.r2.cloudflarestorage.com", os.Getenv("R2_ACCOUNT_ID"))
var R2_BUCKET_NAME = os.Getenv("R2_BUCKET_NAME")
var R2_REGION = os.Getenv("R2_REGION")
