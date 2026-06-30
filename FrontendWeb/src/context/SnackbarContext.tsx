import { Alert, Snackbar } from '@mui/material'
import { createContext, ReactNode, use, useState } from 'react'

type Severity = 'success' | 'info' | 'warning' | 'error'

interface SnackbarContextValue {
  showSnackbar: (message: string, severity?: Severity) => void
}

const SnackbarContext = createContext<SnackbarContextValue | undefined>(undefined)

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ open: boolean; message: string; severity: Severity }>({
    open: false,
    message: '',
    severity: 'info',
  })

  const showSnackbar = (message: string, severity: Severity = 'info') => {
    setState({ open: true, message, severity })
  }

  return (
    <SnackbarContext value={{ showSnackbar }}>
      {children}
      <Snackbar open={state.open} autoHideDuration={5000} onClose={() => { setState((current) => ({ ...current, open: false })); }}>
        <Alert severity={state.severity} variant="filled" onClose={() => { setState((current) => ({ ...current, open: false })); }}>
          {state.message}
        </Alert>
      </Snackbar>
    </SnackbarContext>
  )
}

export function useAppSnackbar() {
  const context = use(SnackbarContext)
  if (!context) throw new Error('useAppSnackbar debe usarse dentro de SnackbarProvider')
  return context
}
