// Package main es el punto de entrada de la aplicación
// Este archivo inicia el backend de la aplicación.
package main

import (
	"log/slog"
	"os"

	"github.com/SebaVCH/hdcProject/cmd/app"
)

// main es la función principal que inicia el backend de la aplicación.

// @title APIs de HDC
// @version 1.0
// @description Documentación de las APIs del proyecto HDC.

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:8080
// @BasePath /

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Se debe proporcionar un token JWT válido con el prefijo "Bearer" en el header de autorización para acceder a las rutas protegidas.

func main() {
	if err := app.StartBackend(); err != nil {
		slog.Error("Error fatal iniciando backend", "error", err)
		os.Exit(1)
	}
}
