import { test, expect } from '@playwright/test';

test('User logs in, adds products to the cart, and proceeds to checkout', async ({ page }) => {
  // Navigate to the login page
  await page.goto('http://localhost:3000/login');

  // Verify the login form heading
  await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toBeVisible();

  // Enter login credentials
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('mock@test.com');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('mock@test.com');

  // Click on the login button
  await page.getByRole('button', { name: 'LOGIN' }).click();

  // Verify successful login by checking the visibility of a product
  await expect(page.getByRole('heading', { name: 'NUS T-shirts' })).toBeVisible();

  // Select the first product (NUS T-shirts) and add to cart
  await page.getByRole('heading', { name: '$5.00' }).click();
  await page.locator('div:nth-child(3) > .card-body > div:nth-child(3) > button:nth-child(2)').click();

  // Select the second product (Textbook) and add to cart
  await page.getByRole('heading', { name: 'Textbook' }).click();
  await page.getByRole('heading', { name: '$79.99' }).click();
  await page.locator('div:nth-child(6) > .card-body > div:nth-child(3) > button:nth-child(2)').click();

  // Navigate to the Cart page
  await page.getByRole('link', { name: 'Cart' }).click();

  // Verify cart details
  await expect(page.getByRole('heading', { name: 'Cart Summary' })).toBeVisible();
  await page.getByText('NUS T-shirts').click();
  await expect(page.getByText('Textbook', { exact: true })).toBeVisible();

  // Verify total and proceed to payment
  await expect(page.getByRole('heading', { name: 'Total : $' })).toBeVisible();
  await page.getByRole('button', { name: 'Paying with Card' }).click();
});

test('User logs in, adds products to cart, removes one product, and proceeds to payment', async ({ page }) => {
  // Navigate to the login page
  await page.goto('http://localhost:3000/login');
  
  // Verify login form and input credentials
  await page.getByRole('heading', { name: 'LOGIN FORM' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('mock@test.com');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('mock@test.com');

  // Click on login button
  await page.getByRole('button', { name: 'LOGIN' }).click();
  
  // Navigate to the products page
  await page.getByRole('heading', { name: 'All Products' }).click();

  // Select and add Smartphone to the cart
  await page.getByRole('heading', { name: 'Smartphone' }).click();
  await page.getByRole('heading', { name: '$999.99' }).click();
  await page.locator('div:nth-child(4) > .card-body > div:nth-child(3) > button:nth-child(2)').click();
  
  // Go back to the product list
  await page.getByRole('heading', { name: 'All Products' }).click();

  // Select and add Novel to the cart
  await page.getByRole('heading', { name: 'Novel' }).click();
  await page.getByRole('heading', { name: '$14.99' }).click();
  await page.locator('.card-name-price > button:nth-child(2)').first().click();
  
  // Navigate to the cart
  await page.getByRole('listitem').filter({ hasText: 'Cart2' }).click();
  await page.getByRole('heading', { name: 'Cart Summary' }).click();

  // Verify Smartphone is present and remove it
  await page.getByText('Smartphone', { exact: true }).click();
  await page.locator('div').filter({ hasText: /^SmartphoneA high-end smartphonePrice : 999\.99Remove$/ }).getByRole('button').click();
  
  // Verify Novel is still present
  await page.getByText('Novel', { exact: true }).click();
  
  // Proceed to checkout and payment
  await page.getByRole('heading', { name: 'Total : $' }).click();
  await page.getByRole('button', { name: 'Paying with Card' }).click();
  await page.getByRole('button', { name: 'Make Payment' }).click();
});

test('Login, Navigate to Cart, and Verify Empty Cart', async ({ page }) => {
  // Navigate to login page
  await page.goto('http://localhost:3000/login');

  // Perform login using provided credentials
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('testing@test.com');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('testing@test.com');
  await page.getByRole('button', { name: 'LOGIN' }).click();

  // Navigate to the homepage
  await page.getByRole('link', { name: 'Home' }).click();

  // Navigate to Cart and verify empty cart
  await page.getByRole('link', { name: 'Cart' }).click();
  await expect(page.getByText('Your Cart Is Empty')).toBeVisible();

  // Verify Cart Summary section is visible
  await expect(page.getByRole('heading', { name: 'Cart Summary' })).toBeVisible();
});
