package utils

import (
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestGenerateToken_NormalPayload_Token(t *testing.T) {
	userID := "12345"
	userRol := "admin"
	token, err := GenerateToken(userID, userRol)

	assert.NoError(t, err, "No debe haber error al generar token")
	assert.NotEmpty(t, token, "El token no debe estar vacío")
}

func FuzzGenerateToken_RandomPayload_Token(f *testing.F) {
	f.Add("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", "user")
	f.Add("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", "admin")
	f.Fuzz(func(t *testing.T, userID string, userRol string) {
		token, err := GenerateToken(userID, userRol)

		assert.NoError(t, err, "No debe haber error al generar token")
		assert.NotEmpty(t, token, "El token no debe estar vacío")
	})
}

func TestGenerateToken_Claims_Valid(t *testing.T) {
	userID := "testid"
	userRol := "tester"
	tokenStr, err := GenerateToken(userID, userRol)
	assert.NoError(t, err)

	token, _, err := new(jwt.Parser).ParseUnverified(tokenStr, jwt.MapClaims{})
	assert.NoError(t, err)

	claims, ok := token.Claims.(jwt.MapClaims)
	assert.True(t, ok)
	assert.Equal(t, userID, claims["user_id"])
	assert.Equal(t, userRol, claims["user_role"])
	assert.NotZero(t, claims["exp"])
}
