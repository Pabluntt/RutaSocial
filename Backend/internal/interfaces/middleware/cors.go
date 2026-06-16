package middleware

import (
	"github.com/gin-gonic/gin"
	"os"
	"strings"
)

// CORSMiddleware configura las políticas CORS para permitir solicitudes desde orígenes específicos.
// Soporta múltiples orígenes separados por espacios o usa "*" para permitir todos.
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		
		allowedOrigins := []string{
			"http://localhost:3000",
			"http://localhost:5173",
			"http://localhost:5174",
			"http://127.0.0.1:3000",
			"http://127.0.0.1:5173",
			"http://127.0.0.1:5174",
		}
		
		frontendsEnv := os.Getenv("FRONTEND_URL")
		if frontendsEnv != "" {
			origins := strings.Fields(frontendsEnv)
			allowedOrigins = append(allowedOrigins, origins...)
		}
		
		frontendsM := os.Getenv("FRONTEND_URL_MOBILE")
		if frontendsM != "" {
			origins := strings.Fields(frontendsM)
			allowedOrigins = append(allowedOrigins, origins...)
		}
		
		isAllowed := false
		for _, allowed := range allowedOrigins {
			if allowed == "*" || allowed == origin {
				isAllowed = true
				break
			}
		}
		
		if isAllowed && origin != "" {
			c.Header("Access-Control-Allow-Origin", origin)
		} else if isAllowed {
			c.Header("Access-Control-Allow-Origin", "*")
		} else {
			if origin != "" && (strings.Contains(origin, "localhost") || strings.Contains(origin, "127.0.0.1")) {
				c.Header("Access-Control-Allow-Origin", origin)
			}
		}
		
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
		c.Header("Access-Control-Expose-Headers", "Content-Length, Content-Type")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Max-Age", "86400")
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "0")
		
		if c.Request.Method == "OPTIONS" {
			c.JSON(204, nil)
			return
		}
		
		c.Next()
	}
}
