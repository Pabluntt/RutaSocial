package usecase

import (
	"context"

	"github.com/SebaVCH/hdcProject/internal/domain"
	"github.com/stretchr/testify/mock"
)

type MockNotificationRepository struct {
	mock.Mock
}

func (m *MockNotificationRepository) CreateNotification(ctx context.Context, notification domain.Aviso) error {
	args := m.Called(ctx, notification)
	return args.Error(0)
}

func (m *MockNotificationRepository) DeleteNotification(ctx context.Context, notificationID string) error {
	args := m.Called(ctx, notificationID)
	return args.Error(0)
}

func (m *MockNotificationRepository) UpdateNotification(ctx context.Context, data map[string]interface{}) (domain.Aviso, error) {
	args := m.Called(ctx, data)
	return args.Get(0).(domain.Aviso), args.Error(1)
}

func (m *MockNotificationRepository) GetNotifications(ctx context.Context) ([]domain.Aviso, error) {
	args := m.Called(ctx)
	return args.Get(0).([]domain.Aviso), args.Error(1)
}

func (m *MockNotificationRepository) FindByIDAndUserID(ctx context.Context, id string, userID string) error {
	args := m.Called(ctx, id, userID)
	return args.Error(0)
}

func (m *MockNotificationRepository) GetUnreadNotifications(ctx context.Context, userID string) ([]domain.Aviso, error) {
	args := m.Called(ctx, userID)
	return args.Get(0).([]domain.Aviso), args.Error(1)
}

func (m *MockNotificationRepository) GetReadNotifications(ctx context.Context, userID string) ([]domain.Aviso, error) {
	args := m.Called(ctx, userID)
	return args.Get(0).([]domain.Aviso), args.Error(1)
}

func (m *MockNotificationRepository) MarkNotificationAsRead(ctx context.Context, notificationID string, userID string) error {
	args := m.Called(ctx, notificationID, userID)
	return args.Error(0)
}

func (m *MockNotificationRepository) DismissNotification(ctx context.Context, notificationID string, userID string) error {
	args := m.Called(ctx, notificationID, userID)
	return args.Error(0)
}
