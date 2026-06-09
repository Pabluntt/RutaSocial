import { MapWeatherFromBackend, TWeatherBackend } from "../adapters/Weather.adapter"
import { Weather } from "../models/Weather"
import { axiosInstance } from "./axiosInstance"

export class WeatherService {

    static async GetWeather(latitude: number, longitude: number): Promise<Weather> {
        const { data } = await axiosInstance.get(`/weather`, {
            params: { latitude, longitude }
        })
        return MapWeatherFromBackend(data as TWeatherBackend)
    }
}
