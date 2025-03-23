// @ts-check
import { test, expect } from '@playwright/test'

test('Payment section is not shown when user is not logged in', async ({
  page
}) => {
  await page.goto('http://localhost:3000')
  await page.evaluate(() => {
    localStorage.removeItem('auth')
  })
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

  // Verify the "Hello Guest" message is displayed
  await expect(page.locator('h1:has-text("Hello Guest")')).toBeVisible()

  // Verify the login message is displayed
  await expect(
    page.locator('p:has-text("please login to checkout")')
  ).toBeVisible()

  // Verify the "Plase Login to checkout" button is visible
  await expect(
    page.locator('button:has-text("Plase Login to checkout")')
  ).toBeVisible()

  // Verify the payment section is not visible
  const paymentButton = page.locator('button:has-text("Make Payment")')
  await expect(paymentButton).not.toBeVisible()

  // Verify the Braintree Drop-in UI is not visible
  const dropInUI = page.locator('[data-testid="braintree-hosted-field-number"]')
  await expect(dropInUI).not.toBeVisible()

  const mockUser = {
    user: {
      _id: '123456',
      name: 'Test User',
      email: 'test@example.com',
      role: 0,
      address: '123 Test Street, Test City'
    },
    token: 'mock-jwt-token'
  }

  await page.evaluate(authData => {
    localStorage.setItem('auth', JSON.stringify(authData))
  }, mockUser)
  await page.reload()
  await expect(page.locator('h1:has-text("Hello Test User")')).toBeVisible()
  await expect(
    page.locator('h5:has-text("123 Test Street, Test City")')
  ).toBeVisible()
  await page
    .waitForSelector('button:has-text("Make Payment")', { timeout: 5000 })
    .catch(() => {
      // If the payment button doesn't appear, continue the test
    })

  // The payment button should now be visible (though it might be disabled until Braintree loads)
  await expect(page.locator('button:has-text("Make Payment")')).toBeVisible()
})
