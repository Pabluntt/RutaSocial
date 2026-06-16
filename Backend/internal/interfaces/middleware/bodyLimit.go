package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// BodySizeLimit limita el tamaño del body de las peticiones HTTP.
// Si el body supera el límite, ShouldBindJSON recibe un error y el handler retorna 400.
func BodySizeLimit(maxBytes int64) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxBytes)
		c.Next()
	}
}
