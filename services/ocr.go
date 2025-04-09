package services

import (
	"fmt"

	"github.com/otiai10/gosseract/v2"
)

// RunOCR processes an image with tesseract and returns the text
func RunOCR(imageBytes []byte) (string, error) {
	// Use gosseract to perform OCR
	client := gosseract.NewClient()
	defer client.Close()

	// Set the image bytes to process
	if err := client.SetImageFromBytes(imageBytes); err != nil {
		return "", fmt.Errorf("failed to set image for OCR: %v", err)
	}

	// Get the text from the image
	text, err := client.Text()
	if err != nil {
		return "", fmt.Errorf("OCR processing failed: %v", err)
	}

	return text, nil
}
