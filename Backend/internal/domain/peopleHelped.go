package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// PersonaAyudada representa la persona que fue ayudada en un punto de ayuda.
// Incluye campos para la edad, género, nombre y fecha de registro.
// Aca se almacena la información de la persona ayudada en un punto de ayuda, pero sus datos no son obligatorios.
type PersonaAyudada struct {
	ID           bson.ObjectID `bson:"_id,omitempty" json:"_id"`
	Age          int           `bson:"age" json:"age"`
	Gender       string        `bson:"gender" json:"gender"`
	Name         string        `bson:"name" json:"name"`
	DateRegister time.Time     `bson:"date" json:"date"`
}
