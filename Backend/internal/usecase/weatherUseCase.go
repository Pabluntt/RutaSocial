package usecase

import (
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/http"
	"time"

	"github.com/SebaVCH/hdcProject/internal/domain"
	"github.com/gin-gonic/gin"
)

type WeatherUseCase interface {
	GetWeather(c *gin.Context)
}

type weatherUseCase struct{}

var weatherClient = &http.Client{Timeout: 10 * time.Second}

func NewWeatherUseCase() WeatherUseCase {
	return &weatherUseCase{}
}

type openMeteoHourly struct {
	Time        []string `json:"time"`
	WeatherCode []int    `json:"weather_code"`
}

type openMeteoCurrent struct {
	WeatherCode   int     `json:"weather_code"`
	Temperature2M float64 `json:"temperature_2m"`
}

type openMeteoResponse struct {
	Latitude  float64            `json:"latitude"`
	Longitude float64            `json:"longitude"`
	Current   openMeteoCurrent   `json:"current"`
	Hourly    openMeteoHourly    `json:"hourly"`
}

func isRainCode(code int) bool {
	return (code >= 51 && code <= 57) ||
		(code >= 61 && code <= 67) ||
		(code >= 80 && code <= 82) ||
		(code >= 95 && code <= 99)
}

func isSnowCode(code int) bool {
	return (code >= 71 && code <= 77) ||
		(code >= 85 && code <= 86)
}

func getWeatherCondition(code int) string {
	if code == 0 {
		return "clear"
	}
	if code >= 1 && code <= 3 {
		return "cloudy"
	}
	if code == 45 || code == 48 {
		return "fog"
	}
	if code >= 51 && code <= 57 {
		return "drizzle"
	}
	if code >= 61 && code <= 67 {
		return "rain"
	}
	if code >= 71 && code <= 77 {
		return "snow"
	}
	if code >= 80 && code <= 82 {
		return "rain_showers"
	}
	if code >= 85 && code <= 86 {
		return "snow_showers"
	}
	if code >= 95 && code <= 99 {
		return "thunderstorm"
	}
	return "unknown"
}

func isNotable(condition string) bool {
	return condition != "clear" && condition != "cloudy" && condition != "unknown"
}

func getSeverity(condition string) int {
	switch condition {
	case "thunderstorm":
		return 5
	case "snow", "snow_showers", "freezing_rain":
		return 4
	case "rain", "rain_showers":
		return 3
	case "drizzle":
		return 2
	case "fog":
		return 1
	default:
		return 0
	}
}

func getDescription(code int) (string, string) {
	if code == 0 {
		return "clear", "Cielo despejado"
	}
	if code >= 1 && code <= 3 {
		return "cloudy", "Nublado"
	}
	if code == 45 || code == 48 {
		return "fog", "Niebla"
	}
	if code >= 51 && code <= 57 {
		return "drizzle", "Llovizna"
	}
	if code >= 61 && code <= 65 {
		return "rain", "Está lloviendo"
	}
	if code == 66 || code == 67 {
		return "freezing_rain", "Lluvia helada"
	}
	if code >= 71 && code <= 77 {
		return "snow", "Está nevando"
	}
	if code >= 80 && code <= 82 {
		return "rain_showers", "Chubascos"
	}
	if code >= 85 && code <= 86 {
		return "snow_showers", "Chubascos de nieve"
	}
	if code >= 95 && code <= 99 {
		return "thunderstorm", "Tormenta eléctrica"
	}
	return "unknown", "Condición desconocida"
}

func buildForecast(now time.Time, times []string, codes []int) []domain.WeatherForecastEvent {
	var events []domain.WeatherForecastEvent

	baseline := ""
	alreadyNoted := false
	var lastReportedCondition string

	for i, t := range times {
		parsedTime, err := time.Parse("2006-01-02T15:04", t)
		if err != nil || i >= len(codes) {
			continue
		}
		hoursFromNow := parsedTime.Sub(now).Hours()
		condition := getWeatherCondition(codes[i])

		if hoursFromNow < 0 {
			baseline = condition
			continue
		}

		if !alreadyNoted {
			alreadyNoted = true
			if isNotable(condition) && condition != baseline {
				_, desc := getDescription(codes[i])
				events = append(events, domain.WeatherForecastEvent{
					HoursFromNow: int(math.Round(hoursFromNow)),
					WeatherCode:  codes[i],
					Condition:    condition,
					Description:  desc,
				})
				lastReportedCondition = condition
			}
		} else if isNotable(condition) && condition != lastReportedCondition {
			_, desc := getDescription(codes[i])
			events = append(events, domain.WeatherForecastEvent{
				HoursFromNow: int(math.Round(hoursFromNow)),
				WeatherCode:  codes[i],
				Condition:    condition,
				Description:  desc,
			})
			lastReportedCondition = condition
		}
	}

	return events
}

func (u *weatherUseCase) GetWeather(c *gin.Context) {
	var req domain.WeatherRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "latitude y longitude son requeridos"})
		return
	}

	url := fmt.Sprintf(
		"https://api.open-meteo.com/v1/forecast?latitude=%f&longitude=%f&current=weather_code,temperature_2m&hourly=weather_code&forecast_days=2",
		req.Latitude, req.Longitude,
	)

	resp, err := weatherClient.Get(url)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al consultar el clima"})
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al leer respuesta del clima"})
		return
	}

	if resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error del servicio climático"})
		return
	}

	var openMeteo openMeteoResponse
	if err := json.Unmarshal(body, &openMeteo); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al procesar datos del clima"})
		return
	}

	currentCode := openMeteo.Current.WeatherCode
	temperature := openMeteo.Current.Temperature2M

	now := time.Now()
	willRain1Day := isRainCode(currentCode)
	willRain2Days := isRainCode(currentCode)

	for i, t := range openMeteo.Hourly.Time {
		parsedTime, err := time.Parse("2006-01-02T15:04", t)
		if err != nil || i >= len(openMeteo.Hourly.WeatherCode) {
			continue
		}
		if parsedTime.Before(now) || parsedTime.Equal(now) {
			continue
		}
		hoursDiff := parsedTime.Sub(now).Hours()
		if isRainCode(openMeteo.Hourly.WeatherCode[i]) {
			if hoursDiff <= 24 {
				willRain1Day = true
			}
			if hoursDiff <= 48 {
				willRain2Days = true
			}
		}
	}

	currentlyRaining := isRainCode(currentCode)
	willRain := currentlyRaining || willRain2Days

	condition, description := getDescription(currentCode)

	if !currentlyRaining && willRain {
		if willRain1Day {
			description = "Lloverá próximamente"
		} else {
			description = "Lloverá en los próximos días"
		}
	}

	forecast := buildForecast(now, openMeteo.Hourly.Time, openMeteo.Hourly.WeatherCode)

	response := domain.WeatherResponse{
		Condition:          condition,
		Description:        description,
		WeatherCode:        currentCode,
		Temperature:        temperature,
		IsCurrentlyRaining: currentlyRaining,
		WillRain:           willRain,
		WillRain1Day:       willRain1Day,
		WillRain2Days:      willRain2Days,
		Forecast:           forecast,
	}

	c.JSON(http.StatusOK, response)
}
