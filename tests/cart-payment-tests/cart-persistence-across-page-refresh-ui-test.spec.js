// @ts-nocheck
import { test, expect } from '@playwright/test'

test('Cart persists across page refreshes', async ({ page }) => {
  await page.goto('http://localhost:3000')
  await page.waitForSelector('.card')

  const products = await page.locator('.card').all()
  expect(products.length).toBeGreaterThanOrEqual(2)

  const firstProductName = await products[0]
    .locator('.card-title')
    .first()
    .textContent()

  await products[0].locator('button:has-text("ADD TO CART")').click()
  await expect(page.locator('[role="status"]').first()).toBeVisible()
  await expect(page.locator('[role="status"]').first()).toContainText(
    'Item Added to cart'
  )

  await page.reload()
  await page.goto('/cart')

  const cartItems = await page.locator('.row.card.flex-row').all()
  expect(cartItems.length).toBe(1)

  if (firstProductName) {
    const cartItemName = await cartItems[0].locator('p').first().textContent()
    expect(cartItemName).toContain(firstProductName)
  }

  await page.goto('/')
  await page.goto('/cart')

  // Verify the cart still has the item after navigation
  const cartItemsAfterNavigation = await page
    .locator('.row.card.flex-row')
    .all()
  expect(cartItemsAfterNavigation.length).toBe(1)

  // Get the cart data from localStorage before closing the context
  const cartData = await page.evaluate(() => {
    return localStorage.getItem('cart')
  })

  // Close the browser and reopen it to simulate a new session
  await page.context().close()
  const newContext = await page.context().browser().newContext()
  const newPage = await newContext.newPage()

  // Navigate to the site in the new session
  await newPage.goto('http://localhost:3000')

  // Set the cart data in the new context
  if (cartData) {
    await newPage.evaluate(data => {
      localStorage.setItem('cart', data)
    }, cartData)
  }

  await newPage.goto('/cart')

  // Verify the cart still has the item in the new session
  const cartItemsNewSession = await newPage.locator('.row.card.flex-row').all()
  expect(cartItemsNewSession.length).toBe(1)

  // Verify the product name matches what we added
  if (firstProductName) {
    const cartItemName = await cartItemsNewSession[0]
      .locator('p')
      .first()
      .textContent()
    expect(cartItemName).toContain(firstProductName)
  }
})
