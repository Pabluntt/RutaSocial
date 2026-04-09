package middleware

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"log"
	"os"
	"strings"
)

// CORSMiddleware configura las políticas CORS para permitir solicitudes desde orígenes específicos.
// Soporta múltiples orígenes separados por espacios o usa "*" para permitir todos.
func CORSMiddleware() gin.HandlerFunc {
	allowedOrigins := []string{}
	
	// Obtener orígenes desde variable de entorno
	frontendsEnv := os.Getenv("FRONTEND_URL")
	log.Printf("CORS: FRONTEND_URL = '%s'\n", frontendsEnv)
	if frontendsEnv != "" {
		// Permitir múltiples orígenes separados por espacios
		origins := strings.Fields(frontendsEnv)
		allowedOrigins = append(allowedOrigins, origins...)
	}
	
	frontendsM := os.Getenv("FRONTEND_URL_MOBILE")
	log.Printf("CORS: FRONTEND_URL_MOBILE = '%s'\n", frontendsM)
	if frontendsM != "" {
		allowedOrigins = append(allowedOrigins, frontendsM)
	}
	
	// Si no hay orígenes configurados, permitir todos (solo para desarrollo)
	if len(allowedOrigins) == 0 {
		log.Println("CORS: No origins configured, allowing ALL origins (*)")
		allowedOrigins = []string{"*"}
	}
	
	log.Printf("CORS: Allowed origins = %v\n", allowedOrigins)

	return cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"PUT", "GET", "POST", "DELETE", "PATCH", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           86400,
	})

}
