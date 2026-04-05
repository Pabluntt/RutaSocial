
export interface Position {
    latitude : number
    longitude : number
}

export default function getCurrentLocation(): Promise<Position> {
    return new Promise((resolve, reject) => {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position : GeolocationPosition) => {
                    resolve({
                        latitude : position.coords.latitude,
                        longitude : position.coords.longitude
                    })
                }, 
                (error) => {
                    reject(error)
                }
            )
        } else {
            reject(new Error('Geolocation no es soportada en el navegador'))
        }
    })
} 