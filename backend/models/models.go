package models

import (
	"serverless-tesseract/utils"
	"time"
)

type Organization struct {
	ID              int64     `json:"id"`
	Name            string    `json:"name"`
	Email           string    `json:"email"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	PolarCustomerId string    `json:"polar_customer_id"`
}

type OrganizationOCRRequest struct {
	ID             int64               `json:"id"`
	CreatedAt      time.Time           `json:"created_at"`
	CacheHit       bool                `json:"cache_hit"`
	NumOfPages     int32               `json:"num_of_pages"`
	OCREngine      utils.OCREngineType `json:"ocr_engine"`
	OrganizationID int64               `json:"organization_id"`
	Filename       string              `json:"filename"`
	Success        bool                `json:"success"`
	TokenCount     int64               `json:"token_count"`
	FileHash       string              `json:"file_hash"`
	CacheHash      string              `json:"cache_hash"`
	Raw            bool                `json:"raw"`
}
