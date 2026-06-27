package usecase

import (
	"context"

	"github.com/SebaVCH/hdcProject/internal/domain"
	"github.com/stretchr/testify/mock"
)

type MockAuthRepository struct {
	mock.Mock
}

func (m *MockAuthRepository) Login(ctx context.Context, email, password string) (string, error) {
	args := m.Called(ctx, email, password)
	return args.String(0), args.Error(1)
}

func (m *MockAuthRepository) Register(ctx context.Context, user domain.Usuario) (string, error) {
	args := m.Called(ctx, user)
	return args.String(0), args.Error(1)
}
