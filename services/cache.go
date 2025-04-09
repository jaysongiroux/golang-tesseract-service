package services

import (
	"fmt"
	"serverless-tesseract/db"
	"serverless-tesseract/models"
	"time"
)

func GetFileHashCache(hash *string) (string, error) {
	// check if the hash exists in the database
	var organizationFileCache models.OrganizationFileCache
	db.DB.Where("hash = ?", hash).First(&organizationFileCache)

	// if the hash exists, return the text
	if organizationFileCache.Hash == *hash {
		return organizationFileCache.Results, nil
	}

	return "", fmt.Errorf("hash not found in database")
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
