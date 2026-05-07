package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// PersonaAyudada representa una persona vista o ayudada en un punto de ayuda.
// Incluye campos para la edad, género, nombre, RUT y fecha de registro.
type PersonaAyudada struct {
	ID           bson.ObjectID `bson:"_id,omitempty" json:"_id"`
	Age          int           `bson:"age" json:"age"`
	Gender       string        `bson:"gender" json:"gender"`
	Name         string        `bson:"name" json:"name"`
	Rut          string        `bson:"rut,omitempty" json:"rut,omitempty"`
	DateRegister time.Time     `bson:"date" json:"date"`
}
