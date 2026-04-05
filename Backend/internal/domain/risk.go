package domain

import (
	"go.mongodb.org/mongo-driver/v2/bson"
	"time"
)

// Riesgo representa un riesgo o peligro en la aplicación.
// Incluye campos para el ID del autor, coordenadas geográficas, estado del riesgo, fecha de registro y una descripción.
type Riesgo struct {
	ID           bson.ObjectID `bson:"_id,omitempty" json:"_id"`
	AuthorID     bson.ObjectID `bson:"author_id" json:"author_id"`
	Coords       []float64     `bson:"coords" json:"coords"`
	Status       string        `bson:"Status" json:"Status"`
	DateRegister time.Time     `bson:"date_register" json:"date_register"`
	Description  string        `bson:"description" json:"description"`
}
