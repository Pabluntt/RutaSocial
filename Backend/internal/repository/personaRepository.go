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
GetAll(ctx context.Context) ([]domain.Persona, error)
GetByID(ctx context.Context, id string) (domain.Persona, error)
GetByRut(ctx context.Context, rut string) (domain.Persona, error)
Search(ctx context.Context, query string) ([]domain.Persona, error)
Create(ctx context.Context, persona domain.Persona) (domain.Persona, error)
Update(ctx context.Context, id string, data map[string]interface{}) (domain.Persona, error)
Delete(ctx context.Context, id string) error
AddAntecedente(ctx context.Context, personaID string, entry domain.AntecedenteEntry) error
DeleteAntecedente(ctx context.Context, personaID string, entryID string) error
AddInfoMedica(ctx context.Context, personaID string, entry domain.AntecedenteEntry) error
DeleteInfoMedica(ctx context.Context, personaID string, entryID string) error
}

type personaRepository struct {
	collection *mongo.Collection
}

func NewPersonaRepository(collection *mongo.Collection) PersonaRepository {
	return &personaRepository{collection: collection}
}

func (r *personaRepository) GetAll(ctx context.Context) ([]domain.Persona, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var personas []domain.Persona
	for cursor.Next(ctx) {
		var p domain.Persona
		if err := cursor.Decode(&p); err != nil {
			return nil, err
		}
		personas = append(personas, p)
	}
	return personas, nil
}

func (r *personaRepository) GetByID(ctx context.Context, id string) (domain.Persona, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return domain.Persona{}, errors.New("ID de persona inválido")
	}

	var p domain.Persona
	err = r.collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&p)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return domain.Persona{}, errors.New("Persona no encontrada")
		}
		return domain.Persona{}, err
	}
	return p, nil
}

func (r *personaRepository) GetByRut(ctx context.Context, rut string) (domain.Persona, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	var p domain.Persona
	err := r.collection.FindOne(ctx, bson.M{"rut": rut}).Decode(&p)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return domain.Persona{}, nil
		}
		return domain.Persona{}, err
	}
	return p, nil
}

func (r *personaRepository) Search(ctx context.Context, query string) ([]domain.Persona, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	filter := bson.M{
		"$or": []bson.M{
			{"nombre": bson.M{"$regex": query, "$options": "i"}},
			{"rut": bson.M{"$regex": query, "$options": "i"}},
		},
	}
	cursor, err := r.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var personas []domain.Persona
	for cursor.Next(ctx) {
		var p domain.Persona
		if err := cursor.Decode(&p); err != nil {
			return nil, err
		}
		personas = append(personas, p)
	}
	return personas, nil
}

func (r *personaRepository) Create(ctx context.Context, persona domain.Persona) (domain.Persona, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	persona.ID = bson.NewObjectID()
	persona.FechaCreacion = time.Now()
	persona.FechaActualizacion = time.Now()
	if persona.Antecedentes == nil {
		persona.Antecedentes = []domain.AntecedenteEntry{}
	}
	if persona.InfoMedica == nil {
		persona.InfoMedica = []domain.AntecedenteEntry{}
	}
	_, err := r.collection.InsertOne(ctx, persona)
	if err != nil {
		return domain.Persona{}, err
	}
	return persona, nil
}

func (r *personaRepository) Update(ctx context.Context, id string, data map[string]interface{}) (domain.Persona, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return domain.Persona{}, errors.New("ID de persona inválido")
	}

	data["fecha_actualizacion"] = time.Now()
	update := bson.M{"$set": data}
	_, err = r.collection.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		return domain.Persona{}, err
	}

	var p domain.Persona
	err = r.collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&p)
	if err != nil {
		return domain.Persona{}, err
	}
	return p, nil
}

func (r *personaRepository) Delete(ctx context.Context, id string) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("ID de persona inválido")
	}
	_, err = r.collection.DeleteOne(ctx, bson.M{"_id": objID})
	return err
}

func (r *personaRepository) addEntry(ctx context.Context, personaID string, field string, entry domain.AntecedenteEntry) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	objID, err := bson.ObjectIDFromHex(personaID)
	if err != nil {
		return errors.New("ID de persona inválido")
	}

	entry.ID = bson.NewObjectID()
	entry.Fecha = time.Now()

	_, err = r.collection.UpdateOne(
		ctx,
		bson.M{"_id": objID},
		bson.M{"$push": bson.M{field: entry}, "$set": bson.M{"fecha_actualizacion": time.Now()}},
	)
	return err
}

func (r *personaRepository) deleteEntry(ctx context.Context, personaID string, field string, entryID string) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	objID, err := bson.ObjectIDFromHex(personaID)
	if err != nil {
		return errors.New("ID de persona inválido")
	}
	entryObjID, err := bson.ObjectIDFromHex(entryID)
	if err != nil {
		return errors.New("ID de entrada inválido")
	}

	_, err = r.collection.UpdateOne(
		ctx,
		bson.M{"_id": objID},
		bson.M{"$pull": bson.M{field: bson.M{"_id": entryObjID}}, "$set": bson.M{"fecha_actualizacion": time.Now()}},
	)
	return err
}

func (r *personaRepository) AddAntecedente(ctx context.Context, personaID string, entry domain.AntecedenteEntry) error {
	return r.addEntry(ctx, personaID, "antecedentes", entry)
}

func (r *personaRepository) DeleteAntecedente(ctx context.Context, personaID string, entryID string) error {
	return r.deleteEntry(ctx, personaID, "antecedentes", entryID)
}

func (r *personaRepository) AddInfoMedica(ctx context.Context, personaID string, entry domain.AntecedenteEntry) error {
	return r.addEntry(ctx, personaID, "info_medica", entry)
}

func (r *personaRepository) DeleteInfoMedica(ctx context.Context, personaID string, entryID string) error {
	return r.deleteEntry(ctx, personaID, "info_medica", entryID)
}




