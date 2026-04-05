// Package database contiene la lógica para conectar a la base de datos MongoDB.
// Este paquete se encarga de iniciar la conexión a la base de datos al arrancar la aplicación.
package database

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// Client es la variable cliente de MongoDB que se utilizará de forma global para interactuar con la base de datos.
var Client *mongo.Client

// StartDB inicia la conexión a la base de datos MongoDB utilizando la URI proporcionada en las variables de entorno.
// Si la conexión es exitosa, se asigna el cliente a la variable global Client que será utilizado para acceder a la base de datos y colecciones.
// Si ocurre un error durante la conexión, se devuelve el error correspondiente.
func StartDB() error {
	var uri string

	if uri = os.Getenv("MONGODB_URI"); uri == "" {
		log.Fatal("Error al obtener la URI del la DB")
	}

	serverAPI := options.ServerAPI(options.ServerAPIVersion1)
	opts := options.Client().ApplyURI(uri).SetServerAPIOptions(serverAPI)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(opts)

	if err != nil {
		return err
	}

	if err = client.Ping(ctx, nil); err != nil {
		return err
	}

	Client = client
	log.Println("Conectado a MongoDB correctamente")
	return nil
}
