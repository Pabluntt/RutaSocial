package repository

import (
	"context"
	"errors"
	"github.com/SebaVCH/hdcProject/internal/domain"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"time"
)

// ErrPersonaNotFound se retorna cuando no se encuentra una persona.
var ErrPersonaNotFound = errors.New("persona no encontrada")

// HelpPointRepository define la interfaz para las operaciones relacionadas con puntos de ayuda.
// Contiene métodos para obtener, crear, actualizar y eliminar puntos de ayuda, así como buscar por ID y usuario.
type HelpPointRepository interface {
	GetAllPoints() ([]domain.PuntoAyuda, error)
	CreateHelpingPoint(helpPoint domain.PuntoAyuda, userID string) (domain.PuntoAyuda, error)
	UpdateHelpingPoint(data map[string]interface{}) (domain.PuntoAyuda, error)
	DeleteHelpingPoint(id string) error
	FindByIDAndUserID(id string, userID string) error
	LinkPersonaToHelpPoint(helpPointID string, personaID string) error
}

// helpPointRepository implementa la interfaz HelpPointRepository.
// Contiene colecciones de puntos de ayuda y personas ayudadas para interactuar con la base de datos.
type helpPointRepository struct {
	HelpPointCollection     *mongo.Collection
	PeopleHelpedCollections *mongo.Collection
	PersonaCollection       *mongo.Collection
}

// NewHelpPointRepository crea una nueva instancia de helpPointRepository.
// Recibe colecciones de puntos de ayuda y personas ayudadas y retorna una instancia de HelpPointRepository.
func NewHelpPointRepository(helpPointCollection *mongo.Collection, peopleHelpedCollection *mongo.Collection, personaCollection *mongo.Collection) HelpPointRepository {
	return &helpPointRepository{
		HelpPointCollection:     helpPointCollection,
		PeopleHelpedCollections: peopleHelpedCollection,
		PersonaCollection:       personaCollection,
	}
}

// CreateHelpingPoint crea un nuevo punto de ayuda en la base de datos.
// Asigna un ID nuevo, la fecha de registro y el ID del autor antes de insertar el documento.
// Tambien guarda una copia de cada persona en la coleccion people_helped para mantener compatibilidad.
// Crea o vincula personas en la coleccion personas segun corresponda.
func (h *helpPointRepository) CreateHelpingPoint(helpPoint domain.PuntoAyuda, userID string) (domain.PuntoAyuda, error) {
	helpPoint.ID = bson.NewObjectID()
	helpPoint.DateRegister = time.Now()
	helpPoint.AuthorID, _ = bson.ObjectIDFromHex(userID)
	if len(helpPoint.People) == 0 && (helpPoint.PeopleHelped.Name != "" || helpPoint.PeopleHelped.Gender != "" || helpPoint.PeopleHelped.Age != 0 || helpPoint.PeopleHelped.Rut != "") {
		helpPoint.People = []domain.PersonaAyudada{helpPoint.PeopleHelped}
	}
	if len(helpPoint.People) > 0 {
		helpPoint.PeopleHelped = helpPoint.People[0]
	}

	var personaIDs []bson.ObjectID
	for _, personHelped := range helpPoint.People {
		personHelped.DateRegister = time.Now()
		personHelped.ID = bson.NewObjectID()
		_, err := h.PeopleHelpedCollections.InsertOne(context.Background(), personHelped)
		if err != nil {
			return domain.PuntoAyuda{}, err
		}

		var personaID bson.ObjectID
		if personHelped.Rut != "" {
			var existing domain.Persona
			err = h.PersonaCollection.FindOne(context.Background(), bson.M{"rut": personHelped.Rut}).Decode(&existing)
			if err == nil {
				personaID = existing.ID
			} else if err == mongo.ErrNoDocuments {
				newPersona := domain.Persona{
					ID:            bson.NewObjectID(),
					Nombre:        personHelped.Name,
					Rut:           personHelped.Rut,
					Edad:          personHelped.Age,
					Genero:        personHelped.Gender,
					Antecedentes:  []domain.AntecedenteEntry{},
					InfoMedica:    []domain.AntecedenteEntry{},
					FechaCreacion: time.Now(),
				}
				_, err = h.PersonaCollection.InsertOne(context.Background(), newPersona)
				if err == nil {
					personaID = newPersona.ID
				}
			}
		} else {
			newPersona := domain.Persona{
				ID:            bson.NewObjectID(),
				Nombre:        personHelped.Name,
				Rut:           "",
				Edad:          personHelped.Age,
				Genero:        personHelped.Gender,
				Antecedentes:  []domain.AntecedenteEntry{},
				InfoMedica:    []domain.AntecedenteEntry{},
				FechaCreacion: time.Now(),
			}
			_, err := h.PersonaCollection.InsertOne(context.Background(), newPersona)
			if err == nil {
				personaID = newPersona.ID
			}
		}

		if !personaID.IsZero() {
			personaIDs = append(personaIDs, personaID)
		}
	}
	helpPoint.PersonaIDs = personaIDs

	_, err := h.HelpPointCollection.InsertOne(context.Background(), helpPoint)
	if err != nil {
		return domain.PuntoAyuda{}, err
	}

	return helpPoint, nil
}

