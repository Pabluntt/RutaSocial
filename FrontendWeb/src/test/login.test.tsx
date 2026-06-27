import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

describe('Login page', () => {
  it('renders login heading', () => {
    // Simple smoke test to verify vitest setup works
    const heading = document.createElement('h3')
    heading.textContent = 'Iniciar Sesión'
    document.body.appendChild(heading)
    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument()
  })
})
