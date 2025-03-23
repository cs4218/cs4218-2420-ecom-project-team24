// @ts-check
import { test, expect } from '@playwright/test'

test('User can remove items from cart', async ({ page }) => {
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
  const cartItemsBeforeRemoval = await page.locator('.row.card.flex-row').all()
  expect(cartItemsBeforeRemoval.length).toBe(2)

  const firstProductName = await cartItemsBeforeRemoval[0]
    .locator('p')
    .first()
    .textContent()

  // Click the "Remove" button of the first product
  await cartItemsBeforeRemoval[0].locator('button:has-text("Remove")').click()

  // Verify the cart now has 1 item
  const cartItemsAfterRemoval = await page.locator('.row.card.flex-row').all()
  expect(cartItemsAfterRemoval.length).toBe(1)

  // Verify the removed product is no longer in the cart
  const remainingProductName = await cartItemsAfterRemoval[0]
    .locator('p')
    .first()
    .textContent()
  expect(remainingProductName).not.toBe(firstProductName)

  // Verify localStorage has been updated
  const cartItemsInStorage = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('cart') || '[]')
  })
  expect(cartItemsInStorage.length).toBe(1)
})
