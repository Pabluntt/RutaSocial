// Package middleware define middlewares para la aplicación.
// Este paquete contiene la lógica de autenticación, CORS y validación de roles de usuario.
package middleware

import (
	"errors"
	"github.com/SebaVCH/hdcProject/internal/config"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"net/http"
	"strings"
)

// AuthMiddleware valida el token JWT en el header Authorization.
// Si el token es válido, se extraen los claims y se añaden al contexto de la solicitud.
// Si el token no es válido o no se proporciona, se devuelve un error 401 Unauthorized.
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "Se requiere autorización"})
			c.Abort()
			return
		}

		token, err := ValidateToken(authHeader)
		if err != nil {
			c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok || !token.Valid {
			c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
			c.Abort()
			return
		}

		c.Set("user", claims)

		c.Next()
	}
}

// ValidateToken valída un token JWT y devuelve el token decodificado si es válido.
// Es importante que el token esté en el formato "Bearer <token>".
// Si el token es válido, devuelve el token decodificado y los claims asociados.
// Si el token no es válido o ha expirado, devuelve un error.

func ValidateToken(tokenString string) (*jwt.Token, error) {
	if !strings.HasPrefix(tokenString, "Bearer ") {
		return nil, errors.New("formato de token no válido")
	}

	tokenString = tokenString[7:]

	claims := jwt.MapClaims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("método de firma inesperado")
		}
		return config.JwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("token inválido o expirado")
	}

	return token, nil
}
