import { Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/home'
import Login from './pages/login'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Profile from './pages/profile'
import Usuarios from './pages/admin/usuarios/Usuarios'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { interceptorResponse } from './api/services/axiosInstance'
import useSessionStore from './stores/useSessionStore'
import { ThemeProvider } from '@emotion/react'
import { createTheme } from '@mui/material/styles'
import Schedule from './pages/schedule'
import { ZoomProvider } from './context/ZoomContext'
import RouteHistory from './pages/history'
import { HelpPointUpdateProvider } from './context/HelpPointUpdateContext'
import { AuthProvider } from './context/AuthContext'
import { RiskUpdateProvider } from './context/RiskUpdateContext'
import NotFound from './component/NotFound'
import { EventCalendarUpdateProvider } from './context/EventCalendarUpdateContext'

const queryClient = new QueryClient()

const customQuery = createTheme({
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  }
})


function App() {

  const { clearSession, setEnableGPS, setCountRetryGPS } = useSessionStore()
  const navigate = useNavigate()

  useEffect(() => {

    return () => {
      setEnableGPS(false)
      setCountRetryGPS(0)
    }
  }, [])

  useEffect(()=> {
    interceptorResponse(navigate, clearSession)
  }, [navigate])
 
  return (
  <QueryClientProvider client={queryClient}>    
      <RiskUpdateProvider>
        <AuthProvider>
          <ZoomProvider>
            <ThemeProvider theme={customQuery}>
                <Routes>
                    <Route path="/" element={<Home/>} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/perfil" element={<Profile />} />
                    <Route path="/calendario" element={
                      <EventCalendarUpdateProvider>
                        <Schedule />
                      </EventCalendarUpdateProvider>
                      } 
                    />
                    <Route path="/admin/usuarios" element={<Usuarios />} />
                    <Route path="/historial" element={
                      <HelpPointUpdateProvider>
                        <RouteHistory />
                      </HelpPointUpdateProvider>
                      } 
                    />
                    <Route path='*' element={ <NotFound />} />
                </Routes>
            </ThemeProvider>
          </ZoomProvider>
        </AuthProvider>
      </RiskUpdateProvider>
  </QueryClientProvider>
  )
}

export default App
