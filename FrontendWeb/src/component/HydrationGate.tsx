import { useEffect, useState, type ReactNode } from 'react'
import useSessionStore from '../stores/useSessionStore'
import { CircularProgress, Box } from '@mui/material'

export default function HydrationGate({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(() => useSessionStore.persist.hasHydrated())

  useEffect(() => {
    const unsub = useSessionStore.persist.onFinishHydration(() => { setHydrated(true); })
    return unsub
  }, [])

  if (!hydrated) {
    return (
      <Box className="flex items-center justify-center h-screen">
        <CircularProgress />
      </Box>
    )
  }

  return <>{children}</>
}
