package cache

import (
	"serverless-tesseract/db"
	"serverless-tesseract/utils"
)

func GetCacheResult(
	fileHash string,
	cache_policy utils.CachePolicyType,
	organizationId int64,
	ocrEngine string,
	raw bool,
) (results *utils.OCRResponseList, cache_hit bool, err error) {
	// if cache policy is no cache, return nil
	if cache_policy == utils.NoCache {
		return nil, false, nil
	}

	// get the cache result from the database
	cacheResult, err := db.GetFileHashCache(fileHash, organizationId, raw, ocrEngine)
	if err != nil || (cacheResult == nil && cache_policy == utils.CacheOnly) {
		return nil, false, err
	}

	if cacheResult == nil {
		return nil, false, nil
	}

	return cacheResult, true, nil
}
