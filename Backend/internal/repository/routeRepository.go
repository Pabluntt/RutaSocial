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
	GetMyParticipation(userID string) (map[string]int, error)
}

// routeRepository implementa la interfaz RouteRepository.
// Contiene colecciones de rutas y puntos de ayuda para interactuar con la base de datos.
type routeRepository struct {
	RouteCollection     *mongo.Collection
	HelpPointCollection *mongo.Collection
}

// NewRouteRepository crea una nueva instancia de routeRepository.
// Recibe colecciones de rutas y puntos de ayuda y retorna una instancia de RouteRepository.
func NewRouteRepository(routeCollection *mongo.Collection, helpPointCollection *mongo.Collection) RouteRepository {
	return &routeRepository{
		RouteCollection:     routeCollection,
		HelpPointCollection: helpPointCollection,
	}
}

// FindAll obtiene todas las rutas de la base de datos.
// Retorna un slice de rutas o un error si ocurre algún problema.
func (r *routeRepository) FindAll() ([]domain.Route, error) {
	cursor, err := r.RouteCollection.Find(context.Background(), bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var routes []domain.Route
	if err := cursor.All(context.Background(), &routes); err != nil {
		return nil, err
	}
	return routes, nil
}

// FindByID obtiene una ruta por su ID.
// Recibe el ID como string, lo convierte a ObjectID y busca en la colección.
func (r *routeRepository) FindByID(routeId string) (domain.Route, error) {
	objID, err := bson.ObjectIDFromHex(routeId)
	if err != nil {
		return domain.Route{}, errors.New("ID de ruta inválido")
	}

	var route domain.Route
	err = r.RouteCollection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&route)
	if err != nil {
		return domain.Route{}, err
	}
	return route, nil
}

// CreateRoute crea una nueva ruta en la base de datos.
// Asigna un nuevo ID, establece la fecha de creación, el estado y el código de invitación.
func (r *routeRepository) CreateRoute(route *domain.Route) error {
	route.ID = bson.NewObjectID()
	route.DateCreated = time.Now()
	route.Status = "on progress"
	route.InviteCode = utils.NewInviteCode()
	if route.Team == nil {
		route.Team = []bson.ObjectID{}
	}
	_, err := r.RouteCollection.InsertOne(context.Background(), route)
	if err != nil {
		return err
	}
	return nil
}

// UpdateRoute actualiza una ruta existente en la base de datos.
// Recibe un mapa de datos a actualizar y el ID de la ruta.
func (r *routeRepository) UpdateRoute(data map[string]interface{}) (domain.Route, error) {
	idStr, ok := data["_id"].(string)
	if !ok {
		return domain.Route{}, errors.New("ID de ruta no proporcionado o inválido")
	}
	objID, err := bson.ObjectIDFromHex(idStr)
	if err != nil {
		return domain.Route{}, errors.New("ID de ruta inválido")
	}
	delete(data, "_id")

	update := bson.M{"$set": data}
	_, err = r.RouteCollection.UpdateOne(context.Background(), bson.M{"_id": objID}, update)
	if err != nil {
		return domain.Route{}, err
	}

	var updatedRoute domain.Route
	err = r.RouteCollection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&updatedRoute)
	if err != nil {
		return domain.Route{}, err
	}
	return updatedRoute, nil
}

// DeleteRoute elimina una ruta de la base de datos por su ID.
// Convierte el ID de cadena a ObjectID y elimina el documento correspondiente.
func (r *routeRepository) DeleteRoute(routeId string) error {
	objID, err := bson.ObjectIDFromHex(routeId)
	if err != nil {
		return errors.New("ID de ruta inválido")
	}

	_, err = r.RouteCollection.DeleteOne(context.Background(), bson.M{"_id": objID})
	return err
}

// FinishRoute marca una ruta como finalizada.
// Recibe el ID de la ruta, lo convierte a ObjectID y actualiza su estado y fecha de finalización.
func (r *routeRepository) FinishRoute(id string) error {
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("ID de ruta inválido")
	}

	update := bson.M{"$set": bson.M{"status": "Finalizada", "date_finished": time.Now()}}
	_, err = r.RouteCollection.UpdateOne(context.Background(), bson.M{"_id": objID}, update)
	if err != nil {
		return err
	}

	return nil
}

// JoinRoute permite a un usuario unirse a una ruta utilizando un código de invitación.
// Verifica si la ruta existe, si no está finalizada y si el usuario ya es parte del equipo.
// Si todas las condiciones se cumplen, agrega al usuario al equipo de la ruta y retorna la ruta actualizada.
func (r *routeRepository) JoinRoute(code string, userID string) (domain.Route, error) {
	var route domain.Route
	err := r.RouteCollection.FindOne(context.Background(), bson.M{"invite_code": code}).Decode(&route)
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
	_, err = r.RouteCollection.UpdateOne(context.Background(), bson.M{"_id": route.ID}, update)
	if err != nil {
		return domain.Route{}, err
	}

	err = r.RouteCollection.FindOne(context.Background(), bson.M{"_id": route.ID}).Decode(&route)
	if err != nil {
		return domain.Route{}, err
	}

	return route, nil
}

// GetMyParticipation obtiene la participación de un usuario en rutas.
// Recibe el ID del usuario, busca las rutas en las que participa y cuenta el total de rutas y puntos de ayuda.
func (r *routeRepository) GetMyParticipation(userID string) (map[string]int, error) {
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
	cursor, err := r.RouteCollection.Find(context.Background(), filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var routes []domain.Route
	if err := cursor.All(context.Background(), &routes); err != nil {
		return nil, err
	}

	totalRoutes := len(routes)
	routeIDs := make([]bson.ObjectID, 0, len(routes))
	for _, route := range routes {
		routeIDs = append(routeIDs, route.ID)
	}

	totalHelpingPoints := 0
	if len(routeIDs) > 0 {
		helpCount, err := r.HelpPointCollection.CountDocuments(context.Background(), bson.M{
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
