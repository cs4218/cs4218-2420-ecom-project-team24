/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import '@testing-library/jest-dom/extend-expect'
import { SearchProvider } from '../../context/search'
import { CartProvider } from '../../context/cart'
import { AuthProvider } from '../../context/auth'
import HomePage from '../../pages/HomePage'

/**
 * This integration test verifies the interaction between:
 * 1. HomePage component - where products are displayed and "ADD TO CART" buttons are rendered
 * 2. CartProvider context - which manages the cart state across the application
 * 3. localStorage persistence - which stores cart items between sessions
 *
 * The test ensures that when a user adds products to the cart from the HomePage,
 * the cart state is properly updated in the CartProvider context and persisted in localStorage.
 */

// Use vi.mock for ES modules
import { jest } from '@jest/globals'

// Mock axios
jest.mock('axios')

// Mock react-hot-toast
jest.mock('react-hot-toast')

describe('Add to Cart Integration Test', () => {
  const mockProducts = [
    {
      _id: '1',
      name: 'Test Product 1',
      slug: 'test-product-1',
      description: 'Test description 1',
      price: 99.99,
      category: { _id: '1', name: 'Category 1' },
      quantity: 10
    },
    {
      _id: '2',
      name: 'Test Product 2',
      slug: 'test-product-2',
      description: 'Test description 2',
      price: 149.99,
      category: { _id: '2', name: 'Category 2' },
      quantity: 5
    }
  ]

  beforeEach(() => {
    localStorage.clear()

    // Mock API responses
    axios.get.mockImplementation(url => {
      if (url.includes('/api/v1/category/get-category')) {
        return Promise.resolve({
          data: {
            success: true,
            category: [
              { _id: '1', name: 'Category 1' },
              { _id: '2', name: 'Category 2' }
            ]
          }
        })
      } else if (url.includes('/api/v1/product/product-count')) {
        return Promise.resolve({ data: { total: mockProducts.length } })
      } else if (url.includes('/api/v1/product/product-list')) {
        return Promise.resolve({ data: { products: mockProducts } })
      }
      return Promise.resolve({ data: {} })
    })

    jest.clearAllMocks()
  })

  it('should add products to cart and persist in localStorage', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <CartProvider>
            <SearchProvider>
              <HomePage />
            </SearchProvider>
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>
    )

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      expect(screen.getByText('Test Product 2')).toBeInTheDocument()
    })

    // Add first product to cart
    const addToCartButtons = screen.getAllByText('ADD TO CART')
    fireEvent.click(addToCartButtons[0])

    // Verify cart state is updated in localStorage
    const cartData = JSON.parse(localStorage.getItem('cart'))
    expect(cartData).toHaveLength(1)
    expect(cartData[0]._id).toBe('1')
    expect(cartData[0].name).toBe('Test Product 1')
    expect(cartData[0].price).toBe(99.99)

    // Add second product to cart
    fireEvent.click(addToCartButtons[1])

    // Verify both products are in cart
    const updatedCartData = JSON.parse(localStorage.getItem('cart'))
    expect(updatedCartData).toHaveLength(2)
    expect(updatedCartData[1]._id).toBe('2')
    expect(updatedCartData[1].name).toBe('Test Product 2')
    expect(updatedCartData[1].price).toBe(149.99)
  })
})
