// @ts-check
import { test, expect } from '@playwright/test'

test('Cart summary displays correct total price', async ({ page }) => {
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
  await page.reload()
  await page.goto('/')
  await page.waitForSelector('.card')

  const products = await page.locator('.card').all()
  expect(products.length).toBeGreaterThanOrEqual(2)

  const firstProductPriceText = await products[0]
    .locator('.card-price')
    .textContent()
  const firstProductPrice = parseFloat(
    firstProductPriceText?.replace('$', '') || '0'
  )

  const secondProductPriceText = await products[1]
    .locator('.card-price')
    .textContent()
  const secondProductPrice = parseFloat(
    secondProductPriceText?.replace('$', '') || '0'
  )

  await products[0].locator('button:has-text("ADD TO CART")').click()
  await expect(page.locator('[role="status"]').first()).toBeVisible()
  await expect(page.locator('[role="status"]').first()).toContainText(
    'Item Added to cart'
  )
  await page.waitForTimeout(1000)
  await products[1].locator('button:has-text("ADD TO CART")').click()
  await expect(page.locator('[role="status"]').first()).toBeVisible()
  await expect(page.locator('[role="status"]').first()).toContainText(
    'Item Added to cart'
  )
  await page.goto('/cart')

  // Verify the cart has 2 items
  const cartItems = await page.locator('.row.card.flex-row').all()
  expect(cartItems.length).toBe(2)

  // Get the total price from the cart page
  const totalPriceText = await page
    .locator('h4:has-text("Total :")')
    .textContent()
  const totalPriceMatch = totalPriceText?.match(/\$([0-9]+(\.[0-9]{2})?)/)
  const displayedTotalPrice = totalPriceMatch
    ? parseFloat(totalPriceMatch[1])
    : 0

  // Calculate the expected total price
  const expectedTotalPrice = firstProductPrice + secondProductPrice

  // Verify the total price is correct
  expect(Math.abs(displayedTotalPrice - expectedTotalPrice)).toBeLessThan(0.01)
})
