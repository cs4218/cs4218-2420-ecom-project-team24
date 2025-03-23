import { test, expect } from '@playwright/test';

// Utility to navigate to homepage and verify
async function goToHomepage(page) {
  await page.goto('http://localhost:3000/');
  await expect(page.getByRole('heading', { name: /All Products|Home/i })).toBeVisible();
}

// Utility for clicking a link by name and verifying it
async function clickLink(page, linkName) {
  await expect(page.getByRole('link', { name: new RegExp(linkName, 'i') })).toBeVisible();
  await page.getByRole('link', { name: new RegExp(linkName, 'i') }).click();
}

// Utility to fill a form field
async function fillField(page, fieldName, value) {
  await expect(page.getByRole('textbox', { name: new RegExp(fieldName, 'i') })).toBeVisible();
  await page.getByRole('textbox', { name: new RegExp(fieldName, 'i') }).fill(value);
}

// Test to register a user
test('Navigate to register page and register a new user', async ({ page }) => {
  // Navigate to homepage and register page
  await goToHomepage(page);
  await clickLink(page, 'Register');
  await expect(page.getByRole('button', { name: /register/i })).toBeVisible();

  // Fill the registration form
  await fillField(page, 'name', 'Tester');
  await fillField(page, 'email', 'testings1@test.com');
  await fillField(page, 'password', 'testings1@test.com');
  await fillField(page, 'phone', '99000122');
  await fillField(page, 'address', 'test');
  
  // Fill DOB using placeholder instead of label
  await expect(page.getByPlaceholder('Enter Your DOB')).toBeVisible();
  await page.getByPlaceholder('Enter Your DOB').fill('2005-12-27');
  
  // Fill sports field
  await fillField(page, 'Favorite sports', 'Football');

  // Submit the form
  await page.getByRole('button', { name: /register/i }).click();
});


// Test to login and navigate
test('Login, navigate to Dashboard and Orders, and return to homepage', async ({ page }) => {
  // Go to homepage and check for existence of a heading
  await page.goto('http://localhost:3000/');
  await expect(page.getByRole('heading', { name: /All Products|Home/i })).toBeVisible();

  // Perform login
  await page.getByRole('link', { name: /Login/i }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('testings1@test.com');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('testings1@test.com');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();

  // Verify successful login
  await page.getByRole('button', { name: /Tester/i }).click();
  await page.getByRole('link', { name: /Dashboard/i }).click();
  await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();

  // Navigate to Orders
  await page.getByRole('link', { name: /Orders/i }).click();
  await expect(page.getByRole('heading', { name: /All Orders/i })).toBeVisible();

  // Navigate back to homepage
  await page.getByRole('link', { name: /Home/i }).click();
  await expect(page.getByRole('heading', { name: /All Products/i })).toBeVisible();

  // Logout
  await page.getByRole('button', { name: /Tester/i }).click();
  await page.getByRole('link', { name: /Logout/i }).click();

  // Verify successful logout
  await expect(page.getByRole('link', { name: /Login/i })).toBeVisible();
});


// Test admin panel navigation
test('Admin Dashboard Navigation from Homepage', async ({ page }) => {
  await goToHomepage(page);
  await expect(page.getByRole('heading', { name: /All Products|Home/i })).toBeVisible();

  // Perform login
  await page.getByRole('link', { name: /Login/i }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('cs4218@test.com');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('cs4218@test.com');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();

  await page.getByRole('button', { name: /CS 4218 Test Account/i }).click();
  await clickLink(page, 'Dashboard');

  await expect(page.getByRole('heading', { name: /Admin Panel/i })).toBeVisible();

  await clickLink(page, 'Create Category');
  await expect(page).toHaveURL(/.*create-category/);

  await clickLink(page, 'Create Product');
  await expect(page).toHaveURL(/.*create-product/);

  await clickLink(page, 'Products');
  await expect(page).toHaveURL(/.*products/);

  await clickLink(page, 'Orders');
  await expect(page).toHaveURL(/.*orders/);

});

test('Navigate from homepage to categories, select a category, and return to homepage', async ({ page }) => {
  // Go to homepage and verify
  await page.goto('http://localhost:3000/');
  await expect(page.getByRole('heading', { name: /All Products|Home/i })).toBeVisible({ timeout: 10000 });

  // Navigate to Categories and All Categories with additional waits
  await page.waitForSelector('text=Categories', { state: 'visible' });
  await page.getByRole('link', { name: 'Categories' }).click();

  await page.waitForSelector('text=All Categories', { state: 'visible' });
  await page.getByRole('link', { name: 'All Categories' }).click();

  // Ensure category list is visible
  const categoryList = await page.getByRole('list', { name: 'categories list' });
  await expect(categoryList).toBeVisible({ timeout: 10000 });

  // Return to homepage
  await page.waitForSelector('text=Home', { state: 'visible' });
  await page.getByRole('link', { name: 'Home' }).click();
  await expect(page.getByRole('heading', { name: /All Products|Home/i })).toBeVisible({ timeout: 10000 });

});

test('Navigate from homepage to About, Contact, Privacy Policy, and return to homepage', async ({ page }) => {
  // Go to homepage
  await page.goto('http://localhost:3000/');
  await expect(page.getByRole('img', { name: 'bannerimage' })).toBeVisible();

  // Click on banner image
  await page.getByRole('img', { name: 'bannerimage' }).click();

  // Navigate to About page
  await page.getByRole('link', { name: 'About' }).click();
  await expect(page).toHaveURL(/.*about/);

  // Navigate to Contact page using image
  await page.getByRole('img', { name: 'contactus' }).click();
  await page.getByRole('link', { name: 'Contact' }).click();
  await expect(page.getByRole('heading', { name: 'CONTACT US' })).toBeVisible();

  // Verify Contact page navigation
  await expect(page).toHaveURL(/.*contact/);

  // Navigate to Privacy Policy
  await page.getByRole('link', { name: 'Privacy Policy' }).click();
  await expect(page).toHaveURL(/.*policy/);

  // Ensure privacy policy text is visible
  await expect(page.getByText(/add privacy policy/i).first()).toBeVisible();

  // Click a specific paragraph (optional, remove if unnecessary)
  await page.locator('p:nth-child(6)').click();

  // Return to homepage
  await page.getByRole('link', { name: 'Home' }).click();
  await expect(page.getByRole('img', { name: 'bannerimage' })).toBeVisible();
});

test('Navigate from homepage to product details, verify details, and return to homepage', async ({ page }) => {
  // Go to homepage
  await page.goto('http://localhost:3000/');
  await expect(page.getByRole('heading', { name: /All Products|Home/i })).toBeVisible();

  // Click the first product's "More Details" or equivalent button
  await expect(page.locator('.card-name-price > button').first()).toBeVisible();
  await page.locator('.card-name-price > button').first().click();

  // Verify product details page
  await expect(page.getByRole('heading', { name: /Product Details/i })).toBeVisible();

  // Verify Similar Products Section
  await expect(page.getByRole('heading', { name: /Similar Products/i })).toBeVisible();

  // Return to homepage
  await page.getByRole('link', { name: 'Home' }).click();
  await expect(page.getByRole('heading', { name: /All Products|Home/i })).toBeVisible();
});





