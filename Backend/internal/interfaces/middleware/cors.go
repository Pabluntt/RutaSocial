package middleware

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"os"
)

// CORSMiddleware configura las políticas CORS para permitir solicitudes desde un origen específico, en este caso desde el frontend.
// Permite métodos HTTP específicos y headers.
func CORSMiddleware() gin.HandlerFunc {
	// Construye el array de orígenes permitidos desde las variables de entorno
	allowedOrigins := []string{}
	
	if frontendURL := os.Getenv("FRONTEND_URL"); frontendURL != "" {
		allowedOrigins = append(allowedOrigins, frontendURL)
	}
	
	if frontendURLMobile := os.Getenv("FRONTEND_URL_MOBILE"); frontendURLMobile != "" {
		allowedOrigins = append(allowedOrigins, frontendURLMobile)
	}
	
	// Si no hay orígenes configurados, permitir todos (para desarrollo)
	if len(allowedOrigins) == 0 {
		allowedOrigins = []string{"*"}
	}

	return cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"PUT", "GET", "POST", "DELETE", "PATCH", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           86400,
	})

}
