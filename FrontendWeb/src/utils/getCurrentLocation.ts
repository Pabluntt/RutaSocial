
export interface Position {
    latitude : number
    longitude : number
}

export default function getCurrentLocation(timeout = 15000): Promise<Position> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation no es soportada en el navegador'))
            return
        }

        const onSuccess = (position: GeolocationPosition) => {
            resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            })
        }

        const onError = () => {
            navigator.geolocation.getCurrentPosition(
                onSuccess,
                (error) => { reject(error); },
                { enableHighAccuracy: false, timeout, maximumAge: 60000 },
            )
        }

        navigator.geolocation.getCurrentPosition(onSuccess, onError, {
            enableHighAccuracy: true,
            timeout,
            maximumAge: 5000,
        })
    })
} 