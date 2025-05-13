// API data structure for extensibility
export const apiData = {
  baseUrl: "api.atlasocr.com/api",
  authentication: {
    method: "API Key",
    headerName: "X-API-Key",
    description:
      "All API requests must include your API key in the X-API-Key header.",
  },
  endpoints: [
    {
      path: "/api/service/ocr",
      method: "POST",
      description: "Perform OCR on document files",
      requestParams: {
        headers: [
          {
            name: "X-API-Key",
            type: "string",
            required: true,
            description: "Your API key for authentication",
          },
          {
            name: "Content-Type",
            type: "string",
            required: true,
            description: "multipart/form-data",
            default: "multipart/form-data",
          },
        ],
        body: [
          {
            name: "file",
            type: "file",
            required: true,
            description: "The document file to process",
          },
          {
            name: "cache_policy",
            type: "string",
            required: false,
            description: "Cache policy to use for this request",
            options: [
              {
                value: "cache_first",
                description: "Check cache first, then process if not found",
              },
              {
                value: "no_cache",
                description: "Always process the document, don't use cache",
              },
              {
                value: "cache_only",
                description: "Only return cached results, don't process",
              },
            ],
            default: "cache_first",
          },
          {
            name: "engine",
            type: "string",
            required: false,
            description: "OCR engine to use for processing",
            options: [
              {
                value: "TESSERACT",
                description: "Fast processing, good for clear text",
              },
              { value: "EASYOCR", description: "Balanced speed and accuracy" },
              {
                value: "DOCTR",
                description: "High accuracy, good for complex documents",
              },
            ],
            default: "TESSERACT",
          },
          {
            name: "raw",
            type: "boolean",
            required: false,
            description: "Whether to return raw OCR results",
            options: [
              { value: "true", description: "Return raw OCR results" },
              { value: "false", description: "Return processed results" },
            ],
            default: "false",
          },
          {
            name: "organization_id",
            type: "string",
            required: true,
            description: "ID of the organization to process the document for",
          },
        ],
      },
      responses: {
        success: {
          code: 200,
          type: "OCRResponseList",
          description: "Successful OCR processing",
          schema: {
            type: "object",
            properties: {
              ocr_responses: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    text: { type: "string", example: "hello world" },
                    confidence: { type: "number", example: 0.95 },
                    bbox: {
                      type: "object",
                      properties: {
                        topLeft: {
                          type: "object",
                          properties: {
                            x: { type: "number", example: 10 },
                            y: { type: "number", example: 10 },
                          },
                        },
                        bottomLeft: {
                          type: "object",
                          properties: {
                            x: { type: "number", example: 10 },
                            y: { type: "number", example: 50 },
                          },
                        },
                        topRight: {
                          type: "object",
                          properties: {
                            x: { type: "number", example: 100 },
                            y: { type: "number", example: 10 },
                          },
                        },
                        bottomRight: {
                          type: "object",
                          properties: {
                            x: { type: "number", example: 100 },
                            y: { type: "number", example: 50 },
                          },
                        },
                      },
                    },
                    page_number: { type: "number", example: 1 },
                  },
                },
              },
              engine: { type: "string", example: "TESSERACT" },
              number_of_tokens: { type: "number", example: 100 },
              raw: { type: "boolean", example: true },
              cached: { type: "boolean", example: true },
            },
          },
        },
        errors: [
          {
            code: 400,
            type: "ErrorResponse",
            description:
              "Bad request - such as an invalid OCR engine option or file parsing error",
            schema: {
              error: "string",
            },
          },
          {
            code: 401,
            type: "ErrInvalidAPIKey",
            description: "Invalid API key",
            schema: {
              error: "Invalid API key",
            },
          },
          {
            code: 403,
            type: "ErrPermissionDeniedResponse",
            description: "Permission denied",
            schema: {
              error: "Permission denied",
            },
          },
          {
            code: 500,
            type: "ErrorResponse",
            description: "Server error",
            schema: {
              error: "string",
            },
          },
        ],
      },
      examples: [
        {
          title: "cURL Example",
          language: "bash",
          code: `curl -X POST \\
  https://api.atlasocr.com/api/service/ocr \\
  -H 'X-API-Key: your_api_key' \\
  -F 'file=@document.pdf' \\
  -F 'organization_id=org_123456' \\
  -F 'engine=TESSERACT' \\
  -F 'cache_policy=cache_first' \\
  -F 'raw=false'`,
        },
        {
          title: "JavaScript Example",
          language: "javascript",
          code: `const form = new FormData();
form.append('file', document.querySelector('input[type="file"]').files[0]);
form.append('organization_id', 'org_123456');
form.append('engine', 'TESSERACT');
form.append('cache_policy', 'cache_first');
form.append('raw', 'false');

fetch('https://api.atlasocr.com/api/service/ocr', {
  method: 'POST',
  headers: {
    'X-API-Key': 'your_api_key'
  },
  body: form
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`,
        },
        {
          title: "Python Example",
          language: "python",
          code: `import requests

url = "https://api.atlasocr.com/api/service/ocr"
headers = {
    "X-API-Key": "your_api_key"
}
files = {
    'file': open('document.pdf', 'rb')
}
data = {
    'organization_id': 'org_123456',
    'engine': 'TESSERACT',
    'cache_policy': 'cache_first',
    'raw': 'false'
}

response = requests.post(url, headers=headers, files=files, data=data)
print(response.json())`,
        },
      ],
    },
  ],
  types: {
    OCREngineType: {
      description: "Available OCR engines",
      values: [
        {
          name: "TESSERACT",
          description: "Fast processing, good for clear text",
        },
        { name: "EASYOCR", description: "Balanced speed and accuracy" },
        {
          name: "DOCTR",
          description: "High accuracy, good for complex documents",
        },
      ],
    },
    CachePolicyType: {
      description: "Available cache policies",
      values: [
        {
          name: "cache_first",
          description: "Check cache first, then process if not found",
        },
        {
          name: "no_cache",
          description: "Always process the document, don't use cache",
        },
        {
          name: "cache_only",
          description: "Only return cached results, don't process",
        },
      ],
    },
    OCRResponseList: {
      description: "List of OCR responses",
      properties: [
        {
          name: "ocr_responses",
          type: "OCRResponse[]",
          description: "Array of OCR responses",
        },
        {
          name: "engine",
          type: "OCREngineType",
          description: "Engine used for processing",
        },
        {
          name: "number_of_tokens",
          type: "number",
          description: "Number of tokens processed",
        },
        {
          name: "raw",
          type: "boolean",
          description: "Whether raw results were returned",
        },
        {
          name: "cached",
          type: "boolean",
          description: "Whether results were from cache",
        },
      ],
    },
    OCRResponse: {
      description: "Individual OCR response",
      properties: [
        { name: "text", type: "string", description: "Extracted text" },
        {
          name: "confidence",
          type: "number",
          description: "Confidence score (0-1)",
        },
        { name: "bbox", type: "BBox", description: "Bounding box coordinates" },
        {
          name: "page_number",
          type: "number",
          description: "Page number in document",
        },
      ],
    },
    BBox: {
      description: "Bounding box coordinates",
      properties: [
        { name: "topLeft", type: "XY", description: "Top-left coordinate" },
        {
          name: "bottomLeft",
          type: "XY",
          description: "Bottom-left coordinate",
        },
        { name: "topRight", type: "XY", description: "Top-right coordinate" },
        {
          name: "bottomRight",
          type: "XY",
          description: "Bottom-right coordinate",
        },
      ],
    },
    XY: {
      description: "X-Y coordinate",
      properties: [
        { name: "x", type: "number", description: "X coordinate" },
        { name: "y", type: "number", description: "Y coordinate" },
      ],
    },
  },
};
