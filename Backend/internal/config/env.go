// Package config se encarga de cargar las variables de entorno necesarias para la aplicación.
package config

import (
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
)

// JwtSecret es la clave secreta utilizada para firmar y verificar tokens JWT.
var JwtSecret []byte

// LoadEnv carga las variables de entorno necesarias para la aplicación.
// Primero intenta cargar desde el archivo .env, luego carga la clave secreta para JWT desde la variable de entorno
func LoadEnv() error {
	// Intenta cargar el archivo .env desde la raíz del proyecto
	envPath := filepath.Join(".", ".env")
	if _, err := os.Stat(envPath); os.IsNotExist(err) {
		// Si no existe en la raíz, intenta dos niveles arriba (para cuando se ejecuta desde cmd/)
		envPath = filepath.Join("..", ".env")
	}
	_ = godotenv.Load(envPath)

	JwtSecret = []byte(os.Getenv("JWT_SECRET"))

	return nil
}
