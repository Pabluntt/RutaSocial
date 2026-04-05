// Package app define la función StartBackend que se encarga de iniciar el backend de la aplicación.
// Este paquete se encarga de cargar la configuración (variables de entorno), iniciar la base de datos y configurar las rutas del servidor.
package app

import (
	"github.com/SebaVCH/hdcProject/internal/config"
	"github.com/SebaVCH/hdcProject/internal/infrastructure/database"
	"github.com/SebaVCH/hdcProject/internal/interfaces/routes"
	"github.com/SebaVCH/hdcProject/internal/utils"
)

// StartBackend inicia el backend de la aplicación.
// Carga la configuración desde el archivo .env, inicia la conexión a la base de datos y configura las rutas del servidor.
func StartBackend() error {

	if err := config.LoadEnv(); err != nil {
		return err
	}

	if err := database.StartDB(); err != nil {
		return err
	}

	if err := utils.CreateDefaultAdmin(database.Client.Database("pip").Collection("usuarios")); err != nil {
		return err
	}
	
	if err := routes.SetupRouter().Run(":8080"); err != nil {
		return err
	}

	return nil
}
