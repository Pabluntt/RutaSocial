// Package app define la función StartBackend que se encarga de iniciar el backend de la aplicación.
// Este paquete se encarga de cargar la configuración (variables de entorno), iniciar la base de datos y configurar las rutas del servidor.
package app

import (
	"context"
	"log/slog"
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

	config.InitLogger()

	if err := config.LoadEnv(); err != nil {
		return err
	}

	if err := database.StartDB(); err != nil {
		return err
	}

	if err := database.EnsureIndexes(database.Client.Database(config.DBName)); err != nil {
		return err
	}

	if err := utils.CreateDefaultAdmin(database.Client.Database(config.DBName).Collection("usuarios")); err != nil {
		return err
	}

	router := routes.SetupRouter()
	addr := ":" + config.HTTPPort

	srv := &http.Server{
		Addr:    addr,
		Handler: router,
	}

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		slog.Info("Servidor iniciado", "port", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("Error en servidor HTTP", "error", err)
		}
	}()

	<-quit
	slog.Info("Apagando servidor...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		slog.Error("Error al apagar servidor", "error", err)
	}

	if err := database.Client.Disconnect(ctx); err != nil {
		slog.Error("Error al desconectar MongoDB", "error", err)
	}

	return nil
}
