// @ts-check
import { test, expect } from '@playwright/test'

test('Payment button is disabled when user address is missing', async ({
  page
}) => {
  // Mock authenticated user without an address
  const mockUser = {
    user: {
      _id: '123456',
      name: 'Test User',
      email: 'test@example.com',
      role: 0,
      address: '' // Empty address
    },
    token: 'mock-jwt-token'
  }

  await page.goto('http://localhost:3000')
  await page.evaluate(authData => {
    localStorage.setItem('auth', JSON.stringify(authData))
  }, mockUser)
  await page.evaluate(() => {
    const mockCartItem = {
      _id: 'product123',
      name: 'Test Product',
      description: 'Test description',
      price: 99.99
    }
    localStorage.setItem('cart', JSON.stringify([mockCartItem]))
  })
  await page.reload()
  await page.goto('/cart')

  const cartItems = await page.locator('.row.card.flex-row').all()
  expect(cartItems.length).toBe(1)

  // Verify the "Update Address" button is visible
  await expect(page.locator('button:has-text("Update Address")')).toBeVisible()

  // Wait for the Braintree payment UI to load
  await page
    .waitForSelector('[data-testid="braintree-hosted-field-number"]', {
      timeout: 5000
    })
    .catch(() => {
      // If the Braintree UI doesn't load, continue the test
    })

  // Verify the payment button exists and is disabled
  const paymentButton = page.locator('button:has-text("Make Payment")')
  await expect(paymentButton).toBeVisible()
  await expect(paymentButton).toBeDisabled()

  // Verify the button has the disabled attribute
  const isDisabled = await paymentButton.evaluate(button =>
    button.hasAttribute('disabled')
  )
  expect(isDisabled).toBeTruthy()

  // Update the user to have an address
  await page.evaluate(() => {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}')
    if (auth.user) {
      auth.user.address = '123 Test Street, Test City'
      localStorage.setItem('auth', JSON.stringify(auth))
    }
  })
  await page.reload()
  await page.waitForSelector('.cart-page')

  // Verify the current address is now displayed
  await expect(
    page.locator('h5:has-text("123 Test Street, Test City")')
  ).toBeVisible()
})
