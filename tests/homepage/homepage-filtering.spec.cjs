import { test, expect } from '@playwright/test';

test('Verify homepage and filters presence', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Confirm homepage by checking for the banner and headings
  await expect(page.getByRole('img', { name: 'bannerimage' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'All Products' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Filter By Category' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Filter By Price' })).toBeVisible();
});

test('Category filter should work for Electronics', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('checkbox', { name: 'Electronics' }).check();

  await expect(page.getByRole('img', { name: 'Smartphone' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Laptops' })).toBeVisible();
});

test('Price filter should work for $0 to $20', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('radio', { name: '$0 to' }).check();

  await expect(page.getByRole('heading', { name: 'Novel' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '$14.99' })).toBeVisible();
});

test('Price filter should work for $100 or more', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('radio', { name: '$100 or more' }).check();

  await expect(page.getByRole('heading', { name: '$999.99' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '$1,499.99' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Smartphone' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Laptops' })).toBeVisible();
});

test('Category and Price filter should work together', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('checkbox', { name: 'Electronics' }).check();
  await page.getByRole('radio', { name: '$100 or more' }).check();

  await expect(page.getByRole('heading', { name: '$999.99' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '$1,499.99' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Smartphone' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Laptops' })).toBeVisible();
});

test('Reset filters should clear applied filters', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('checkbox', { name: 'Electronics' }).check();
  await page.getByRole('radio', { name: '$100 or more' }).check();

  await page.getByRole('button', { name: 'RESET FILTERS' }).click();

  await expect(page.getByRole('heading', { name: 'Smartphone' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Laptops' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Novel' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'NUS T-shirts' })).toBeVisible();
});

test('User filters a product and adds to cart', async ({ page }) => {
    // Go to homepage
    await page.goto('http://localhost:3000/');
    await expect(page.getByRole('heading', { name: 'All Products' })).toBeVisible();
  
    // Apply category filter
    await page.getByRole('checkbox', { name: 'Electronics' }).check();
    await expect(page.getByRole('heading', { name: 'Smartphone' })).toBeVisible();
  
    // Apply price filter
    await page.getByRole('radio', { name: '$100 or more' }).check();
    await expect(page.getByRole('heading', { name: '$999.99' })).toBeVisible();
  
    // Select the product
    await page.getByRole('heading', { name: 'Smartphone' }).click();
    await expect(page.getByRole('heading', { name: '$999.99' })).toBeVisible();
  
    // Add to cart
    await page.locator('.card:has-text("Smartphone")').locator('button', { hasText: 'ADD TO CART' }).click();
  
    // Go to cart and verify
    await page.getByRole('link', { name: 'Cart' }).click();
    await expect(page.getByRole('heading', { name: 'Cart Summary' })).toBeVisible();
    
    await page.getByText('Smartphone', { exact: true }).click(); 
  });