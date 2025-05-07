package externalscripts

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"os/exec"
	"serverless-tesseract/utils"
)

func ExecutePythonOCREngineScript(scriptPath string, imageBytes []byte, args ...string) (utils.OCRResponseList, error) {
	// Construct full command with Python script and args
	log.Println("Executing python with the following args: ", append([]string{"./scripts/" + scriptPath}, args...))
	cmd := exec.Command("python3", append([]string{"./scripts/" + scriptPath}, args...)...)

	// Create pipes for stdin and capture stdout/stderr
	stdin, err := cmd.StdinPipe()
	if err != nil {
		log.Println("Failed to open stdin pipe: ", err)
		return utils.OCRResponseList{}, fmt.Errorf("failed to open stdin pipe: %v", err)
	}

	var outBuf, errBuf bytes.Buffer
	cmd.Stdout = &outBuf
	cmd.Stderr = &errBuf

	// Start the command
	if err := cmd.Start(); err != nil {
		log.Println("Failed to start command: ", err)
		return utils.OCRResponseList{}, fmt.Errorf("failed to start command: %v", err)
	}

	// Write image bytes to stdin
	_, err = stdin.Write(imageBytes)
	if err != nil {
		log.Println("Failed to write to stdin: ", err)
		return utils.OCRResponseList{}, fmt.Errorf("failed to write to stdin: %v", err)
	}
	stdin.Close()

	// Wait for completion
	if err := cmd.Wait(); err != nil {
		log.Println("Failed to wait for completion: ", err)
		return utils.OCRResponseList{}, fmt.Errorf("script failed: %v\nstderr: %s", err, errBuf.String())
	}

	// Parse output
	var result utils.OCRResponseList
	if err := json.Unmarshal(outBuf.Bytes(), &result); err != nil {
		log.Println("Failed to parse JSON: ", err)
		return utils.OCRResponseList{}, fmt.Errorf("failed to parse JSON: %v\noutput: %s", err, outBuf.String())
	}

	return result, nil
}
