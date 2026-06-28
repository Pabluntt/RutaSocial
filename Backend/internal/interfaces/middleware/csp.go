package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
)

func CSPMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		policy := "default-src 'none'; " +
			"script-src 'none'; " +
			"style-src 'none'; " +
			"img-src 'none'; " +
			"connect-src 'none'; " +
			"font-src 'none'; " +
			"media-src 'none'; " +
			"worker-src 'none'; " +
			"child-src 'none'; " +
			"frame-src 'none'; " +
			"frame-ancestors 'none'; " +
			"object-src 'none'; " +
			"base-uri 'none'; " +
			"form-action 'none'"

		if strings.HasPrefix(c.Request.URL.Path, "/swagger/") {
			policy = "default-src 'self'; " +
				"script-src 'self' 'unsafe-inline'; " +
				"script-src-attr 'none'; " +
				"style-src 'self' 'unsafe-inline'; " +
				"style-src-elem 'self' 'unsafe-inline'; " +
				"style-src-attr 'unsafe-inline'; " +
				"img-src 'self' data:; " +
				"connect-src 'self'; " +
				"font-src 'self' data:; " +
				"media-src 'none'; " +
				"worker-src 'none'; " +
				"child-src 'none'; " +
				"frame-src 'none'; " +
				"frame-ancestors 'none'; " +
				"object-src 'none'; " +
				"base-uri 'self'; " +
				"form-action 'self'"
		}

		c.Header("Content-Security-Policy",
			policy,
		)
		c.Next()
	}
}
