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

var cleanupOnce sync.Map

func startCleanup(limiter *rateLimiter, window time.Duration) {
	actual, _ := cleanupOnce.LoadOrStore(limiter, &sync.Once{})
	actual.(*sync.Once).Do(func() {
		go func() {
			ticker := time.NewTicker(window * 2)
			defer ticker.Stop()
			for range ticker.C {
				limiter.mu.Lock()
				now := time.Now()
				for ip, resetTime := range limiter.reset {
					if now.After(resetTime.Add(window)) {
						delete(limiter.attempts, ip)
						delete(limiter.reset, ip)
					}
				}
				limiter.mu.Unlock()
			}
		}()
	})
}

func RateLimitMiddleware(maxAttempts int, window time.Duration) gin.HandlerFunc {
	limiter := &rateLimiter{
		attempts: make(map[string]int),
		reset:    make(map[string]time.Time),
	}
	startCleanup(limiter, window)
	return func(c *gin.Context) {
		ip := c.ClientIP()

		limiter.mu.Lock()
		defer limiter.mu.Unlock()

		if time.Since(limiter.reset[ip]) > window {
			limiter.attempts[ip] = 0
			limiter.reset[ip] = time.Now()
		}

		limiter.attempts[ip]++
		if limiter.attempts[ip] > maxAttempts {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{"error": "Demasiados intentos. Intente nuevamente en 1 minuto."})
			return
		}

		c.Next()
	}
}
