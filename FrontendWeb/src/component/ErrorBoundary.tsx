import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Alert, Button, Typography } from '@mui/material'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-4 max-w-md p-6">
            <Typography variant="h5" color="error">
              Algo salió mal
            </Typography>
            <Alert severity="error" sx={{ width: '100%' }}>
              Ocurrió un error inesperado en esta sección.
            </Alert>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              {this.state.error?.message || 'Error desconocido'}
            </Typography>
            <div className="flex gap-3 mt-2">
              <Button variant="outlined" onClick={this.handleReset}>
                Reintentar
              </Button>
              <Button variant="outlined" onClick={() => window.location.reload()}>
                Recargar página
              </Button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
