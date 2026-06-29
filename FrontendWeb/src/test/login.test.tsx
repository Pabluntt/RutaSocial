import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Login from '../pages/login'

const mutate = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

vi.mock('../stores/useSessionStore', () => ({
  default: () => ({ accessToken: '' }),
}))

vi.mock('../api/hooks/UserHooks', () => ({
  useLogin: () => ({ mutate, error: null, isPending: false }),
}))

describe('Login page', () => {
  it('validates required fields before login', () => {
    render(<Login />)

    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(screen.getByText('Ingresa un Email válido')).toBeInTheDocument()
    expect(screen.getByText('Ingresa una Contraseña')).toBeInTheDocument()
    expect(mutate).not.toHaveBeenCalled()
  })

  it('submits valid credentials', () => {
    render(<Login />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'admin@example.com' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Admin12345' } })
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(mutate).toHaveBeenCalledWith(
      { email: 'admin@example.com', password: 'Admin12345' },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    )
  })
})
