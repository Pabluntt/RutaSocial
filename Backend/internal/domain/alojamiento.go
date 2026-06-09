package domain

import (
	"go.mongodb.org/mongo-driver/v2/bson"
	"time"
)

type Alojamiento struct {
	ID           bson.ObjectID `bson:"_id,omitempty" json:"_id"`
	AuthorID     bson.ObjectID `bson:"author_id" json:"author_id"`
	Coords       []float64     `bson:"coords" json:"coords"`
	Name         string        `bson:"name" json:"name"`
	Cupos        int           `bson:"cupos" json:"cupos"`
	DateRegister time.Time     `bson:"date_register" json:"date_register"`
}
