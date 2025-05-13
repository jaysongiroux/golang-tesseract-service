package services

import (
	"fmt"
	externalscripts "serverless-tesseract/services/external_scripts"
	"serverless-tesseract/utils"
	"strconv"
)

// RunOCR processes an image with tesseract and returns the text
func RunOCR(imageBytes []byte, engine utils.OCREngineType, pageNumber int, raw bool) (utils.OCRResponseList, error) {
	switch engine {
	case utils.EngineTesseract:
		return tesseractOCR(imageBytes, pageNumber, raw)
	case utils.EngineEasyOCR:
		return easyOCR(imageBytes, pageNumber, raw)
	case utils.EngineDoctoR:
		return doctrOCR(imageBytes, pageNumber, raw)
	default:
		return utils.OCRResponseList{}, fmt.Errorf("invalid engine: %s", engine)
	}
}

func tesseractOCR(imageBytes []byte, pageNumber int, raw bool) (utils.OCRResponseList, error) {
	args := []string{strconv.Itoa(pageNumber)}
	if raw {
		args = append(args, "raw")
	}
	return externalscripts.ExecutePythonOCREngineScript("tesseract_ocr.py", imageBytes, args...)
}

func easyOCR(imageBytes []byte, pageNumber int, raw bool) (utils.OCRResponseList, error) {
	args := []string{strconv.Itoa(pageNumber)}
	if raw {
		args = append(args, "raw")
	}
	return externalscripts.ExecutePythonOCREngineScript("easyocr_ocr.py", imageBytes, args...)
}

func doctrOCR(imageBytes []byte, pageNumber int, raw bool) (utils.OCRResponseList, error) {
	args := []string{strconv.Itoa(pageNumber)}
	if raw {
		args = append(args, "raw")
	}
	return externalscripts.ExecutePythonOCREngineScript("doctr_ocr.py", imageBytes, args...)
}
