package serviceApis

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"serverless-tesseract/models"
	"serverless-tesseract/services"
	"serverless-tesseract/utils"
	"strings"

	"github.com/gin-gonic/gin"
)

// OCRService godoc
//
//	@Summary		OCR Service
//	@Description	OCR Service
//	@Tags			OCR
//	@Accept			multipart/form-data
//	@Param			file		formData	file	true	"File"
//	@Param			cache_policy	formData	string	true	"Cache Policy" Enums(cache_first, no_cache, cache_only)
//	@Success		200			{object}	utils.OCRResponse
//	@Failure		400			{object}	utils.ErrorResponse
//	@Failure		500			{object}	utils.ErrorResponse
//	@Router			/api/ocr [post]
func OCRService(c *gin.Context) {
	// get the file from the request
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse{Error: "Failed to get file"})
		return
	}

	if file.Size > int64(utils.FILE_SIZE_LIMIT) {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse{Error: "File size exceeds limit"})
		return
	}

	// optionals are "cache_first", "no_cache" or "cache_only"
	cache_policy := c.PostForm("cache_policy")

	// validate the cache_policy
	if cache_policy != utils.CachePolicyValues.CacheFirst && cache_policy != utils.CachePolicyValues.NoCache && cache_policy != utils.CachePolicyValues.CacheOnly {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse{Error: "Invalid cache policy"})
		return
	}

	if cache_policy == "" {
		cache_policy = utils.CachePolicyValues.CacheFirst
	}

	// Open the uploaded file
	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: "Failed to open uploaded file"})
		return
	}
	defer src.Close()

	// Read the file data into memory
	buffer := bytes.NewBuffer(nil)
	if _, err := io.Copy(buffer, src); err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: "Failed to read file data"})
		return
	}
	fileBytes := buffer.Bytes()

	// calculate the hash based off the file bytes
	fileHash := utils.GetSHA256Hash(fileBytes)

	cache_results := services.GetFileHashCache(&fileHash)

	if cache_policy != utils.CachePolicyValues.NoCache {
		if cache_results != "" {
			num_of_pages := int32(1)
			cache_hit := true
			ocr_engine := models.OCREngineTesseract
			utils.CreateOCRRequest(c, &num_of_pages, &cache_hit, &ocr_engine)
			c.JSON(http.StatusOK, utils.OCRResponse{Text: cache_results})
			return
		}

		if cache_policy == utils.CachePolicyValues.CacheOnly {
			c.JSON(http.StatusNotFound, utils.ErrorResponse{Error: "No cache results found"})
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
			c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: fmt.Sprintf("Failed to process PDF: %v", err)})
			return
		}

		// Process each page and combine the results
		var allTexts []string
		for i, imgBytes := range imageBytesList {
			pageText, err := services.RunOCR(imgBytes)
			if err != nil {
				c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: fmt.Sprintf("Failed to OCR page %d: %v", i+1, err)})
				return
			}
			allTexts = append(allTexts, pageText)
		}

		// Combine all page texts with page separators
		text = strings.Join(allTexts, "\n\n----- Page Break -----\n\n")

		num_of_pages := int32(len(imageBytesList))
		cache_hit := false
		ocr_engine := models.OCREngineTesseract
		utils.CreateOCRRequest(c, &num_of_pages, &cache_hit, &ocr_engine)
	} else {
		// Process image file
		text, err = services.RunOCR(fileBytes)
		if err != nil {
			c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: fmt.Sprintf("OCR processing failed: %v", err)})
			return
		}

		num_of_pages := int32(1)
		cache_hit := false
		ocr_engine := models.OCREngineTesseract
		utils.CreateOCRRequest(c, &num_of_pages, &cache_hit, &ocr_engine)
	}

	// if no cache results, save the text to the cache
	if cache_results == "" {
		services.SaveFileHashCache(&fileHash, &text)
	}

	// Return the OCR text
	c.JSON(http.StatusOK, utils.OCRResponse{Text: text})
}
