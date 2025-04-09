package services

import (
	"serverless-tesseract/db"
	"serverless-tesseract/models"
	"time"
)

func GetFileHashCache(hash *string) string {
	// check if the hash exists in the database
	var organizationFileCache models.OrganizationFileCache
	db.DB.Where("hash = ?", hash).First(&organizationFileCache)

	// if the hash exists, return the text
	if organizationFileCache.Hash == *hash {
		return organizationFileCache.Results
	}

	return ""
}

func SaveFileHashCache(hash *string, text *string) error {
	db.DB.Create(&models.OrganizationFileCache{
		Hash:      *hash,
		Results:   *text,
		CreatedAt: time.Now(),
		OCREngine: "tesseract",
	})

	return nil
}
