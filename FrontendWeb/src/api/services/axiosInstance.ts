import axios, { AxiosError, isAxiosError } from 'axios'
import { NavigateFunction } from 'react-router-dom'
import useSessionStore from '../../stores/useSessionStore'



export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_URL_BACKEND,
    timeout: 3000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'applicacion/json'
    }
})

let isDone = false

axiosInstance.interceptors.request.use(config => {
  const token = useSessionStore.getState().accessToken;
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export const interceptorResponse = (navigate : NavigateFunction,  clearSesion : () => void) => {

    if(isDone) return

    axiosInstance.interceptors.response.use(
        (response) => {
            return response;
        }, (error) => {
            if(isAxiosError(error) && ((error as AxiosError).status == 401)) {
                clearSesion()
                navigate(`${import.meta.env.VITE_BASE_URL}/login`)
            }

            if (error.response && error.response.data) {
                return Promise.reject(error.response.data);
            }
            return Promise.reject(error.message);
    });
    isDone = true   
}





