package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// Aviso representa una notificación o aviso en la aplicación.
// Incluye campos para el ID del autor, una descripción del aviso, la fecha de creación y un campo booleano para indicar si se debe enviar un correo electrónico.
type Aviso struct {
	ID          bson.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	AuthorID    bson.ObjectID `bson:"author_id" json:"author_id"`
	Description string        `bson:"description" json:"description"`
	CreatedAt   time.Time     `bson:"created_at" json:"created_at"`
	SendEmail   bool          `bson:"send_email" json:"send_email"`
}
