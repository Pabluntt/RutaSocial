package domain

type WeatherRequest struct {
	Latitude  float64 `form:"latitude" binding:"required"`
	Longitude float64 `form:"longitude" binding:"required"`
}

type WeatherForecastEvent struct {
	HoursFromNow int    `json:"hours_from_now"`
	WeatherCode  int    `json:"weather_code"`
	Condition    string `json:"condition"`
	Description  string `json:"description"`
}

type WeatherResponse struct {
	Condition          string                 `json:"condition"`
	Description        string                 `json:"description"`
	WeatherCode        int                    `json:"weather_code"`
	Temperature        float64                `json:"temperature"`
	IsCurrentlyRaining bool                   `json:"is_currently_raining"`
	WillRain           bool                   `json:"will_rain"`
	WillRain1Day       bool                   `json:"will_rain_1day"`
	WillRain2Days      bool                   `json:"will_rain_2days"`
	Forecast           []WeatherForecastEvent `json:"forecast"`
}
