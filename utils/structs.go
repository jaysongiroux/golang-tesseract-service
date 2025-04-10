package utils

type TokenResponse struct {
	Token        string `json:"token" example:"your-new-token"`
	RefreshToken string `json:"refresh_token" example:"your-new-refresh-token"`
}

type RenewTokenResponse struct {
	Token string `json:"token" example:"your-new-token"`
}

type ErrorResponse struct {
	Error string `json:"error" example:"Error message"`
}

type APITokenResponse struct {
	Token string `json:"token" example:"your-new-token"`
}

type OCRResponse struct {
	Text string `json:"text" example:"Hello, world!"`
}

type CachePolicy struct {
	CacheFirst string `json:"cache_first" example:"cache_first"`
	NoCache    string `json:"no_cache" example:"no_cache"`
	CacheOnly  string `json:"cache_only" example:"cache_only"`
}

var CachePolicyValues = CachePolicy{
	CacheFirst: "cache_first",
	NoCache:    "no_cache",
	CacheOnly:  "cache_only",
}
