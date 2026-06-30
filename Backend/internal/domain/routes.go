package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// Route representa una ruta social realizada por un usuario o grupo de usuarios.
// Incluye campos para el título, descripción, líder de la ruta, código de invitación, equipo, estado, fechas e institución.
type Route struct {
	ID              bson.ObjectID   `bson:"_id,omitempty" json:"_id,omitempty"`
	Title           string          `bson:"title" json:"title"`
	Description     string          `bson:"description" json:"description"`
	RouteLeader     bson.ObjectID   `bson:"route_leader" json:"route_leader"`
	RouteLeaderName string          `bson:"route_leader_name,omitempty" json:"route_leader_name"`
	InviteCode      string          `bson:"invite_code" json:"invite_code"`
	Team            []bson.ObjectID `bson:"team" json:"team"`
	Status          string          `bson:"status" json:"status"`
	DateCreated     time.Time       `bson:"date_created" json:"date_created"`
	DateFinished    time.Time       `bson:"date_finished" json:"date_finished"`
	InstitutionID   bson.ObjectID   `bson:"institution_id,omitempty" json:"institution_id,omitempty"`
}
