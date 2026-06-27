package middleware

import (
	"github.com/gin-gonic/gin"
)

func CSPMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		policy := "default-src 'self'; " +
			"script-src 'self'; " +
			"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
			"font-src 'self' https://fonts.gstatic.com data:; " +
			"img-src 'self' data: blob: https://www.google.cn https://*.tile.openstreetmap.org; " +
			"connect-src 'self' http://localhost:8080 https://*.railway.app; " +
			"frame-src 'none'; " +
			"frame-ancestors 'none'; " +
			"object-src 'none'; " +
			"base-uri 'self'; " +
			"form-action 'self'; " +
			"worker-src 'self'; " +
			"manifest-src 'self'"

		c.Header("Content-Security-Policy",
			policy,
		)
		c.Next()
	}
}
