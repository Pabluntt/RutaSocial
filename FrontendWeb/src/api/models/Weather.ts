export interface WeatherForecastEvent {
    hoursFromNow: number
    weatherCode: number
    condition: string
    description: string
}

export interface Weather {
    condition: string
    description: string
    weatherCode: number
    temperature: number
    isCurrentlyRaining: boolean
    willRain: boolean
    willRain1Day: boolean
    willRain2Days: boolean
    forecast: WeatherForecastEvent[]
}
