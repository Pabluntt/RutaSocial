package repository

import (
	"context"
	"errors"
	"time"

	"github.com/SebaVCH/hdcProject/internal/domain"
	"github.com/SebaVCH/hdcProject/internal/utils"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

// RouteRepository define la interfaz para las operaciones relacionadas con rutas.
// Contiene métodos para obtener, crear, actualizar, eliminar y unirse a rutas.
type RouteRepository interface {
	FindAll() ([]domain.Route, error)
	FindByID(routeId string) (domain.Route, error)
	CreateRoute(route *domain.Route) error
	UpdateRoute(data map[string]interface{}) (domain.Route, error)
	DeleteRoute(routeId string) error
	FinishRoute(id string) error
	JoinRoute(code string, userID string) (domain.Route, error)
	LeaveRoute(routeId string, userID string) error
	GetMyParticipation(userID string) (map[string]int, error)
	GetHelpPointsByRouteID(routeID string) ([]domain.PuntoAyuda, error)
	GetRoutesByUserID(userID string) ([]domain.Route, error)
}

// routeRepository implementa la interfaz RouteRepository.
// Contiene colecciones de rutas y puntos de ayuda para interactuar con la base de datos.
type routeRepository struct {
	RouteCollection     *mongo.Collection
	HelpPointCollection *mongo.Collection
	PersonaCollection   *mongo.Collection
}

// NewRouteRepository crea una nueva instancia de routeRepository.
// Recibe colecciones de rutas y puntos de ayuda y retorna una instancia de RouteRepository.
func NewRouteRepository(routeCollection *mongo.Collection, helpPointCollection *mongo.Collection, personaCollection *mongo.Collection) RouteRepository {
	return &routeRepository{
		RouteCollection:     routeCollection,
		HelpPointCollection: helpPointCollection,
		PersonaCollection:   personaCollection,
	}
}

// FindAll obtiene todas las rutas de la base de datos.
// Retorna un slice de rutas o un error si ocurre algún problema.
func (r *routeRepository) FindAll() ([]domain.Route, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	cursor, err := r.RouteCollection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var routes []domain.Route
	if err := cursor.All(ctx, &routes); err != nil {
		return nil, err
	}
	return routes, nil
}

// FindByID obtiene una ruta por su ID.
// Recibe el ID como string, lo convierte a ObjectID y busca en la colección.
func (r *routeRepository) FindByID(routeId string) (domain.Route, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	objID, err := bson.ObjectIDFromHex(routeId)
	if err != nil {
		return domain.Route{}, errors.New("ID de ruta inválido")
	}

	var route domain.Route
	err = r.RouteCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&route)
	if err != nil {
		return domain.Route{}, err
	}
	return route, nil
}

// CreateRoute crea una nueva ruta en la base de datos.
// Asigna un nuevo ID, establece la fecha de creación, el estado y el código de invitación.
func (r *routeRepository) CreateRoute(route *domain.Route) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	route.ID = bson.NewObjectID()
	route.DateCreated = time.Now()
	route.Status = "on progress"
	route.InviteCode = utils.NewInviteCode()
	if route.Team == nil {
		route.Team = []bson.ObjectID{}
	}
	_, err := r.RouteCollection.InsertOne(ctx, route)
	if err != nil {
		return err
	}
	return nil
}

// UpdateRoute actualiza una ruta existente en la base de datos.
// Recibe un mapa de datos a actualizar y el ID de la ruta.
func (r *routeRepository) UpdateRoute(data map[string]interface{}) (domain.Route, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	idStr, ok := data["_id"].(string)
	if !ok {
		return domain.Route{}, errors.New("ID de ruta no proporcionado o inválido")
	}
	objID, err := bson.ObjectIDFromHex(idStr)
	if err != nil {
		return domain.Route{}, errors.New("ID de ruta inválido")
	}
	delete(data, "_id")

	allowedFields := map[string]bool{
		"title": true, "description": true,
	}
	filtered := make(map[string]interface{})
	for k, v := range data {
		if allowedFields[k] {
			filtered[k] = v
		}
	}

	update := bson.M{"$set": filtered}
	_, err = r.RouteCollection.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		return domain.Route{}, err
	}

	var updatedRoute domain.Route
	err = r.RouteCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&updatedRoute)
	if err != nil {
		return domain.Route{}, err
	}
	return updatedRoute, nil
}

// DeleteRoute elimina una ruta de la base de datos por su ID.
// Convierte el ID de cadena a ObjectID y elimina el documento correspondiente.
func (r *routeRepository) DeleteRoute(routeId string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	objID, err := bson.ObjectIDFromHex(routeId)
	if err != nil {
		return errors.New("ID de ruta inválido")
	}

	_, err = r.RouteCollection.DeleteOne(ctx, bson.M{"_id": objID})
	return err
}

// FinishRoute marca una ruta como finalizada.
// Recibe el ID de la ruta, lo convierte a ObjectID y actualiza su estado y fecha de finalización.
func (r *routeRepository) FinishRoute(id string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("ID de ruta inválido")
	}

	update := bson.M{"$set": bson.M{"status": "Finalizada", "date_finished": time.Now()}}
	_, err = r.RouteCollection.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		return err
	}

	return nil
}

