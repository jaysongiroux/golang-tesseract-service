package db

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"serverless-tesseract/models"
	"serverless-tesseract/polar"
	"serverless-tesseract/utils"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

var DB *sql.DB

// ConnectDatabase initializes the database connection
func ConnectDatabase() {
	// Load environment variables from .env file if it exists
	_ = godotenv.Load()

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL environment variable not set")
	}

	// Check if SSL mode is explicitly set in the connection string
	sslMode := os.Getenv("DB_SSL_MODE")
	if sslMode == "" {
		// Default to disable for local development
		env := os.Getenv("ENV")
		if env == "development" || env == "" {
			sslMode = "disable"
		} else {
			sslMode = "require"
		}
	}

	// Only append SSL mode if not already in the DSN
	if !strings.Contains(dsn, "sslmode=") {
		if strings.Contains(dsn, "?") {
			dsn += "&sslmode=" + sslMode
		} else {
			dsn += "?sslmode=" + sslMode
		}
	}

	var err error
	// Connect to the database
	DB, err = sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Check connection
	err = DB.Ping()
	if err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	log.Println("Connected to database successfully with SSL mode:", sslMode)
}

func CreateOCRRequest(
	c *gin.Context,
	num_of_pages int32,
	cache_hit bool,
	ocr_engine string,
	organizationId int64,
	filename string,
	success bool,
	token_count int64,
	file_hash string,
	raw bool,
	// optional
	cache_hash_id *string,
) (models.OrganizationOCRRequest, error) {
	// insert into organization_ocr_request table
	insertQuery := `
		INSERT INTO organization_ocr_request (
			"createdAt", 
			"cacheHit", 
			"numOfPages", 
			"ocrEngine", 
			"organizationId",
			"filename",
			"success",
			"tokenCount",
			"fileHash",
			"cacheFileHash",
			"raw"
		) 
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id
	`

	var id int64
	err := DB.QueryRow(insertQuery, time.Now(), cache_hit, num_of_pages, ocr_engine, organizationId, filename, success, token_count, file_hash, cache_hash_id, raw).Scan(&id)
	if err != nil {
		return models.OrganizationOCRRequest{}, fmt.Errorf("failed to insert into organization_ocr_request: %w", err)
	}

	// if success is true, increment the ocr meter
	if success {
		polarCustomerId, err := GetOrganizationPolarCustomerId(organizationId)
		if err != nil {
			log.Printf("Failed to get organization polar customer ID: %v", err)
			return models.OrganizationOCRRequest{}, fmt.Errorf("failed to get organization polar customer ID: %w", err)
		}
		polar.IngestMeter(c, polarCustomerId, num_of_pages)
	}

	cache_hash_id_or_nil := ""
	if cache_hash_id != nil {
		cache_hash_id_or_nil = *cache_hash_id
	}

	return models.OrganizationOCRRequest{
		ID:             id,
		CreatedAt:      time.Now(),
		CacheHit:       cache_hit,
		NumOfPages:     num_of_pages,
		OCREngine:      utils.OCREngineType(ocr_engine),
		OrganizationID: organizationId,
		Filename:       filename,
		Success:        success,
		TokenCount:     token_count,
		FileHash:       file_hash,
		CacheHash:      cache_hash_id_or_nil,
		Raw:            raw,
	}, nil
}

func GetOrganization(organizationId int64) (models.Organization, error) {
	query := `
		SELECT id, name, email, "polarCustomerId" FROM organization WHERE id = $1
	`

	var organization models.Organization
	err := DB.QueryRow(query, organizationId).Scan(
		&organization.ID,
		&organization.Name,
		&organization.Email,
		&organization.PolarCustomerId,
	)
	if err != nil {
		return models.Organization{}, fmt.Errorf("failed to get organization: %w", err)
	}

	return organization, nil
}

func GetFileHashCache(hash string, organizationId int64, raw bool, engine string) (results *utils.OCRResponseList, err error) {
	// find unique cache result based off raw, organizationId, and hash
	query := `
		SELECT results, "ocrEngine", raw
		FROM organization_file_cache 
		WHERE hash = $1 AND "organizationId" = $2 AND raw = $3 AND "ocrEngine" = $4
		ORDER BY "createdAt" DESC
		LIMIT 1
	`

	var resultsJSON []byte
	var ocrEngine string
	var rawValue bool

	err = DB.QueryRow(query, hash, organizationId, raw, engine).Scan(&resultsJSON, &ocrEngine, &rawValue)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get file hash cache: %w", err)
	}

	var ocrResponseList utils.OCRResponseList
	err = json.Unmarshal(resultsJSON, &ocrResponseList)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal results: %w", err)
	}

	return &ocrResponseList, nil
}

func GetOrganizationPolarCustomerId(organizationId int64) (string, error) {
	query := `
		SELECT "polarCustomerId"
		FROM organization
		WHERE id = $1
	`

	var polarCustomerId string
	err := DB.QueryRow(query, organizationId).Scan(&polarCustomerId)
	if err != nil {
		return "", fmt.Errorf("failed to get organization polar customer id: %w", err)
	}

	return polarCustomerId, nil
}

func GetOrganizationNameAndEmail(organizationId int64) (string, string, error) {
	query := `
		SELECT name, email
		FROM organization
		WHERE id = $1
	`

	var name, email string
	err := DB.QueryRow(query, organizationId).Scan(&name, &email)
	if err != nil {
		return "", "", fmt.Errorf("failed to get organization name and email: %w", err)
	}

	return name, email, nil
}

func UpdateOrganizationPolarCustomerId(organizationId int64, polarCustomerId string) error {
	query := `
		UPDATE organization
		SET "polarCustomerId" = $1
		WHERE id = $2
	`

	_, err := DB.Exec(query, polarCustomerId, organizationId)
	if err != nil {
		return fmt.Errorf("failed to update organization polar customer id: %w", err)
	}

	return nil
}

func SaveFileHashCache(
	hash string,
	results utils.OCRResponseList,
	organizationId int64,
	engine string,
	raw bool,
) error {
	query := `
		INSERT INTO organization_file_cache (
			hash, 
			results, 
			"createdAt", 
			"ocrEngine",
			"organizationId",
			"raw"
		)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (hash, "organizationId", raw, "ocrEngine")
		DO UPDATE SET
			results = $2,
			"createdAt" = $3,
			"ocrEngine" = $4,
			"raw" = $6
	`

	resultsBytes, err := json.Marshal(results)
	if err != nil {
		return fmt.Errorf("failed to marshal results: %w", err)
	}

	_, err = DB.Exec(query, hash, string(resultsBytes), time.Now(), engine, organizationId, raw)
	if err != nil {
		return fmt.Errorf("failed to save file hash cache: %w", err)
	}

	return nil
}

func GetApiKeyHash(hash *string, organizationId *int64, userId *string) (string, error) {
	query := `
		SELECT "keyHash"
		FROM organization_member_api_key
		WHERE "keyHash" = $1 AND "organizationId" = $2 AND "userId" = $3
	`

	var keyHash string
	err := DB.QueryRow(query, *hash, organizationId, userId).Scan(&keyHash)
	if err != nil {
		return "", fmt.Errorf("failed to get API key hash: %w", err)
	}

	return keyHash, nil
}
