// @ts-check
import { test, expect } from '@playwright/test'

test('User can add multiple items to cart', async ({ page }) => {
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

  const firstProductName = await products[0]
    .locator('.card-title')
    .first()
    .textContent()

  await products[0].locator('button:has-text("ADD TO CART")').click()
  await expect(page.locator('[role="status"]').first()).toBeVisible()
  await expect(page.locator('[role="status"]').first()).toContainText(
    'Item Added to cart'
  )
  await page.waitForTimeout(1000)

  const secondProductName = await products[1]
    .locator('.card-title')
    .first()
    .textContent()

  await products[1].locator('button:has-text("ADD TO CART")').click()
  await expect(page.locator('[role="status"]').first()).toBeVisible()
  await expect(page.locator('[role="status"]').first()).toContainText(
    'Item Added to cart'
  )
  await page.goto('/cart')

  const cartItems = await page.locator('.row.card.flex-row').all()
  expect(cartItems.length).toBe(2)

  if (firstProductName && secondProductName) {
    const cartItemNames = await page.locator('.row.card.flex-row p').all()
    const cartItemNamesText = await Promise.all(
      cartItemNames.map(async item => await item.textContent())
    )

    expect(
      cartItemNamesText.some(
        name => name && firstProductName && name.includes(firstProductName)
      )
    ).toBeTruthy()
    expect(
      cartItemNamesText.some(
        name => name && secondProductName && name.includes(secondProductName)
      )
    ).toBeTruthy()
  }

  const totalPriceText =
    (await page.locator('h4:has-text("Total :")').textContent()) || ''

  // Verify the total price is displayed
  expect(totalPriceText).toContain('$')

  const cartItemsInStorage = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('cart') || '[]')
  })

  // Verify we have two items in the cart
  expect(cartItemsInStorage.length).toBe(2)
})