// UpdateHelpingPoint actualiza un punto de ayuda en la base de datos.
// Recibe un mapa de datos a actualizar, verifica el ID del punto de ayuda y actualiza los campos correspondientes.
func (h *helpPointRepository) UpdateHelpingPoint(data map[string]interface{}) (domain.PuntoAyuda, error) {
	idStr, ok := data["_id"].(string)
	if !ok {
		return domain.PuntoAyuda{}, errors.New("ID de punto de ayuda no proporcionado o inválido")
	}
	objID, err := bson.ObjectIDFromHex(idStr)
	if err != nil {
		return domain.PuntoAyuda{}, errors.New("ID de punto de ayuda inválido")
	}
	delete(data, "_id")

	update := bson.M{"$set": data}
	_, err = h.HelpPointCollection.UpdateOne(context.Background(), bson.M{"_id": objID}, update)
	if err != nil {
		return domain.PuntoAyuda{}, err
	}

	var updatedHelpPoint domain.PuntoAyuda
	err = h.HelpPointCollection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&updatedHelpPoint)
	if err != nil {
		return domain.PuntoAyuda{}, err
	}
	return updatedHelpPoint, nil
}

// DeleteHelpingPoint elimina un punto de ayuda por su ID.
// Convierte el ID de cadena a ObjectID y elimina el documento correspondiente de la colección.
func (h *helpPointRepository) DeleteHelpingPoint(id string) error {
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("ID de punto de ayuda inválido")
	}
	_, err = h.HelpPointCollection.DeleteOne(context.Background(), bson.M{"_id": objID})
	return err
}

// GetAllPoints obtiene todos los puntos de ayuda de la base de datos.
func (h *helpPointRepository) GetAllPoints() ([]domain.PuntoAyuda, error) {
	cursor, err := h.HelpPointCollection.Find(context.Background(), bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var helpPoints []domain.PuntoAyuda
	for cursor.Next(context.Background()) {
		var helpPoint domain.PuntoAyuda
		if err := cursor.Decode(&helpPoint); err != nil {
			return nil, err
		}
		helpPoints = append(helpPoints, helpPoint)
	}
	return helpPoints, nil
}

// LinkPersonaToHelpPoint agrega un ID de persona a la lista persona_ids de un punto de ayuda.
func (h *helpPointRepository) LinkPersonaToHelpPoint(helpPointID string, personaID string) error {
	hpObjID, err := bson.ObjectIDFromHex(helpPointID)
	if err != nil {
		return errors.New("ID de punto de ayuda inválido")
	}
	pObjID, err := bson.ObjectIDFromHex(personaID)
	if err != nil {
		return errors.New("ID de persona inválido")
	}

	_, err = h.HelpPointCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": hpObjID},
		bson.M{"$addToSet": bson.M{"persona_ids": pObjID}},
	)
	return err
}

// FindByIDAndUserID busca un punto de ayuda por su ID y el ID del usuario.
// Convierte el ID de cadena a ObjectID y verifica si el punto de ayuda pertenece al usuario especificado.
func (h *helpPointRepository) FindByIDAndUserID(id string, userID string) error {
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("ID de punto de ayuda inválido")
	}
	userObjID, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return errors.New("ID de usuario inválido")
	}

	var puntoAyuda domain.PuntoAyuda
	filter := bson.M{"_id": objID, "author_id": userObjID}
	err = h.HelpPointCollection.FindOne(context.Background(), filter).Decode(&puntoAyuda)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return errors.New("Punto no encontrado o no autorizado")
		}
		return err
	}
	return nil
}
