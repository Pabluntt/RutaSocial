package utils

import (
	"github.com/SebaVCH/hdcProject/internal/config"
	"github.com/golang-jwt/jwt/v5"
	"time"
)

// GenerateToken crea un token JWT para un usuario dado su ID y rol.
// El token tiene una validez de 2 horas y contiene los claims user_id y user_role.
func GenerateToken(userID string, userRol string) (string, error) {
	claims := jwt.MapClaims{
		"user_id":   userID,
		"user_role": userRol,
		"exp":       time.Now().Add(time.Hour * 2).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	jwtSecret := config.JwtSecret
	return token.SignedString(jwtSecret)
}
