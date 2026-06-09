import { useQuery } from "@tanstack/react-query"
import { WeatherService } from "../services/WeatherService"

export function useWeather(latitude: number | null, longitude: number | null) {
    return useQuery({
        queryKey: ['weather', latitude, longitude],
        queryFn: () => WeatherService.GetWeather(latitude!, longitude!),
        enabled: latitude !== null && longitude !== null,
        refetchInterval: 5 * 60 * 1000,
        staleTime: 5 * 60 * 1000,
    })
}
