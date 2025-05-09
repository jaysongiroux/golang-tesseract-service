package r2

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"serverless-tesseract/utils"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/joho/godotenv"
)

var (
	r2Svc *s3.S3
)

// init is automatically called when the package is loaded.
func init() {
	// load environment variables
	_ = godotenv.Load()

	// if variables are not set, throw an error
	if utils.R2_ACCESS_KEY_ID == "" || utils.R2_SECRET_ACCESS_KEY == "" || utils.R2_ENDPOINT == "" || utils.R2_BUCKET_NAME == "" || utils.R2_REGION == "" {
		panic("R2 variables are not set")
	}

	sess, err := session.NewSession(&aws.Config{
		Region:   aws.String(utils.R2_REGION),
		Endpoint: aws.String(utils.R2_ENDPOINT),
		Credentials: credentials.NewStaticCredentials(
			utils.R2_ACCESS_KEY_ID,
			utils.R2_SECRET_ACCESS_KEY,
			"",
		),
	})
	if err != nil {
		panic(fmt.Sprintf("Failed to create AWS session: %v", err))
	}

	r2Svc = s3.New(sess)
}

func UploadObject(document_name string, body utils.OCRResponseList) (err error) {
	resultsBytes, err := json.Marshal(body)
	if err != nil {
		log.Printf("failed to marshal results: %s", err)
		return fmt.Errorf("failed to marshal results: %w", err)
	}

	result, err := r2Svc.PutObject(&s3.PutObjectInput{
		Bucket:      aws.String(utils.R2_BUCKET_NAME),
		Key:         aws.String(document_name),
		Body:        bytes.NewReader(resultsBytes),
		ContentType: aws.String("application/json"),
	})

	if err != nil {
		log.Printf("failed to upload object to S3: %s", err)
		return fmt.Errorf("failed to upload object to S3: %w", err)
	}

	fmt.Println("R2 PutObject result:", result.String())
	return nil
}

// Get object json body and return marshalled body
func GetObject(document_name string) (body *utils.OCRResponseList, err error) {
	result, err := r2Svc.GetObject(&s3.GetObjectInput{
		Bucket: aws.String(utils.R2_BUCKET_NAME),
		Key:    aws.String(document_name),
	})
	if err != nil {
		log.Printf("failed to get object from S3: %s", err)
		return nil, fmt.Errorf("failed to get object from S3: %w", err)
	}

	bodyBytes, err := io.ReadAll(result.Body)
	if err != nil {
		log.Printf("failed to read object body: %s", err)
		return nil, fmt.Errorf("failed to read object body: %w", err)
	}

	var ocrResponseList utils.OCRResponseList
	err = json.Unmarshal(bodyBytes, &ocrResponseList)
	if err != nil {
		log.Printf("failed to unmarshal object body: %s", err)
		return nil, fmt.Errorf("failed to unmarshal object body: %w", err)
	}

	return &ocrResponseList, nil
}
