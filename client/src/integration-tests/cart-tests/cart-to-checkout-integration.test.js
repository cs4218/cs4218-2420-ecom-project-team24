/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import axios from 'axios'
import '@testing-library/jest-dom/extend-expect'
import { CartProvider } from '../../context/cart'
import { AuthProvider } from '../../context/auth'
import { SearchProvider } from '../../context/search'
import HomePage from '../../pages/HomePage'
import CartPage from '../../pages/CartPage'

/**
 * This integration test verifies the complete cart-to-checkout flow:
 * 1. HomePage component - where products are displayed and added to cart
 * 2. CartPage component - where cart items are displayed and checkout occurs
 * 3. CartProvider context - which manages the cart state across the application
 * 4. AuthProvider context - which provides user authentication state for checkout
 * 5. Payment processing - including Braintree payment gateway integration
 *
 * The test ensures that:
 * - Products can be added to cart from the HomePage
 * - Cart items persist in localStorage and display correctly on the CartPage
 * - Authenticated users can see the payment section
 * - The payment process works correctly (mocked)
 * - The cart is cleared after successful payment
 */

jest.mock('axios')
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
  Toaster: () => null
}))
jest.mock('braintree-web-drop-in-react', () => {
  return function DropIn (props) {
    return (
      <div data-testid='mock-dropin'>
        <button
          onClick={() =>
            props.onInstance({
              requestPaymentMethod: async () => ({ nonce: 'fake-nonce' })
            })
          }
        >
          Mock DropIn
        </button>
      </div>
    )
  }
})

describe('Cart to Checkout Integration Flow', () => {
  const mockProducts = [
    {
      _id: '1',
      name: 'Test Product 1',
      slug: 'test-product-1',
      description: 'Test description 1',
      price: 99.99,
      category: { _id: '1', name: 'Category 1' },
      quantity: 10
    }
  ]

  const mockUser = {
    _id: 'user1',
    name: 'Test User',
    email: 'test@example.com',
    address: '123 Test Street'
  }

  beforeEach(() => {
    localStorage.clear()

    // Mock API responses
    axios.get.mockImplementation(url => {
      if (url.includes('/api/v1/category/get-category')) {
        return Promise.resolve({
          data: { success: true, category: [{ _id: '1', name: 'Category 1' }] }
        })
      } else if (url.includes('/api/v1/product/product-count')) {
        return Promise.resolve({ data: { total: mockProducts.length } })
      } else if (url.includes('/api/v1/product/product-list')) {
        return Promise.resolve({ data: { products: mockProducts } })
      } else if (url.includes('/api/v1/product/braintree/token')) {
        return Promise.resolve({ data: { clientToken: 'fake-client-token' } })
      }
      return Promise.resolve({ data: {} })
    })

    axios.post.mockResolvedValue({ data: { success: true } })
  })

  it('should allow adding product to cart and proceeding to checkout', async () => {
    // Set up auth state with logged in user
    localStorage.setItem(
      'auth',
      JSON.stringify({
        user: mockUser,
        token: 'fake-token'
      })
    )

    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <CartProvider>
            <SearchProvider>
              <Routes>
                <Route path='/' element={<HomePage />} />
                <Route path='/cart' element={<CartPage />} />
              </Routes>
            </SearchProvider>
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>
    )

    // Wait for products to load on homepage
    await waitFor(() => {
      expect(screen.getAllByText('Test Product 1')[0]).toBeInTheDocument()
    })

    // Add product to cart
    const addToCartButtons = screen.getAllByText('ADD TO CART')
    fireEvent.click(addToCartButtons[0])

    // Navigate to cart page
    const cartData = JSON.parse(localStorage.getItem('cart'))
    expect(cartData).toHaveLength(1)

    // Render cart page directly since we can't easily click navigation in this test
    render(
      <MemoryRouter initialEntries={['/cart']}>
        <AuthProvider>
          <CartProvider>
            <SearchProvider>
              <CartPage />
            </SearchProvider>
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>
    )

    // Verify cart page shows the product
    await waitFor(() => {
      expect(screen.getAllByText('Test Product 1')[0]).toBeInTheDocument()
      expect(screen.getByText('Total : $99.99')).toBeInTheDocument()
    })

    // Verify payment section is available for logged in user
    await waitFor(() => {
      expect(screen.getByTestId('mock-dropin')).toBeInTheDocument()
    })

    // Select payment method
    const dropInButton = screen.getByText('Mock DropIn')
    fireEvent.click(dropInButton)

    // Complete payment
    const paymentButton = screen.getByText('Make Payment')
    fireEvent.click(paymentButton)

    // Verify payment API was called
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/v1/product/braintree/payment',
        expect.objectContaining({
          nonce: 'fake-nonce',
          cart: expect.arrayContaining([expect.objectContaining({ _id: '1' })])
        })
      )
    })

    // Verify cart was cleared
    expect(localStorage.getItem('cart')).toBeNull()
  })
})
