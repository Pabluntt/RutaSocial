package domain

import "go.mongodb.org/mongo-driver/v2/bson"

// Institution representa la institución a la que pertenece un usuario.
// Incluye el nombre de la institución y un color asociado.
type Institution struct {
	ID    bson.ObjectID `bson:"_id,omitempty" json:"_id"`
	Name  string        `bson:"name" json:"name"`
	Color string        `bson:"color" json:"color"`
}
