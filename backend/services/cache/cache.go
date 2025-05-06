package cache

import (
	"log"
	"serverless-tesseract/db"
	"serverless-tesseract/utils"
)

// TODO: refactor to support S3 JSON blobs instead of postgres
// TODO: refactor to support fetching for specific engine
func GetCacheResult(
	fileHash string,
	cache_policy utils.CachePolicyType,
	organizationId int64,
	ocrEngine string,
	raw bool,
) (results string, cache_hit bool, err error) {
	// if cache policy is no cache, return nil
	if cache_policy == utils.NoCache {
		return "", false, nil
	}

	// get the cache result from the database
	cacheResult, err := db.GetFileHashCache(fileHash, organizationId, raw)
	if err != nil {
		log.Printf("Cache Service: Error getting cache result: %v", err)
		return "", false, err
	}

	// if no results, return nil
	if cacheResult == "" && cache_policy == utils.CacheOnly {
		return "", false, nil
	}

	// else return results
	return cacheResult, true, nil
}
