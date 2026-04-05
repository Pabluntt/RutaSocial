package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// PuntoAyuda representa un punto de ayuda en la aplicación.
// Incluye campos para la ruta asociada, coordenadas geográficas, fecha de registro y el autor del punto de ayuda.
// Cada punto de ayuda también tiene un campo para almacenar la información de la persona ayudada, que es una struct PersonaAyudada.
type PuntoAyuda struct {
	ID           bson.ObjectID  `bson:"_id,omitempty" json:"_id"`
	RouteID      bson.ObjectID  `bson:"route_id" json:"route_id"`
	Coords       []float64      `bson:"coords" json:"coords"`
	DateRegister time.Time      `bson:"date_register" json:"date_register"`
	PeopleHelped PersonaAyudada `bson:"people_helped" json:"people_helped"`
	AuthorID     bson.ObjectID  `bson:"author_id" json:"author_id"`
}
