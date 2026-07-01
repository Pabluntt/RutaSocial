package usecase

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/Pabluntt/RutaSocial/Backend/internal/domain"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func TestCreateNotification_VolunteerSendToAll_ReturnsForbidden(t *testing.T) {
	userID := "507f1f77bcf86cd799439011"
	mockRepo := new(MockNotificationRepository)
	uc := NewNotificationUseCase(mockRepo)

	w := performRequest("POST", "/notification", `{"description":"Aviso global","author_id":"507f1f77bcf86cd799439022","send_to_all":true}`, func(c *gin.Context) {
		setJWTUser(c, userID, "voluntario")
		uc.CreateNotification(c)
	})

	assert.Equal(t, http.StatusForbidden, w.Code)
	mockRepo.AssertNotCalled(t, "CreateNotification")
}

func TestCreateNotification_AdminSendToAll_CreatesNotification(t *testing.T) {
	userID := "507f1f77bcf86cd799439011"
	userObjID, _ := bson.ObjectIDFromHex(userID)
	mockRepo := new(MockNotificationRepository)
	mockRepo.On("CreateNotification", mock.Anything, mock.MatchedBy(func(notification domain.Aviso) bool {
		return notification.AuthorID == userObjID && notification.SendToAll && notification.Description == "Aviso global"
	})).Return(nil)
	uc := NewNotificationUseCase(mockRepo)

	w := performRequest("POST", "/notification", `{"description":"Aviso global","author_id":"507f1f77bcf86cd799439022","send_to_all":true}`, func(c *gin.Context) {
		setJWTUser(c, userID, "admin")
		uc.CreateNotification(c)
	})

	assert.Equal(t, http.StatusOK, w.Code)
	mockRepo.AssertExpectations(t)
}

func TestCreateNotification_UsesAuthorIDFromToken(t *testing.T) {
	userID := "507f1f77bcf86cd799439011"
	bodyAuthorID := "507f1f77bcf86cd799439022"
	userObjID, _ := bson.ObjectIDFromHex(userID)
	mockRepo := new(MockNotificationRepository)
	mockRepo.On("CreateNotification", mock.Anything, mock.MatchedBy(func(notification domain.Aviso) bool {
		return notification.AuthorID == userObjID && notification.AuthorID.Hex() != bodyAuthorID && !notification.SendToAll
	})).Return(nil)
	uc := NewNotificationUseCase(mockRepo)

	w := performRequest("POST", "/notification", `{"description":"Aviso institucional","author_id":"`+bodyAuthorID+`","send_to_all":false}`, func(c *gin.Context) {
		setJWTUser(c, userID, "voluntario")
		uc.CreateNotification(c)
	})

	assert.Equal(t, http.StatusOK, w.Code)
	mockRepo.AssertExpectations(t)

	var resp map[string]domain.Aviso
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	assert.NoError(t, err)
	assert.Equal(t, userObjID, resp["message"].AuthorID)
}

func TestUpdateNotification_CannotSetSendToAll(t *testing.T) {
	userID := "507f1f77bcf86cd799439011"
	notificationID := "507f1f77bcf86cd799439033"
	mockRepo := new(MockNotificationRepository)
	uc := NewNotificationUseCase(mockRepo)

	w := performRequestWithParams("PUT", "/notification/"+notificationID, `{"description":"Aviso editado","send_to_all":true}`, []gin.Param{{Key: "id", Value: notificationID}}, func(c *gin.Context) {
		setJWTUser(c, userID, "admin")
		uc.UpdateNotification(c)
	})

	assert.Equal(t, http.StatusBadRequest, w.Code)
	mockRepo.AssertNotCalled(t, "UpdateNotification")
}

func TestUpdateNotification_CannotSetSendEmail(t *testing.T) {
	userID := "507f1f77bcf86cd799439011"
	notificationID := "507f1f77bcf86cd799439033"
	mockRepo := new(MockNotificationRepository)
	uc := NewNotificationUseCase(mockRepo)

	w := performRequestWithParams("PUT", "/notification/"+notificationID, `{"description":"Aviso editado","send_email":true}`, []gin.Param{{Key: "id", Value: notificationID}}, func(c *gin.Context) {
		setJWTUser(c, userID, "admin")
		uc.UpdateNotification(c)
	})

	assert.Equal(t, http.StatusBadRequest, w.Code)
	mockRepo.AssertNotCalled(t, "UpdateNotification")
}

func TestUpdateNotification_DescriptionOnly_UpdatesNotification(t *testing.T) {
	userID := "507f1f77bcf86cd799439011"
	notificationID := "507f1f77bcf86cd799439033"
	mockRepo := new(MockNotificationRepository)
	mockRepo.On("UpdateNotification", mock.Anything, mock.MatchedBy(func(data map[string]interface{}) bool {
		return data["_id"] == notificationID && data["description"] == "Aviso editado"
	})).Return(domain.Aviso{Description: "Aviso editado"}, nil)
	uc := NewNotificationUseCase(mockRepo)

	w := performRequestWithParams("PUT", "/notification/"+notificationID, `{"description":"Aviso editado"}`, []gin.Param{{Key: "id", Value: notificationID}}, func(c *gin.Context) {
		setJWTUser(c, userID, "admin")
		uc.UpdateNotification(c)
	})

	assert.Equal(t, http.StatusOK, w.Code)
	mockRepo.AssertExpectations(t)
}
