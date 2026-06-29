package utils

import (
	"math"
	"strconv"

	"github.com/gin-gonic/gin"
)

const (
	DefaultPageLimit = 20
	MaxPageLimit     = 100
)

type PaginationMeta struct {
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	Total      int `json:"total"`
	TotalPages int `json:"total_pages"`
}

func HasPagination(c *gin.Context) bool {
	return c.Query("page") != "" || c.Query("limit") != ""
}

func PaginateSlice[T any](c *gin.Context, items []T) ([]T, PaginationMeta) {
	page := parsePositiveInt(c.Query("page"), 1)
	limit := parsePositiveInt(c.Query("limit"), DefaultPageLimit)
	if limit > MaxPageLimit {
		limit = MaxPageLimit
	}

	total := len(items)
	totalPages := 0
	if total > 0 {
		totalPages = int(math.Ceil(float64(total) / float64(limit)))
	}

	start := (page - 1) * limit
	if start >= total {
		return []T{}, PaginationMeta{Page: page, Limit: limit, Total: total, TotalPages: totalPages}
	}

	end := start + limit
	if end > total {
		end = total
	}

	return items[start:end], PaginationMeta{Page: page, Limit: limit, Total: total, TotalPages: totalPages}
}

func parsePositiveInt(value string, fallback int) int {
	parsed, err := strconv.Atoi(value)
	if err != nil || parsed < 1 {
		return fallback
	}
	return parsed
}
