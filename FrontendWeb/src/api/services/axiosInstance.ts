import axios, { isAxiosError } from 'axios'
import { NavigateFunction } from 'react-router-dom'
import useSessionStore from '../../stores/useSessionStore'



export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_URL_BACKEND,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    }
})

let isDone = false

axiosInstance.interceptors.request.use(config => {
  const token = useSessionStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const interceptorResponse = (navigate : NavigateFunction,  clearSesion : () => void) => {

    if(isDone) return

    axiosInstance.interceptors.response.use(
        (response) => {
            return response;
        }, (error) => {
            const status = isAxiosError(error) ? error.response?.status : undefined

            if(status === 401) {
                clearSesion()
                navigate(`${import.meta.env.VITE_BASE_URL}/login`)
            }

            if (error.response?.data) {
                const responseData = error.response.data
                if (responseData && typeof responseData === 'object') {
                    return Promise.reject({ ...responseData, status });
                }
                return Promise.reject({ message: responseData, status });
            }
            return Promise.reject(error.message);
    });
    isDone = true   
}