// JoinRoute permite a un usuario unirse a una ruta utilizando un código de invitación.
// Verifica si la ruta existe, si no está finalizada y si el usuario ya es parte del equipo.
// Si todas las condiciones se cumplen, agrega al usuario al equipo de la ruta y retorna la ruta actualizada.
func (r *routeRepository) JoinRoute(code string, userID string) (domain.Route, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	var route domain.Route
	err := r.RouteCollection.FindOne(ctx, bson.M{"invite_code": code}).Decode(&route)
	if err != nil {
		return domain.Route{}, errors.New("Ruta no encontrada")
	}

	if route.Status == "Finalizada" {
		return domain.Route{}, errors.New("No puedes unirte a una ruta finalizada")
	}

	for _, member := range route.Team {
		if member.Hex() == userID {
			return domain.Route{}, errors.New("Ya eres parte de esta ruta")
		}
	}

	userObjID, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return domain.Route{}, errors.New("ID de usuario inválido")
	}

	update := bson.M{"$push": bson.M{"team": userObjID}}
	_, err = r.RouteCollection.UpdateOne(ctx, bson.M{"_id": route.ID}, update)
	if err != nil {
		return domain.Route{}, err
	}

	err = r.RouteCollection.FindOne(ctx, bson.M{"_id": route.ID}).Decode(&route)
	if err != nil {
		return domain.Route{}, err
	}

	return route, nil
}

// LeaveRoute permite a un usuario salir de una ruta.
// Recibe el ID de la ruta y el ID del usuario, verifica que ambos sean válidos
// y elimina al usuario del equipo de la ruta usando $pull.
func (r *routeRepository) LeaveRoute(routeId string, userID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	routeObjID, err := bson.ObjectIDFromHex(routeId)
	if err != nil {
		return errors.New("ID de ruta inválido")
	}

	userObjID, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return errors.New("ID de usuario inválido")
	}

	var route domain.Route
	err = r.RouteCollection.FindOne(ctx, bson.M{"_id": routeObjID}).Decode(&route)
	if err != nil {
		return errors.New("Ruta no encontrada")
	}

	if route.Status == "Finalizada" {
		return errors.New("No puedes salir de una ruta finalizada")
	}

	found := false
	for _, member := range route.Team {
		if member == userObjID {
			found = true
			break
		}
	}
	if !found {
		return errors.New("No eres parte de esta ruta")
	}

	update := bson.M{"$pull": bson.M{"team": userObjID}}
	_, err = r.RouteCollection.UpdateOne(ctx, bson.M{"_id": routeObjID}, update)
	if err != nil {
		return err
	}

	return nil
}

// GetRoutesByUserID obtiene todas las rutas asociadas a un usuario (como líder o miembro del equipo).
// Recibe el ID del usuario como string y retorna un slice de rutas.
func (r *routeRepository) GetRoutesByUserID(userID string) ([]domain.Route, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	userObjID, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return nil, errors.New("ID de usuario inválido")
	}

	filter := bson.M{
		"$or": []bson.M{
			{"route_leader": userObjID},
			{"team": userObjID},
		},
	}
	cursor, err := r.RouteCollection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var routes []domain.Route
	if err := cursor.All(ctx, &routes); err != nil {
		return nil, err
	}
	return routes, nil
}

// GetHelpPointsByRouteID obtiene todos los puntos de ayuda asociados a una ruta.
// Recibe el ID de la ruta como string y retorna un slice de PuntoAyuda.
// Si un punto tiene persona_ids pero no people, busca las personas en la coleccion personas.
func (r *routeRepository) GetHelpPointsByRouteID(routeID string) ([]domain.PuntoAyuda, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	objID, err := bson.ObjectIDFromHex(routeID)
	if err != nil {
		return nil, errors.New("ID de ruta inválido")
	}

	cursor, err := r.HelpPointCollection.Find(ctx, bson.M{"route_id": objID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var helpPoints []domain.PuntoAyuda
	if err := cursor.All(ctx, &helpPoints); err != nil {
		return nil, err
	}

	for i, hp := range helpPoints {
		if len(hp.People) == 0 && len(hp.PersonaIDs) > 0 {
			var personas []domain.Persona
			filter := bson.M{"_id": bson.M{"$in": hp.PersonaIDs}}
			pCursor, err := r.PersonaCollection.Find(ctx, filter)
			if err != nil {
				continue
			}
			if err := pCursor.All(ctx, &personas); err != nil {
				pCursor.Close(ctx)
				continue
			}
			pCursor.Close(ctx)
			for _, persona := range personas {
				helpPoints[i].People = append(helpPoints[i].People, domain.PersonaAyudada{
					Name:   persona.Nombre,
					Age:    persona.Edad,
					Gender: persona.Genero,
					Rut:    persona.Rut,
				})
			}
		}
	}
	return helpPoints, nil
}

// GetMyParticipation obtiene la participación de un usuario en rutas.
// Recibe el ID del usuario, busca las rutas en las que participa y cuenta el total de rutas y puntos de ayuda.
func (r *routeRepository) GetMyParticipation(userID string) (map[string]int, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	userObjID, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return nil, errors.New("ID de usuario inválido")
	}

	filter := bson.M{
		"$or": []bson.M{
			{"team": userObjID},
			{"team": userID},
			{"route_leader": userObjID},
		},
	}
	cursor, err := r.RouteCollection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var routes []domain.Route
	if err := cursor.All(ctx, &routes); err != nil {
		return nil, err
	}

	totalRoutes := len(routes)
	routeIDs := make([]bson.ObjectID, 0, len(routes))
	for _, route := range routes {
		routeIDs = append(routeIDs, route.ID)
	}

	totalHelpingPoints := 0
	if len(routeIDs) > 0 {
		helpCount, err := r.HelpPointCollection.CountDocuments(ctx, bson.M{
			"route_id": bson.M{"$in": routeIDs},
		})
		if err != nil {
			return nil, err
		}
		totalHelpingPoints = int(helpCount)
	}

	myParticipation := map[string]int{
		"total_routes":        totalRoutes,
		"total_helpingpoints": totalHelpingPoints,
	}

	return myParticipation, nil
}
