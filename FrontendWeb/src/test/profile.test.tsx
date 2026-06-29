import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../component/Dialog/DialogChangePassword', () => ({ default: () => null }))
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ role: 'admin', loading: false }) }))
vi.mock('../api/hooks/UserHooks', () => ({ useUserParticipation: () => ({ data: { total_helpingpoints: 3 } }) }))
vi.mock('../api/hooks/RouteHooks', () => ({ useRoutesByUser: () => ({ data: [] }) }))

describe('Profile table component', () => {
  it('renders loaded user profile fields', async () => {
    const { default: TableProfile } = await import('../pages/profile/TableProfile')
    const user = {
      id: 'user-id',
      name: 'Admin',
      email: 'admin@example.com',
      phone: '+56900000000',
      password: '',
      completedRoutes: 0,
      listRoutes: [],
      role: 'admin',
      institutionID: 'institution-id',
      dateRegister: new Date(),
      isActive: true,
    }
    render(
      <TableProfile
        stateResumenActividad={[{}, vi.fn()]}
        stateHasChanges={[false, vi.fn()]}
        stateUser={[user, vi.fn()]}
      />,
    )

    expect(screen.getByText('Acerca de ti')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Admin')).toBeInTheDocument()
    expect(screen.getByDisplayValue('admin@example.com')).toBeInTheDocument()
  }, 10000)
})
