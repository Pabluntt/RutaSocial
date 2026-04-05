// Package utils presenta funciones utiles para el proyecto.
// Este paquete incluye funciones para:
//   - Hashing y verificación de contraseñas con bcrypt
//   - Validación de datos de entrada
//   - Generación de códigos de ruta
//   - Generación de JWT
//   - Envío de correos electrónicos (registro y notificaciones)
package utils

import (
	"errors"
	"golang.org/x/crypto/bcrypt"
)

// HashPassword toma una contraseña y la encripta usando bcrypt.
// Retorna el hash de la contraseña o un error si la contraseña es demasiado larga o si ocurre un error al generar el hash.
func HashPassword(password string) (string, error) {
	if len(password) > 72 {
		return "", errors.New("La contraseña no puede superar los 72 caracteres")
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

// CheckPasswordHash compara una contraseña con su hash almacenado.
// Retorna true si la contraseña coincide con el hash, de lo contrario retorna false.
func CheckPasswordHash(password, hash string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}
