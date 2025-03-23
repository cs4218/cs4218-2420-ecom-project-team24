// @ts-check
import { test, expect } from '@playwright/test'

test('Adding the same product multiple times increases quantity', async ({
  page
}) => {
  await page.goto('http://localhost:3000')
  await page.waitForSelector('.card')

  const products = await page.locator('.card').all()
  expect(products.length).toBeGreaterThanOrEqual(1)

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
  await products[0].locator('button:has-text("ADD TO CART")').click()
  await expect(page.locator('[role="status"]').first()).toBeVisible()
  await expect(page.locator('[role="status"]').first()).toContainText(
    'Item Added to cart'
  )
  await page.goto('/cart')

  const cartItems = await page.locator('.row.card.flex-row').all()

  if (firstProductName) {
    const cartItemNames = await page.locator('.row.card.flex-row p').all()
    const cartItemNamesText = await Promise.all(
      cartItemNames.map(async item => await item.textContent())
    )

    const productNameOccurrences = cartItemNamesText.filter(
      name => name && firstProductName && name.includes(firstProductName)
    ).length

    // Verify that we have two separate items
    expect(productNameOccurrences).toBe(2)

    const cartItemsInStorage = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('cart') || '[]')
    })

    const productInStorage = cartItemsInStorage.filter(
      item =>
        item.name && firstProductName && item.name.includes(firstProductName)
    )

    // Verify we have two occurrences of the product in the cart
    expect(productInStorage.length).toBe(2)
  }
})
