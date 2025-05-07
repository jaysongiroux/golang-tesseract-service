package serviceApis

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"net/http"
	"path/filepath"
	"serverless-tesseract/db"
	"serverless-tesseract/polar"
	"serverless-tesseract/services"
	"serverless-tesseract/services/cache"
	"serverless-tesseract/utils"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

// OCRService godoc
//
//	@Summary		OCR Service
//	@Description	OCR Service for the OCR Service
//	@Tags			OCR
//	@Accept			multipart/form-data
//
// @Param 			X-API-Key 		header 		string 	true 	"API Key"
// @Param			file			formData	file				true	"File"
// @Param			cache_policy	formData	string	false	"Cache Policy (options: cache_first, no_cache, cache_only)"
// @Param			engine			formData	string	false	"OCR Engine (options: TESSERACT, EASYOCR, DOCTR)"
// @Param			raw				formData	bool	false	"Raw (options: true, false)"
// @Param			organization_id	formData	string	true	"Organization ID"
// @Success		200			{object}	utils.OCRResponseList
// @Failure		400			{object}	utils.ErrorResponse
// @Failure		403			{object}	utils.ErrPermissionDeniedResponse
// @Failure		500			{object}	utils.ErrorResponse
// @Router			/api/ocr [post]
func OCRService2(c *gin.Context) {
	// get the file from the request
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse{Error: "Failed to get file"})
		return
	}

	if file.Size > int64(utils.FILE_SIZE_LIMIT) {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse{Error: "File size exceeds limit: " + strconv.Itoa(utils.FILE_SIZE_LIMIT) + " bytes"})
		return
	}

	organizationID := c.GetInt64("authed_organization_id")

	if organizationID == 0 {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse{Error: "Organization ID is required"})
		return
	}

	engine := c.PostForm("engine")

	// if the engine is not set, set it to tesseract
	if engine == "" {
		engine = string(utils.EngineTesseract)
	}

	// validate the engine
	if !utils.IsValidEngine(engine) {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse{Error: "Invalid engine"})
		return
	}

	raw := c.PostForm("raw")
	// if raw is not set, set it to true
	if raw == "" {
		raw = "true"
	}

	// validate the raw
	if raw != "true" && raw != "false" {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse{Error: "Invalid raw"})
		return
	}

	cache_policy := c.PostForm("cache_policy")

	// if the cache_policy is not set, set it to cache_first
	if cache_policy == "" {
		cache_policy = string(utils.CacheFirst)
	}

	// validate the cache_policy
	if !utils.IsValidCachePolicy(cache_policy) {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse{Error: "Invalid cache policy"})
		return
	}

	// check the token's scopes
	scopes := c.GetStringSlice("authed_scopes")
	if !utils.Contains(scopes, "SERVICE_OCR") {
		c.JSON(http.StatusForbidden, utils.ErrPermissionDeniedResponse{Error: utils.ErrPermissionDenied.Error()})
		return
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

	// check if the user can use OCR
	organization, err := db.GetOrganization(organizationID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: fmt.Sprintf("Failed to get organization: %v", err)})
		return
	}

	canUseOCR, err := polar.CanUserUseOCR(c, organization)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: fmt.Sprintf("Failed to check if user can use OCR: %v", err)})
		return
	}

	if !canUseOCR {
		c.JSON(http.StatusForbidden, utils.ErrPermissionDeniedResponse{Error: utils.ErrPermissionDenied.Error()})
		return
	}

	// calculate the hash based off the file bytes
	fileHash := utils.GetSHA256Hash(fileBytes)
	// catch engine as a string to into a utils.OCREngine struct

	results, cache_hit, err := cache.GetCacheResult(
		fileHash,
		utils.CachePolicyType(cache_policy),
		organizationID,
		engine,
		raw == "true",
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: fmt.Sprintf("Failed to get cache result: %v", err)})
		return
	}

	// if the cache_policy is cache_only, return the results
	if cache_policy == string(utils.CacheOnly) || (cache_hit && cache_policy == string(utils.CacheFirst)) {
		if results == nil {
			success := false
			num_of_pages := int32(1)
			_, err = db.CreateOCRRequest(
				c,
				num_of_pages,
				cache_hit,
				engine,
				organizationID,
				file.Filename,
				success,
				0,
				fileHash,
				raw == "true",
				nil,
			)
			if err != nil {
				c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: fmt.Sprintf("Failed to record OCR request: %v", err)})
				return
			}
			c.JSON(http.StatusNotFound, utils.ErrorResponse{Error: "No cache results found"})
			return
		}
		token_count := results.NumberOfTokens
		num_of_pages := int32(1)
		_, err = db.CreateOCRRequest(
			c,
			num_of_pages,
			cache_hit,
			engine,
			organizationID,
			file.Filename,
			true,
			int64(token_count),
			fileHash,
			raw == "true",
			nil,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: fmt.Sprintf("Failed to record OCR request: %v", err)})
			return
		}
		results.Cached = cache_hit
		results.Raw = raw == "true"
		results.Engine = utils.OCREngineType(engine)
		c.JSON(http.StatusOK, results)
		return
	}

	// can assume the cache_policy is cache_first or no_cache
	fileExt := strings.ToLower(filepath.Ext(file.Filename))
	cache_hit = false
	allResults := utils.OCRResponseList{}
	number_of_pages := int32(0)
	number_of_tokens := int64(0)
	if fileExt == ".pdf" {
		// split the pdf into image pages
		imageBytesList, err := services.ProcessPDF(&fileBytes)
		if err != nil {
			_, err = db.CreateOCRRequest(
				c,
				int32(0),
				cache_hit,
				engine,
				organizationID,
				file.Filename,
				false,
				0,
				fileHash,
				raw == "true",
				nil,
			)
			if err != nil {
				log.Printf("Failed to create OCR request: %v", err)
			}
			c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: fmt.Sprintf("Failed to process PDF: %v", err)})
			return
		}

		for i, imgBytes := range imageBytesList {
			pageResults, err := services.RunOCR(imgBytes, utils.OCREngineType(engine), i+1, raw == "true")
			if err != nil {
				db.CreateOCRRequest(
					c,
					// record the number of pages that were processed
					int32(i+1),
					cache_hit,
					engine,
					organizationID,
					file.Filename,
					false,
					number_of_tokens,
					fileHash,
					raw == "true",
					nil,
				)
				if err != nil {
					log.Printf("Failed to create OCR request: %v", err)
				}
				c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: fmt.Sprintf("Failed to OCR page %d: %v", i+1, err)})
				return
			}
			allResults.OCRResponses = append(allResults.OCRResponses, pageResults.OCRResponses...)
			allResults.Raw = raw == "true"
			allResults.Cached = cache_hit
			number_of_pages = int32(i + 1)
			number_of_tokens += pageResults.NumberOfTokens
		}

		err = db.SaveFileHashCache(
			fileHash,
			allResults,
			organizationID,
			engine,
			raw == "true",
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: fmt.Sprintf("Failed to save cache result: %v", err)})
			return
		}

	} else if fileExt == ".png" || fileExt == ".jpg" || fileExt == ".jpeg" {
		pageResults, err := services.RunOCR(fileBytes, utils.OCREngineType(engine), 1, raw == "true")
		number_of_pages = int32(1)
		if err != nil {
			db.CreateOCRRequest(
				c,
				int32(0),
				cache_hit,
				engine,
				organizationID,
				file.Filename,
				false,
				0,
				fileHash,
				raw == "true",
				nil,
			)
			if err != nil {
				log.Printf("Failed to create OCR request: %v", err)
			}
			c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: fmt.Sprintf("Failed to OCR page: %v", err)})
			return
		}
		allResults.OCRResponses = append(allResults.OCRResponses, pageResults.OCRResponses...)
		number_of_tokens = pageResults.NumberOfTokens
		err = db.SaveFileHashCache(
			fileHash,
			allResults,
			organizationID,
			engine,
			raw == "true",
		)
		if err != nil {
			db.CreateOCRRequest(
				c,
				int32(1),
				cache_hit,
				engine,
				organizationID,
				file.Filename,
				false,
				0,
				fileHash,
				raw == "true",
				nil,
			)
			if err != nil {
				log.Printf("Failed to create OCR request: %v", err)
			}
			c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: fmt.Sprintf("Failed to save cache result: %v", err)})
			return
		}
	} else {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse{Error: "Invalid file type"})
		return
	}

	_, err = db.CreateOCRRequest(
		c,
		number_of_pages,
		cache_hit,
		engine,
		organizationID,
		file.Filename,
		true,
		number_of_tokens,
		fileHash,
		raw == "true",
		nil,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: fmt.Sprintf("Failed to create OCR request: %v", err)})
		return
	}

	allResults.Cached = cache_hit
	allResults.Raw = raw == "true"
	allResults.Engine = utils.OCREngineType(engine)
	c.JSON(http.StatusOK, allResults)
}
