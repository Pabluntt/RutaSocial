package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// Route representa una ruta social realizada por un usuario o grupo de usuarios.
// Incluye campos para el título, descripción, líder de la ruta, código de invitación, equipo, estado, fecha de creación y fecha de finalización.
// Este struct se utiliza para gestionar las rutas sociales dentro de la aplicación, permitiendo a los usuarios crear y unirse a rutas con otros usuarios.
type Route struct {
	ID           bson.ObjectID   `bson:"_id,omitempty" json:"_id,omitempty"`
	Title        string          `bson:"title" json:"title"`
	Description  string          `bson:"description" json:"description"`
	RouteLeader  bson.ObjectID   `bson:"route_leader" json:"route_leader"`
	InviteCode   string          `bson:"invite_code" json:"invite_code"`
	Team         []bson.ObjectID `bson:"team" json:"team"`
	Status       string          `bson:"status" json:"status"`
	DateCreated  time.Time       `bson:"date_created" json:"date_created"`
	DateFinished time.Time       `bson:"date_finished" json:"date_finished"`
}
