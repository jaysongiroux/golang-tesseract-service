package utils

type ErrorResponse struct {
	Error string `json:"error" example:"Error message"`
}

// CACHE POLICY
type CachePolicy struct {
	CacheFirst string `json:"cache_first" example:"cache_first"`
	NoCache    string `json:"no_cache" example:"no_cache"`
	CacheOnly  string `json:"cache_only" example:"cache_only"`
}

type CachePolicyType string

const (
	CacheFirst CachePolicyType = "cache_first"
	NoCache    CachePolicyType = "no_cache"
	CacheOnly  CachePolicyType = "cache_only"
)

var CachePolicyValues = []CachePolicyType{
	CacheFirst,
	NoCache,
	CacheOnly,
}

// OCR ENGINE
type OCREngine struct {
	Tesseract string `json:"tesseract" example:"TESSERACT"`
	EasyOCR   string `json:"easyocr" example:"EASYOCR"`
	DoctoR    string `json:"docto_r" example:"DOCTR"`
}

type OCREngineType string

const (
	EngineTesseract OCREngineType = "TESSERACT"
	EngineEasyOCR   OCREngineType = "EASYOCR"
	EngineDoctoR    OCREngineType = "DOCTR"
)

var OCREngineValues = []OCREngineType{
	EngineTesseract,
	EngineEasyOCR,
	EngineDoctoR,
}

// OCR RESPONSE LIST
type OCRResponseList struct {
	OCRResponses   []OCRResponse `json:"ocr_responses"`
	Engine         OCREngineType `json:"engine"`
	NumberOfTokens int64         `json:"number_of_tokens" example:"100"`
}

type OCRResponse struct {
	Text       string  `json:"text" example:"hello world"`
	Confidence float64 `json:"confidence" example:"0.5"`
	BBox       BBox    `json:"bbox"`
	PageNumber int     `json:"page_number" example:"1"`
}

type BBox struct {
	TopLeft     XY `json:"topLeft"`
	BottomLeft  XY `json:"bottomLeft"`
	TopRight    XY `json:"topRight"`
	BottomRight XY `json:"bottomRight"`
}

type XY struct {
	X int `json:"x" example:"10"`
	Y int `json:"y" example:"10"`
}
