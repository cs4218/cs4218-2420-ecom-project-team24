/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import '@testing-library/jest-dom/extend-expect'
import { CartProvider } from '../../context/cart'
import { AuthProvider } from '../../context/auth'
import { SearchProvider } from '../../context/search'
import CartPage from '../../pages/CartPage'
import axios from 'axios'

jest.mock('axios')

describe('Cart Persistence Integration Test', () => {
  const mockCartItems = [
    {
      _id: '1',
      name: 'Persisted Product',
      description: 'This product should persist',
      price: 129.99
    }
  ]

  beforeEach(() => {
    // Mock API responses
    axios.get.mockResolvedValue({ data: { clientToken: 'fake-token' } })
  })

  it('should load cart items from localStorage on initial render', async () => {
    // Set up cart in localStorage to simulate previous session
    localStorage.setItem('cart', JSON.stringify(mockCartItems))

    render(
      <MemoryRouter>
        <AuthProvider>
          <CartProvider>
            <SearchProvider>
              <CartPage />
            </SearchProvider>
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>
    )

    // Verify the persisted product appears in cart
    await waitFor(() => {
      expect(screen.getByText('Persisted Product')).toBeInTheDocument()
      expect(
        screen.getByText('This product should persist')
      ).toBeInTheDocument()
      expect(screen.getByText('Price : 129.99')).toBeInTheDocument()
    })
  })
})
