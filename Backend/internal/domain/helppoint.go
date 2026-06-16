package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// PuntoAyuda representa un punto de ayuda en la aplicación.
// Incluye campos para la ruta asociada, coordenadas geográficas, fecha de registro, el autor del punto de ayuda,
// un comentario del punto y una lista de personas vistas en ese lugar.
type PuntoAyuda struct {
	ID           bson.ObjectID    `bson:"_id,omitempty" json:"_id"`
	RouteID      bson.ObjectID    `bson:"route_id" json:"route_id"`
	Coords       []float64        `bson:"coords" json:"coords"`
	DateRegister time.Time        `bson:"date_register" json:"date_register"`
	Comment      string           `bson:"comment,omitempty" json:"comment,omitempty"`
	People       []PersonaAyudada `bson:"people,omitempty" json:"people,omitempty"`
	PeopleHelped PersonaAyudada   `bson:"people_helped,omitempty" json:"people_helped,omitempty"`
	PersonaIDs   []bson.ObjectID  `bson:"persona_ids,omitempty" json:"persona_ids,omitempty"`
	AuthorID     bson.ObjectID    `bson:"author_id" json:"author_id"`
}
