import { Alert, Snackbar } from '@mui/material'
import { createContext, ReactNode, useContext, useState } from 'react'

type Severity = 'success' | 'info' | 'warning' | 'error'

type SnackbarContextValue = {
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
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar open={state.open} autoHideDuration={5000} onClose={() => setState((current) => ({ ...current, open: false }))}>
        <Alert severity={state.severity} variant="filled" onClose={() => setState((current) => ({ ...current, open: false }))}>
          {state.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  )
}

export function useAppSnackbar() {
  const context = useContext(SnackbarContext)
  if (!context) throw new Error('useAppSnackbar debe usarse dentro de SnackbarProvider')
  return context
}
