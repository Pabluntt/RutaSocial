package usecase

import (
	"context"

	"github.com/SebaVCH/hdcProject/internal/domain"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type MockRouteRepository struct {
	mock.Mock
}

func (m *MockRouteRepository) FindAll(ctx context.Context) ([]domain.Route, error) {
	args := m.Called(ctx)
	return args.Get(0).([]domain.Route), args.Error(1)
}

func (m *MockRouteRepository) FindByID(ctx context.Context, routeId string) (domain.Route, error) {
	args := m.Called(ctx, routeId)
	return args.Get(0).(domain.Route), args.Error(1)
}

func (m *MockRouteRepository) CreateRoute(ctx context.Context, route *domain.Route) error {
	args := m.Called(ctx, route)
	return args.Error(0)
}

func (m *MockRouteRepository) UpdateRoute(ctx context.Context, data map[string]interface{}) (domain.Route, error) {
	args := m.Called(ctx, data)
	return args.Get(0).(domain.Route), args.Error(1)
}

func (m *MockRouteRepository) DeleteRoute(ctx context.Context, routeId string) error {
	args := m.Called(ctx, routeId)
	return args.Error(0)
}

func (m *MockRouteRepository) FinishRoute(ctx context.Context, id string, leaderID string, allowAny bool) error {
	args := m.Called(ctx, id, leaderID, allowAny)
	return args.Error(0)
}

func (m *MockRouteRepository) JoinRoute(ctx context.Context, code string, userID string) (domain.Route, error) {
	args := m.Called(ctx, code, userID)
	return args.Get(0).(domain.Route), args.Error(1)
}

func (m *MockRouteRepository) LeaveRoute(ctx context.Context, routeId string, userID string) error {
	args := m.Called(ctx, routeId, userID)
	return args.Error(0)
}

func (m *MockRouteRepository) GetMyParticipation(ctx context.Context, userID string) (map[string]int, error) {
	args := m.Called(ctx, userID)
	return args.Get(0).(map[string]int), args.Error(1)
}

func (m *MockRouteRepository) GetHelpPointsByRouteID(ctx context.Context, routeID string) ([]domain.PuntoAyuda, error) {
	args := m.Called(ctx, routeID)
	return args.Get(0).([]domain.PuntoAyuda), args.Error(1)
}

func (m *MockRouteRepository) GetRoutesByUserID(ctx context.Context, userID string) ([]domain.Route, error) {
	args := m.Called(ctx, userID)
	return args.Get(0).([]domain.Route), args.Error(1)
}

func routeWithLeader(leaderHex string) domain.Route {
	oid, _ := bson.ObjectIDFromHex(leaderHex)
	return domain.Route{
		ID:          bson.NewObjectID(),
		Title:       "Test Route",
		RouteLeader: oid,
		Status:      "on progress",
	}
}
