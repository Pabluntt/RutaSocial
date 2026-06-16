package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type rateLimiter struct {
	mu       sync.Mutex
	attempts map[string]int
	reset    map[string]time.Time
}

var loginLimiter = &rateLimiter{
	attempts: make(map[string]int),
	reset:    make(map[string]time.Time),
}

func RateLimitMiddleware(maxAttempts int, window time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()

		loginLimiter.mu.Lock()
		defer loginLimiter.mu.Unlock()

		if time.Since(loginLimiter.reset[ip]) > window {
			loginLimiter.attempts[ip] = 0
			loginLimiter.reset[ip] = time.Now()
		}

		loginLimiter.attempts[ip]++
		if loginLimiter.attempts[ip] > maxAttempts {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{"error": "Demasiados intentos. Intente nuevamente en 1 minuto."})
			return
		}

		c.Next()
	}
}
