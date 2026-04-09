// Package config se encarga de cargar las variables de entorno necesarias para la aplicación.
package config

import (
	"os"

	"github.com/joho/godotenv"
)

// JwtSecret es la clave secreta utilizada para firmar y verificar tokens JWT.
var JwtSecret []byte

// LoadEnv carga las variables de entorno necesarias para la aplicación.
// En este caso, carga la clave secreta para JWT desde la variable de entorno
func LoadEnv() error {
	// Cargar el archivo .env
	_ = godotenv.Load()

	JwtSecret = []byte(os.Getenv("JWT_SECRET"))

	return nil
}
