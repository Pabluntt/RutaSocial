package utils

import (
	"github.com/stretchr/testify/assert"
	"strings"
	"testing"
)

func TestHashPassword_NormalString_StringHashed(t *testing.T) {
	testPassword := "HDC-Lo-Mejor"
	hashedPassword, err := HashPassword(testPassword)

	assert.NoError(t, err)
	assert.NotEqualf(t, testPassword, hashedPassword, "El hash no debe ser igual a la contraseña original")
	assert.True(t, CheckPasswordHash(testPassword, hashedPassword), "El hash debe coincidir con la contraseña original")
}

func FuzzHashPassword_CorrectPassword_True(f *testing.F) {
	f.Add("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#%^&*()_+")
	f.Add("áéíóúñ漢字")
	f.Add("A!@#$%^&*()")
	f.Fuzz(func(t *testing.T, password string) {
		if len(password) > 72 {
			password = password[:72]
		}
		hashedPassword, err := HashPassword(password)

		assert.NoError(t, err)
		assert.NotEqualf(t, password, hashedPassword, "El hash no debe ser igual a la contraseña original")
		assert.True(t, CheckPasswordHash(password, hashedPassword), "El hash debe coincidir con la contraseña original")
	})
}

func TestCheckPasswordHash_InvalidHash_False(t *testing.T) {
	ok := CheckPasswordHash("password", "hash_invalido")
	assert.False(t, ok, "El hash debe ser inválido")
}

func TestCheckPasswordHash_WrongPassword_False(t *testing.T) {
	password := "correcta"
	hash, _ := HashPassword(password)
	ok := CheckPasswordHash("incorrecta", hash)
	assert.False(t, ok, "Retornar false si la contraseña es incorrecta")
}

func TestHashPassword_LongPassword_Error(t *testing.T) {
	longPassword := strings.Repeat("a", 73)
	_, err := HashPassword(longPassword)
	assert.EqualError(t, err, "La contraseña no puede superar los 72 caracteres")
}
