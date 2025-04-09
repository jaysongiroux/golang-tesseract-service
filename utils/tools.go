package utils

import (
	"errors"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetFormattedAuthedUserIdFromContext(c *gin.Context) (*int64, error) {
	// get user from context
	authed_user_id, ok := c.Get("authed_user_id")
	if !ok {
		return nil, errors.New("user not found")
	}

	// string to int64
	authed_user_id_int, err := strconv.ParseInt(authed_user_id.(string), 10, 64)
	if err != nil {
		return nil, errors.New("failed to convert authed_user_id to int64")
	}

	return &authed_user_id_int, nil

}
