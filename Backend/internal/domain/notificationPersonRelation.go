package domain

import (
	"go.mongodb.org/mongo-driver/v2/bson"
	"time"
)

// NotificationPersonRelation representa la relación entre una notificación y una persona.
// Incluye campos para el ID de la notificación, el ID de la persona, la fecha en que se leyó la notificación y un campo booleano para indicar si se ha leído.
// Este struct se utiliza para gestionar la bandeja de notificaciones (por usuario) e indicar si las notificaciones fueron o no leídas.
type NotificationPersonRelation struct {
	ID             bson.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	NotificationID bson.ObjectID `bson:"notification_id" json:"notification_id"`
	PersonID       bson.ObjectID `bson:"person_id" json:"person_id"`
	ReadAt         time.Time     `bson:"read_at" json:"read_at"`
	Read           bool          `bson:"read" json:"read"`
	Dismissed      bool          `bson:"dismissed" json:"dismissed"`
}
