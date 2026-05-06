package middleware

import (
	"github.com/gin-gonic/gin"
	"log"
	"os"
	"strings"
)

// CORSMiddleware configura las políticas CORS para permitir solicitudes desde orígenes específicos.
// Soporta múltiples orígenes separados por espacios o usa "*" para permitir todos.
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		log.Printf("[CORS DEBUG] Received %s request from origin: %s, Path: %s", c.Request.Method, origin, c.Request.URL.Path)
		
		// Permitir todos los orígenes configurados más localhost
		allowedOrigins := []string{
			"http://localhost:3000",
			"http://localhost:5173",
			"http://localhost:5174",
			"http://127.0.0.1:3000",
			"http://127.0.0.1:5173",
			"http://127.0.0.1:5174",
		}
		
		// Agregar orígenes desde variables de entorno
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
		
		// Verificar si el origen está permitido
		isAllowed := false
		for _, allowed := range allowedOrigins {
			if allowed == "*" || allowed == origin {
				isAllowed = true
				break
			}
		}
		
		log.Printf("[CORS DEBUG] isAllowed: %v, Allowed origins: %v", isAllowed, allowedOrigins)
		
		// SIEMPRE establecer headers CORS
		if isAllowed {
			if origin != "" {
				c.Header("Access-Control-Allow-Origin", origin)
				log.Printf("[CORS DEBUG] Set Access-Control-Allow-Origin: %s", origin)
			} else {
				c.Header("Access-Control-Allow-Origin", "*")
				log.Printf("[CORS DEBUG] Set Access-Control-Allow-Origin: *")
			}
		} else {
			log.Printf("[CORS DEBUG] Origin %s is NOT allowed", origin)
		}
		
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
		c.Header("Access-Control-Expose-Headers", "Content-Length, Content-Type")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Max-Age", "86400")
		
		// Manejar peticiones OPTIONS
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		
		c.Next()
	}
}
