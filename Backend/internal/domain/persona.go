package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type AntecedenteEntry struct {
	ID          bson.ObjectID `bson:"_id,omitempty" json:"_id"`
	Fecha       time.Time     `bson:"fecha" json:"fecha"`
	Descripcion string        `bson:"descripcion" json:"descripcion"`
}

type Persona struct {
	ID                 bson.ObjectID      `bson:"_id,omitempty" json:"_id"`
	Nombre             string             `bson:"nombre" json:"nombre"`
	Rut                string             `bson:"rut,omitempty" json:"rut,omitempty"`
	Edad               int                `bson:"edad" json:"edad"`
	Genero             string             `bson:"genero" json:"genero"`
	Antecedentes       []AntecedenteEntry `bson:"antecedentes,omitempty" json:"antecedentes,omitempty"`
	InfoMedica         []AntecedenteEntry `bson:"info_medica,omitempty" json:"info_medica,omitempty"`
	FechaCreacion      time.Time          `bson:"fecha_creacion" json:"fecha_creacion"`
	FechaActualizacion time.Time          `bson:"fecha_actualizacion" json:"fecha_actualizacion"`
}
