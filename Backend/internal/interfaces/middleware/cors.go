package middleware

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"os"
)

// CORSMiddleware configura las políticas CORS para permitir solicitudes desde un origen específico, en este caso desde el frontend.
// Permite métodos HTTP específicos y headers.
func CORSMiddleware() gin.HandlerFunc {

	return cors.New(cors.Config{
		AllowOrigins:     []string{os.Getenv("FRONTEND_URL"), os.Getenv("FRONTEND_URL_MOBILE")},
		AllowMethods:     []string{"PUT", "GET", "POST", "DELETE", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	})

}
