import { test, expect } from '@playwright/test';

test('Verify homepage and filters presence', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Confirm homepage by checking for the banner and headings
  await expect(page.getByRole('img', { name: 'bannerimage' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'All Products' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Filter By Category' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Filter By Price' })).toBeVisible();
});

test('Category filter should display products', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  const categoryCheckbox = page.getByRole('checkbox').first();
  await categoryCheckbox.check();

  // Ensure at least one product card is visible
  await page.waitForSelector('.card', { state: 'visible' });
  const productCount = await page.locator('.card').count();
  expect(productCount).toBeGreaterThan(0);

});

test('Price filter should display products within the range', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  const priceRadio = page.getByRole('radio').first();
  const priceLabel = await priceRadio.textContent();
  await priceRadio.check();

  const match = priceLabel?.match(/\$(\d+)(?:\s?to\s?\$(\d+))?/);
  const minPrice = match ? parseFloat(match[1]) : 0;
  const maxPrice = match && match[2] ? parseFloat(match[2]) : Infinity;

  // Wait for products to load
  const productCards = page.locator('.card');
  await page.waitForTimeout(2000);

  const cardCount = await productCards.count();

  if (cardCount === 0) {
    console.warn(`No products found for range: $${minPrice} to $${maxPrice}. Skipping validation.`);
    return; // Exit the test without failure
  }

  console.log(`Found ${cardCount} products for range: $${minPrice} to $${maxPrice}`);

  for (let i = 0; i < cardCount; i++) {
    const card = productCards.nth(i);
    const cardText = await card.textContent();
    const priceMatch = cardText?.match(/\$\s?(\d+(\.\d+)?)/);

    if (priceMatch) {
      const price = parseFloat(priceMatch[1]);
      console.log(`Product ${i + 1}: $${price}`);
      expect(price).toBeGreaterThanOrEqual(minPrice);
      expect(price).toBeLessThanOrEqual(maxPrice);
    } else {
      console.warn(`No price found for card ${i + 1}`);
    }
  }
});

test('Reset filters should clear applied filters', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  
  // Wait until products are visible
  await page.waitForSelector('.card', { timeout: 10000 });

  const initialCount = await page.locator('.card').count();
  expect(initialCount).toBeGreaterThan(0);

  // Apply filters
  await page.getByRole('checkbox').first().check();
  await page.getByRole('radio').first().check();
  
  // Reset Filters
  await page.getByRole('button', { name: 'RESET FILTERS' }).click();

  // Confirm products are visible again
  await page.waitForSelector('.card', { timeout: 10000 });
  const productCount = await page.locator('.card').count();
  expect(productCount).toBeGreaterThan(0);
});





