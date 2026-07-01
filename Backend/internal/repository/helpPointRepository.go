package repository

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/Pabluntt/RutaSocial/Backend/internal/domain"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

// ErrPersonaNotFound se retorna cuando no se encuentra una persona.
var ErrPersonaNotFound = errors.New("persona no encontrada")

// HelpPointRepository define la interfaz para las operaciones relacionadas con puntos de ayuda.
// Contiene métodos para obtener, crear, actualizar y eliminar puntos de ayuda, así como buscar por ID y usuario.
type HelpPointRepository interface {
	GetAllPoints(ctx context.Context) ([]domain.PuntoAyuda, error)
	CreateHelpingPoint(ctx context.Context, helpPoint domain.PuntoAyuda, userID string) (domain.PuntoAyuda, error)
	UpdateHelpingPoint(ctx context.Context, data map[string]interface{}) (domain.PuntoAyuda, error)
	DeleteHelpingPoint(ctx context.Context, id string) error
	FindByIDAndUserID(ctx context.Context, id string, userID string) error
	LinkPersonaToHelpPoint(ctx context.Context, helpPointID string, personaID string) error
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
func (h *helpPointRepository) CreateHelpingPoint(ctx context.Context, helpPoint domain.PuntoAyuda, userID string) (domain.PuntoAyuda, error) {
	ctx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()
	helpPoint.ID = bson.NewObjectID()
	helpPoint.DateRegister = time.Now()
	userObjID, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return domain.PuntoAyuda{}, errors.New("ID de usuario inválido")
	}
	helpPoint.AuthorID = userObjID
	if len(helpPoint.People) == 0 && (helpPoint.PeopleHelped.Name != "" || helpPoint.PeopleHelped.Gender != "" || helpPoint.PeopleHelped.Age != 0 || helpPoint.PeopleHelped.Rut != "") {
		helpPoint.People = []domain.PersonaAyudada{helpPoint.PeopleHelped}
	}
	if len(helpPoint.People) > 0 {
		helpPoint.PeopleHelped = helpPoint.People[0]
	}

	var personaIDs []bson.ObjectID
	for index, personHelped := range helpPoint.People {
		personHelped.DateRegister = time.Now()
		personHelped.ID = bson.NewObjectID()
		_, err = h.PeopleHelpedCollections.InsertOne(ctx, personHelped)
		if err != nil {
			logRepositoryError(ctx, "help_point", "create.insert_people_helped", err, "collection", "people_helped", "user_id", userID)
			return domain.PuntoAyuda{}, err
		}

		var personaID bson.ObjectID
		if personHelped.PersonaID != "" {
			personaID, err = bson.ObjectIDFromHex(personHelped.PersonaID)
			if err != nil {
				return domain.PuntoAyuda{}, errors.New("ID de persona inválido")
			}
		}

		if personaID.IsZero() && index < len(helpPoint.PersonaIDs) && !helpPoint.PersonaIDs[index].IsZero() {
			personaID = helpPoint.PersonaIDs[index]
		}

		if !personaID.IsZero() {
			update := bson.M{
				"$set": bson.M{
					"nombre":              personHelped.Name,
					"rut":                 personHelped.Rut,
					"edad":                personHelped.Age,
					"genero":              personHelped.Gender,
					"fecha_actualizacion": time.Now(),
				},
			}
			result, err := h.PersonaCollection.UpdateOne(ctx, bson.M{"_id": personaID}, update)
			if err != nil {
				logRepositoryError(ctx, "help_point", "create.update_existing_persona", err, "collection", "personas", "user_id", userID, "persona_id", personaID.Hex())
				return domain.PuntoAyuda{}, err
			}
			if result.MatchedCount == 0 {
				return domain.PuntoAyuda{}, errors.New("persona existente no encontrada")
			}
		} else if personHelped.Rut != "" {
			var existing domain.Persona
			err = h.PersonaCollection.FindOne(ctx, bson.M{"rut": personHelped.Rut}).Decode(&existing)
			if err == nil {
				personaID = existing.ID
				update := bson.M{"$set": bson.M{"fecha_actualizacion": time.Now()}}
				_, err = h.PersonaCollection.UpdateOne(ctx, bson.M{"_id": personaID}, update)
				if err != nil {
					logRepositoryError(ctx, "help_point", "create.add_comment_to_persona_by_rut", err, "collection", "personas", "user_id", userID, "persona_id", personaID.Hex())
					return domain.PuntoAyuda{}, err
				}
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
				_, err = h.PersonaCollection.InsertOne(ctx, newPersona)
				if err == nil {
					personaID = newPersona.ID
				} else {
					logRepositoryError(ctx, "help_point", "create.insert_persona_with_rut", err, "collection", "personas", "user_id", userID)
				}
			} else {
				logRepositoryError(ctx, "help_point", "create.find_persona_by_rut", err, "collection", "personas", "user_id", userID)
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
			_, err := h.PersonaCollection.InsertOne(ctx, newPersona)
			if err == nil {
				personaID = newPersona.ID
			} else {
				logRepositoryError(ctx, "help_point", "create.insert_persona_without_rut", err, "collection", "personas", "user_id", userID)
			}
		}

		if !personaID.IsZero() {
			personaIDs = append(personaIDs, personaID)
		}
	}
	helpPoint.PersonaIDs = personaIDs

	_, err = h.HelpPointCollection.InsertOne(ctx, helpPoint)
	if err != nil {
		logRepositoryError(ctx, "help_point", "create.insert_help_point", err, "collection", "help_points", "user_id", userID, "people_count", len(helpPoint.People))
		return domain.PuntoAyuda{}, err
	}

	return helpPoint, nil
}

// UpdateHelpingPoint actualiza un punto de ayuda en la base de datos.
// Recibe un mapa de datos a actualizar, verifica el ID del punto de ayuda y actualiza los campos correspondientes.
func (h *helpPointRepository) UpdateHelpingPoint(ctx context.Context, data map[string]interface{}) (domain.PuntoAyuda, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	idStr, ok := data["_id"].(string)
	if !ok {
		return domain.PuntoAyuda{}, errors.New("ID de punto de ayuda no proporcionado o inválido")
	}
	objID, err := bson.ObjectIDFromHex(idStr)
	if err != nil {
		return domain.PuntoAyuda{}, errors.New("ID de punto de ayuda inválido")
	}

	var existingHelpPoint domain.PuntoAyuda
	if err := h.HelpPointCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&existingHelpPoint); err != nil {
		logRepositoryError(ctx, "help_point", "update.find_existing", err, "collection", "help_points", "help_point_id", idStr)
		return domain.PuntoAyuda{}, err
	}

	delete(data, "_id")

	allowedFields := map[string]bool{
		"comment": true, "people": true, "coords": true,
	}
	filtered := make(map[string]interface{})
	for k, v := range data {
		if allowedFields[k] {
			filtered[k] = v
		}
	}

	update := bson.M{"$set": filtered}
	_, err = h.HelpPointCollection.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		logRepositoryError(ctx, "help_point", "update.update_one", err, "collection", "help_points", "help_point_id", idStr)
		return domain.PuntoAyuda{}, err
	}

	if comment, ok := filtered["comment"].(string); ok && strings.TrimSpace(comment) != "" && comment != existingHelpPoint.Comment && len(existingHelpPoint.PersonaIDs) > 0 {
		_, err = h.PersonaCollection.UpdateMany(
			ctx,
			bson.M{"_id": bson.M{"$in": existingHelpPoint.PersonaIDs}},
			bson.M{"$set": bson.M{"fecha_actualizacion": time.Now()}},
		)
		if err != nil {
			logRepositoryError(ctx, "help_point", "update.touch_personas", err, "collection", "personas", "help_point_id", idStr)
			return domain.PuntoAyuda{}, err
		}
	}

	var updatedHelpPoint domain.PuntoAyuda
	err = h.HelpPointCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&updatedHelpPoint)
	if err != nil {
		logRepositoryError(ctx, "help_point", "update.find_updated", err, "collection", "help_points", "help_point_id", idStr)
		return domain.PuntoAyuda{}, err
	}
	return updatedHelpPoint, nil
}

