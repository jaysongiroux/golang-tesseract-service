package services

import (
	"bytes"
	"fmt"
	"image/png"
	"log"

	"github.com/unidoc/unipdf/v3/model"
	"github.com/unidoc/unipdf/v3/render"
)

// ProcessPDF takes PDF bytes, renders each page as an image using unipdf,
// encodes them as PNG, and returns a slice of PNG-encoded byte slices.
func ProcessPDF(pdfBytes *[]byte) ([][]byte, error) {
	// Create an in-memory reader.
	reader := bytes.NewReader(*pdfBytes)

	// Initialize a PDF reader.
	pdfReader, err := model.NewPdfReader(reader)
	if err != nil {
		log.Printf("Failed to create PDF reader: %v", err)
		return nil, fmt.Errorf("failed to create PDF reader: %w", err)
	}

	// Get the total number of pages.
	numPages, err := pdfReader.GetNumPages()
	if err != nil {
		log.Printf("Failed to get number of pages: %v", err)
		return nil, fmt.Errorf("failed to get number of pages: %w", err)
	}

	// Create an image processor.
	processor := render.NewImageDevice()
	if err != nil {
		log.Printf("Failed to create image processor: %v", err)
		return nil, fmt.Errorf("failed to create image processor: %w", err)
	}

	var pngPages [][]byte

	// Loop over every page (page numbers are 1-indexed).
	for i := 1; i <= numPages; i++ {
		page, err := pdfReader.GetPage(i)
		if err != nil {
			log.Printf("Failed to get page %d: %v", i, err)
			return nil, fmt.Errorf("failed to get page %d: %w", i, err)
		}

		// Render the page using the image processor.
		img, err := processor.Render(page)
		if err != nil {
			log.Printf("Failed to render page %d: %v", i, err)
			return nil, fmt.Errorf("failed to render page %d: %w", i, err)
		}

		// conver image.Image to []byte
		var buf bytes.Buffer
		if err := png.Encode(&buf, img); err != nil {
			log.Printf("Failed to encode page %d as PNG: %v", i, err)
			return nil, fmt.Errorf("failed to encode page %d as PNG: %w", i, err)
		}

		pngPages = append(pngPages, buf.Bytes())
	}

	if len(pngPages) == 0 {
		log.Printf("No pages were rendered")
		return nil, fmt.Errorf("no pages were rendered")
	}

	return pngPages, nil
}
