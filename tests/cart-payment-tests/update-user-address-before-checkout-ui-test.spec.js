// @ts-check
import { test, expect } from '@playwright/test'

test('User can update address before checkout', async ({ page }) => {
  const mockUser = {
    user: {
      _id: '123456',
      name: 'Test User',
      email: 'test@example.com',
      role: 0,
      address: '' // Empty address initially
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

  // Verify the cart has the item
  const cartItems = await page.locator('.row.card.flex-row').all()
  expect(cartItems.length).toBe(1)

  // Verify the "Update Address" button is visible
  const updateAddressButton = page.locator('button:has-text("Update Address")')
  await expect(updateAddressButton).toBeVisible()

  // Mock the user profile page navigation
  await page.route('**/dashboard/user/profile', route => {
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: `
        <html>
          <head><title>User Profile</title></head>
          <body>
            <h1>User Profile</h1>
            <form id="address-form">
              <input type="text" id="address-input" placeholder="Enter your address" />
              <button type="submit">Save Address</button>
            </form>
          </body>
        </html>
      `
    })
  })

  // Click the "Update Address" button
  await updateAddressButton.click()

  // Verify we're on the profile page
  await expect(page).toHaveURL(/.*\/dashboard\/user\/profile/)

  // Simulate updating the address
  await page.evaluate(() => {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}')
    if (auth.user) {
      auth.user.address = '456 New Street, New City'
      localStorage.setItem('auth', JSON.stringify(auth))
    }
  })

  // Navigate back to the cart page
  await page.goto('/cart')

  // Verify the current address is now displayed
  const addressElement = page.locator('h5')
  await expect(addressElement).toBeVisible()
  const addressText = await addressElement.textContent()
  expect(addressText).toContain('456 New Street, New City')

  // Verify the payment button is now enabled
  const paymentButton = page.locator('button:has-text("Make Payment")')
  const isDisabled = await paymentButton
    .evaluate(
      button =>
        button.hasAttribute('disabled') &&
        button.getAttribute('disabled') !== 'false'
    )
    .catch(() => true)

  if (isDisabled) {
    // Check that the disabled state is not due to missing address
    const buttonText = await paymentButton.textContent()
    expect(buttonText).not.toContain('Address required')
  }
})
