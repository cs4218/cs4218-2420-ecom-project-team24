// @ts-check
import { test, expect } from '@playwright/test'

test('Empty cart displays appropriate message', async ({ page }) => {
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

  await page.goto('http://localhost:3000')
  await page.evaluate(authData => {
    localStorage.setItem('auth', JSON.stringify(authData))
  }, mockUser)
  await page.evaluate(() => {
    localStorage.removeItem('cart')
  })
  await page.reload()
  await page.goto('/cart')
  await expect(page.locator('p:has-text("Your Cart Is Empty")')).toBeVisible()

  // Verify no cart items are displayed
  const cartItems = await page.locator('.row.card.flex-row').all()
  expect(cartItems.length).toBe(0)

  // Verify the cart summary still shows but with $0 total
  await expect(page.locator('.cart-summary')).toBeVisible()
  const totalPriceText = await page
    .locator('h4:has-text("Total :")')
    .textContent()
  expect(totalPriceText).toContain('$0')

  // Now add an item to the cart
  await page.goto('/')
  await page.waitForSelector('.card')

  const products = await page.locator('.card').all()
  expect(products.length).toBeGreaterThanOrEqual(1)

  await products[0].locator('button:has-text("ADD TO CART")').click()
  await expect(page.locator('[role="status"]').first()).toBeVisible()
  await expect(page.locator('[role="status"]').first()).toContainText(
    'Item Added to cart'
  )
  await page.goto('/cart')

  // Verify the "Your Cart Is Empty" message is no longer displayed
  await expect(
    page.locator('p:has-text("Your Cart Is Empty")')
  ).not.toBeVisible()

  // Verify cart now has items
  const cartItemsAfterAdding = await page.locator('.row.card.flex-row').all()
  expect(cartItemsAfterAdding.length).toBe(1)

  // Verify the total price is no longer $0
  const totalPriceAfterAddingText = await page
    .locator('h4:has-text("Total :")')
    .textContent()
  expect(totalPriceAfterAddingText).not.toContain('$0')
})
