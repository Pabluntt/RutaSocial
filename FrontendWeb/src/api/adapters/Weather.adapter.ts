import { Weather, WeatherForecastEvent } from "../models/Weather"

export type TWeatherForecastEventBackend = {
    hours_from_now: number
    weather_code: number
    condition: string
    description: string
}

export type TWeatherBackend = {
    condition: string
    description: string
    weather_code: number
    temperature: number
    is_currently_raining: boolean
    will_rain: boolean
    will_rain_1day: boolean
    will_rain_2days: boolean
    forecast: TWeatherForecastEventBackend[]
}

function MapForecastEventFromBackend(data: TWeatherForecastEventBackend): WeatherForecastEvent {
    return {
        hoursFromNow: data.hours_from_now,
        weatherCode: data.weather_code,
        condition: data.condition,
        description: data.description,
    }
}

export function MapWeatherFromBackend(data: TWeatherBackend): Weather {
    return {
        condition: data.condition,
        description: data.description,
        weatherCode: data.weather_code,
        temperature: data.temperature,
        isCurrentlyRaining: data.is_currently_raining,
        willRain: data.will_rain,
        willRain1Day: data.will_rain_1day,
        willRain2Days: data.will_rain_2days,
        forecast: data.forecast.map(MapForecastEventFromBackend),
    }
}
