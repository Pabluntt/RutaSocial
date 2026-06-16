package repository

import (
	"context"
	"errors"
	"github.com/SebaVCH/hdcProject/internal/domain"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"time"
)

type PersonaRepository interface {
	GetAll() ([]domain.Persona, error)
	GetByID(id string) (domain.Persona, error)
	GetByRut(rut string) (domain.Persona, error)
	Search(query string) ([]domain.Persona, error)
	Create(persona domain.Persona) (domain.Persona, error)
	Update(id string, data map[string]interface{}) (domain.Persona, error)
	Delete(id string) error
	AddAntecedente(personaID string, entry domain.AntecedenteEntry) error
	DeleteAntecedente(personaID string, entryID string) error
	AddInfoMedica(personaID string, entry domain.AntecedenteEntry) error
	DeleteInfoMedica(personaID string, entryID string) error
}

type personaRepository struct {
	collection *mongo.Collection
}

func NewPersonaRepository(collection *mongo.Collection) PersonaRepository {
	return &personaRepository{collection: collection}
}

func (r *personaRepository) GetAll() ([]domain.Persona, error) {
	cursor, err := r.collection.Find(context.Background(), bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var personas []domain.Persona
	for cursor.Next(context.Background()) {
		var p domain.Persona
		if err := cursor.Decode(&p); err != nil {
			return nil, err
		}
		personas = append(personas, p)
	}
	return personas, nil
}

func (r *personaRepository) GetByID(id string) (domain.Persona, error) {
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return domain.Persona{}, errors.New("ID de persona inválido")
	}

	var p domain.Persona
	err = r.collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&p)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return domain.Persona{}, errors.New("Persona no encontrada")
		}
		return domain.Persona{}, err
	}
	return p, nil
}

func (r *personaRepository) GetByRut(rut string) (domain.Persona, error) {
	var p domain.Persona
	err := r.collection.FindOne(context.Background(), bson.M{"rut": rut}).Decode(&p)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return domain.Persona{}, nil
		}
		return domain.Persona{}, err
	}
	return p, nil
}

func (r *personaRepository) Search(query string) ([]domain.Persona, error) {
	filter := bson.M{
		"$or": []bson.M{
			{"nombre": bson.M{"$regex": query, "$options": "i"}},
			{"rut": bson.M{"$regex": query, "$options": "i"}},
		},
	}
	cursor, err := r.collection.Find(context.Background(), filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var personas []domain.Persona
	for cursor.Next(context.Background()) {
		var p domain.Persona
		if err := cursor.Decode(&p); err != nil {
			return nil, err
		}
		personas = append(personas, p)
	}
	return personas, nil
}

func (r *personaRepository) Create(persona domain.Persona) (domain.Persona, error) {
	persona.ID = bson.NewObjectID()
	persona.FechaCreacion = time.Now()
	persona.FechaActualizacion = time.Now()
	if persona.Antecedentes == nil {
		persona.Antecedentes = []domain.AntecedenteEntry{}
	}
	if persona.InfoMedica == nil {
		persona.InfoMedica = []domain.AntecedenteEntry{}
	}
	_, err := r.collection.InsertOne(context.Background(), persona)
	if err != nil {
		return domain.Persona{}, err
	}
	return persona, nil
}

func (r *personaRepository) Update(id string, data map[string]interface{}) (domain.Persona, error) {
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return domain.Persona{}, errors.New("ID de persona inválido")
	}

	data["fecha_actualizacion"] = time.Now()
	update := bson.M{"$set": data}
	_, err = r.collection.UpdateOne(context.Background(), bson.M{"_id": objID}, update)
	if err != nil {
		return domain.Persona{}, err
	}

	var p domain.Persona
	err = r.collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&p)
	if err != nil {
		return domain.Persona{}, err
	}
	return p, nil
}

func (r *personaRepository) Delete(id string) error {
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("ID de persona inválido")
	}
	_, err = r.collection.DeleteOne(context.Background(), bson.M{"_id": objID})
	return err
}

func (r *personaRepository) addEntry(personaID string, field string, entry domain.AntecedenteEntry) error {
	objID, err := bson.ObjectIDFromHex(personaID)
	if err != nil {
		return errors.New("ID de persona inválido")
	}

	entry.ID = bson.NewObjectID()
	entry.Fecha = time.Now()

	_, err = r.collection.UpdateOne(
		context.Background(),
		bson.M{"_id": objID},
		bson.M{"$push": bson.M{field: entry}, "$set": bson.M{"fecha_actualizacion": time.Now()}},
	)
	return err
}

func (r *personaRepository) deleteEntry(personaID string, field string, entryID string) error {
	objID, err := bson.ObjectIDFromHex(personaID)
	if err != nil {
		return errors.New("ID de persona inválido")
	}
	entryObjID, err := bson.ObjectIDFromHex(entryID)
	if err != nil {
		return errors.New("ID de entrada inválido")
	}

	_, err = r.collection.UpdateOne(
		context.Background(),
		bson.M{"_id": objID},
		bson.M{"$pull": bson.M{field: bson.M{"_id": entryObjID}}, "$set": bson.M{"fecha_actualizacion": time.Now()}},
	)
	return err
}

func (r *personaRepository) AddAntecedente(personaID string, entry domain.AntecedenteEntry) error {
	return r.addEntry(personaID, "antecedentes", entry)
}

func (r *personaRepository) DeleteAntecedente(personaID string, entryID string) error {
	return r.deleteEntry(personaID, "antecedentes", entryID)
}

func (r *personaRepository) AddInfoMedica(personaID string, entry domain.AntecedenteEntry) error {
	return r.addEntry(personaID, "info_medica", entry)
}

func (r *personaRepository) DeleteInfoMedica(personaID string, entryID string) error {
	return r.deleteEntry(personaID, "info_medica", entryID)
}
