package serviceApis

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"serverless-tesseract/services"
	"serverless-tesseract/utils"
	"strings"

	"github.com/gin-gonic/gin"
)

// given an image or PDF, run through tesseract OCR and return the text
func OCRService(c *gin.Context) {
	// get the file from the request
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get file"})
		return
	}

	// optionals are "cache_first", "no_cache" or "cache_only"
	cache_policy := c.PostForm("cache_policy")

	if cache_policy == "" {
		cache_policy = "cache_first"
	}

	// Open the uploaded file
	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open uploaded file"})
		return
	}
	defer src.Close()

	// Read the file data into memory
	buffer := bytes.NewBuffer(nil)
	if _, err := io.Copy(buffer, src); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read file data"})
		return
	}
	fileBytes := buffer.Bytes()

	// calculate the hash based off the file bytes
	fileHash := utils.GetSHA256Hash(fileBytes)

	if cache_policy == "cache_only" {
		results, err := services.GetFileHashCache(&fileHash)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to get file hash cache: %v", err)})
			return
		}
		c.JSON(http.StatusOK, gin.H{"text": results})
		return
	}

	// if the cache policy is not no_cache, get the text from the cache
	if cache_policy != "no_cache" {
		results, err := services.GetFileHashCache(&fileHash)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to get file hash cache: %v", err)})
			return
		}

		if results != "" {
			c.JSON(http.StatusOK, gin.H{"text": results})
			return
		}
	}

	var text string
	fileExt := strings.ToLower(filepath.Ext(file.Filename))

	// Process based on file type
	if fileExt == ".pdf" {
		// Process PDF file
		imageBytesList, err := services.ProcessPDF(&fileBytes)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to process PDF: %v", err)})
			return
		}

		// Process each page and combine the results
		var allTexts []string
		for i, imgBytes := range imageBytesList {
			pageText, err := services.RunOCR(imgBytes)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to OCR page %d: %v", i+1, err)})
				return
			}
			allTexts = append(allTexts, pageText)
		}

		// Combine all page texts with page separators
		text = strings.Join(allTexts, "\n\n----- Page Break -----\n\n")
	} else {
		// Process image file
		text, err = services.RunOCR(fileBytes)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("OCR processing failed: %v", err)})
			return
		}
	}

	services.SaveFileHashCache(&fileHash, &text)

	// Return the OCR text
	c.JSON(http.StatusOK, gin.H{
		"text": text,
	})

}
