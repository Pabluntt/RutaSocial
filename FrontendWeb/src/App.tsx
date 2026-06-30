import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/home'
import Login from './pages/login'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Profile from './pages/profile'
import Usuarios from './pages/admin/usuarios/Usuarios'
import UserDetail from './pages/admin/usuarios/UserDetail'
import AdminRoutes from './pages/admin/routes/AdminRoutes'
import { useNavigate } from 'react-router-dom'
import { useEffect, type ReactNode } from 'react'
import { interceptorResponse } from './api/services/axiosInstance'
import useSessionStore from './stores/useSessionStore'
import { ThemeProvider } from '@emotion/react'
import { createTheme } from '@mui/material/styles'
import Schedule from './pages/schedule'
import { ZoomProvider } from './context/ZoomContext'
import RouteHistory from './pages/history'
import PeopleHelped from './pages/people-helped'
import PersonaProfile from './pages/people-helped/PersonaProfile'
import { HelpPointUpdateProvider } from './context/HelpPointUpdateContext'
import { AuthProvider } from './context/AuthContext'
import { RiskUpdateProvider } from './context/RiskUpdateContext'
import NotFound from './component/NotFound'
import { EventCalendarUpdateProvider } from './context/EventCalendarUpdateContext'
import HelpButton from './component/HelpButton'
import TourOverlay from './component/TourOverlay'
import ErrorBoundary from './component/ErrorBoundary'
import HydrationGate from './component/HydrationGate'
import { SnackbarProvider } from './context/SnackbarContext'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const accessToken = useSessionStore((state) => state.accessToken)
  if (!accessToken) {
    return <Navigate to={`${import.meta.env.VITE_BASE_URL}/login`} replace />
  }
  return children
}

const getErrorStatus = (error: unknown) => {
  if (error && typeof error === 'object' && 'status' in error) {
    return Number((error as { status?: unknown }).status)
  }
  return undefined
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const status = getErrorStatus(error)
        if (status === 401 || status === 403 || status === 404) return false
        return failureCount < 1
      },
    },
  },
})

const customQuery = createTheme({
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  }
})


function App() {

  const { clearSession, setEnableGPS, setCountRetryGPS, accessToken } = useSessionStore()
  const navigate = useNavigate()

  useEffect(() => {

    return () => {
      setEnableGPS(false)
      setCountRetryGPS(0)
    }
  }, [])

  useEffect(()=> {
    interceptorResponse(navigate, () => {
      queryClient.clear()
      clearSession()
    })
  }, [navigate, clearSession])
 
  return (
  <QueryClientProvider client={queryClient}>    
    <HydrationGate>
      <RiskUpdateProvider>
        <AuthProvider>
          <ZoomProvider>
            <ThemeProvider theme={customQuery}>
              <SnackbarProvider>
                <ErrorBoundary>
                  <Routes>
                    <Route path={`${import.meta.env.VITE_BASE_URL}/`} element={
                      <ProtectedRoute>
                        <EventCalendarUpdateProvider>
                          <Schedule />
                        </EventCalendarUpdateProvider>
                      </ProtectedRoute>
                    } />
                    <Route path={`${import.meta.env.VITE_BASE_URL}/login`} element={<Login />} />
                    <Route path={`${import.meta.env.VITE_BASE_URL}/mapa`} element={<ProtectedRoute><Home/></ProtectedRoute>} />
                    <Route path={`${import.meta.env.VITE_BASE_URL}/perfil`} element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path={`${import.meta.env.VITE_BASE_URL}/calendario`} element={
                      <ProtectedRoute>
                        <EventCalendarUpdateProvider>
                          <Schedule />
                        </EventCalendarUpdateProvider>
                      </ProtectedRoute>
                      } 
                    />
                    <Route path={`${import.meta.env.VITE_BASE_URL}/admin/usuarios`} element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
                    <Route path={`${import.meta.env.VITE_BASE_URL}/admin/usuarios/:id`} element={<ProtectedRoute><UserDetail /></ProtectedRoute>} />
                    <Route path={`${import.meta.env.VITE_BASE_URL}/admin/rutas`} element={<ProtectedRoute><AdminRoutes /></ProtectedRoute>} />
                    <Route path={`${import.meta.env.VITE_BASE_URL}/historial`} element={
                      <ProtectedRoute>
                        <HelpPointUpdateProvider>
                          <RouteHistory />
                        </HelpPointUpdateProvider>
                      </ProtectedRoute>
                      } 
                    />
                    <Route path={`${import.meta.env.VITE_BASE_URL}/personas-ayudadas`} element={<ProtectedRoute><PeopleHelped /></ProtectedRoute>} />
                    <Route path={`${import.meta.env.VITE_BASE_URL}/personas-ayudadas/:id`} element={<ProtectedRoute><PersonaProfile /></ProtectedRoute>} />
                    <Route path='*' element={ <NotFound />} />
                </Routes>
                </ErrorBoundary>
                {accessToken ? <HelpButton /> : null}
                {accessToken ? <TourOverlay /> : null}
              </SnackbarProvider>
            </ThemeProvider>
          </ZoomProvider>
        </AuthProvider>
      </RiskUpdateProvider>
    </HydrationGate>
  </QueryClientProvider>
  )
}

export default App
