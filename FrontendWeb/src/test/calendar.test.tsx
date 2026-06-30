import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Calendar from '../component/Calendar'
import { SnackbarProvider } from '../context/SnackbarContext'

vi.mock('@fullcalendar/react', () => ({ default: () => <div>Calendario renderizado</div> }))
vi.mock('@fullcalendar/daygrid', () => ({ default: {} }))
vi.mock('@fullcalendar/timegrid', () => ({ default: {} }))
vi.mock('@fullcalendar/interaction', () => ({ default: {} }))
vi.mock('../component/Dialog/DialogUpdateEventCalendar', () => ({ default: () => null }))
vi.mock('../component/Dialog/DialogCreateEventCalendar', () => ({ default: () => null }))

vi.mock('../stores/useSessionStore', () => ({
  default: () => ({ accessToken: 'token', setRouteStatus: vi.fn(), setRouteId: vi.fn() }),
}))
vi.mock('../api/hooks/UserHooks', () => ({ useProfile: () => ({ data: { id: 'user-id' } }) }))
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ role: 'admin' }) }))
vi.mock('../context/EventCalendarUpdateContext', () => ({ useEventCalendarUpdateDialog: () => [undefined, vi.fn()] }))
vi.mock('../api/hooks/CalendarEventHooks', () => ({
  useCalendarEvents: () => ({ isError: false, isPending: false, isSuccess: true, data: [], refetch: vi.fn() }),
  useDeleteCalendarEvent: () => ({ mutate: vi.fn(), data: undefined }),
  useUpdateCalendarEvent: () => ({ isSuccess: false, isPending: false, isError: false, isIdle: true, mutate: vi.fn(), reset: vi.fn() }),
}))
vi.mock('../api/hooks/RouteHooks', () => ({
  useRoutes: () => ({ data: [], refetch: vi.fn() }),
}))
vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }))

describe('Calendar component', () => {
  it('renders calendar when events query succeeds', () => {
    render(
      <SnackbarProvider>
        <Calendar />
      </SnackbarProvider>,
    )

    expect(screen.getByText('Calendario renderizado')).toBeInTheDocument()
  })
})
