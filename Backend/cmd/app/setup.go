// Package app define la función StartBackend que se encarga de iniciar el backend de la aplicación.
// Este paquete se encarga de cargar la configuración (variables de entorno), iniciar la base de datos y configurar las rutas del servidor.
package app

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

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

	if err := utils.CreateDefaultAdmin(database.Client.Database(config.DBName).Collection("usuarios")); err != nil {
		return err
	}

	router := routes.SetupRouter()

	srv := &http.Server{
		Addr:    ":8080",
		Handler: router,
	}

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		log.Println("Servidor iniciado en :8080")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Error en servidor HTTP: %v", err)
		}
	}()

	<-quit
	log.Println("Apagando servidor...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("Error al apagar servidor: %v", err)
	}

	if err := database.Client.Disconnect(ctx); err != nil {
		log.Printf("Error al desconectar MongoDB: %v", err)
	}

	return nil
}