// DeleteHelpingPoint elimina un punto de ayuda por su ID.
// Convierte el ID de cadena a ObjectID y elimina el documento correspondiente de la colección.
func (h *helpPointRepository) DeleteHelpingPoint(ctx context.Context, id string) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("ID de punto de ayuda inválido")
	}
	_, err = h.HelpPointCollection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		logRepositoryError(ctx, "help_point", "delete.delete_one", err, "collection", "help_points", "help_point_id", id)
	}
	return err
}

// GetAllPoints obtiene todos los puntos de ayuda de la base de datos.
func (h *helpPointRepository) GetAllPoints(ctx context.Context) ([]domain.PuntoAyuda, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	cursor, err := h.HelpPointCollection.Find(ctx, bson.M{})
	if err != nil {
		logRepositoryError(ctx, "help_point", "get_all.find", err, "collection", "help_points")
		return nil, err
	}
	defer cursor.Close(ctx)

	var helpPoints []domain.PuntoAyuda
	for cursor.Next(ctx) {
		var helpPoint domain.PuntoAyuda
		if err := cursor.Decode(&helpPoint); err != nil {
			logRepositoryError(ctx, "help_point", "get_all.decode", err, "collection", "help_points")
			return nil, err
		}
		helpPoints = append(helpPoints, helpPoint)
	}
	if err := cursor.Err(); err != nil {
		logRepositoryError(ctx, "help_point", "get_all.cursor", err, "collection", "help_points")
		return nil, err
	}
	return helpPoints, nil
}

// LinkPersonaToHelpPoint agrega un ID de persona a la lista persona_ids de un punto de ayuda.
func (h *helpPointRepository) LinkPersonaToHelpPoint(ctx context.Context, helpPointID string, personaID string) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	hpObjID, err := bson.ObjectIDFromHex(helpPointID)
	if err != nil {
		return errors.New("ID de punto de ayuda inválido")
	}
	pObjID, err := bson.ObjectIDFromHex(personaID)
	if err != nil {
		return errors.New("ID de persona inválido")
	}

	_, err = h.HelpPointCollection.UpdateOne(
		ctx,
		bson.M{"_id": hpObjID},
		bson.M{"$addToSet": bson.M{"persona_ids": pObjID}},
	)
	if err != nil {
		logRepositoryError(ctx, "help_point", "link_persona.update_one", err, "collection", "help_points", "help_point_id", helpPointID, "persona_id", personaID)
	}
	return err
}

// FindByIDAndUserID busca un punto de ayuda por su ID y el ID del usuario.
// Convierte el ID de cadena a ObjectID y verifica si el punto de ayuda pertenece al usuario especificado.
func (h *helpPointRepository) FindByIDAndUserID(ctx context.Context, id string, userID string) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
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
	err = h.HelpPointCollection.FindOne(ctx, filter).Decode(&puntoAyuda)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return errors.New("Punto no encontrado o no autorizado")
		}
		logRepositoryError(ctx, "help_point", "find_by_id_and_user.find_one", err, "collection", "help_points", "help_point_id", id, "user_id", userID)
		return err
	}
	return nil
}
