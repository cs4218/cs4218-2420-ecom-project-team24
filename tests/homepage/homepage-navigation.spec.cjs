import { test, expect } from '@playwright/test';

test('homepage navigation - navigate from homepage to different categories and back to homepage', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3000/');
  
    // Click on Home link and verify All Products heading
    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page.getByRole('heading', { name: 'All Products' })).toBeVisible();
  
    // Navigate to Electronics category and verify
    await page.getByRole('link', { name: 'Categories' }).click();
    await page.getByRole('link', { name: 'Electronics' }).click();
    await page.getByRole('heading', { name: 'Category - Electronics' });
  
    // Navigate within Electronics and check product headings
    await page.getByRole('heading', { name: 'Laptops' }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('heading', { name: 'Laptops' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Smartphone' })).toBeVisible();
  
    // Navigate to Books category and verify
    await page.getByRole('link', { name: 'Categories' }).click();
    await page.getByRole('link', { name: 'Book' }).click();
    await expect(page.getByRole('heading', { name: 'Category - Book' })).toBeVisible();
  
    // Check for book products
    await expect(page.getByRole('heading', { name: 'Textbook' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'The Law of Contract in' })).toBeVisible();
  
    // Navigate back to Home and verify
    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page.getByRole('heading', { name: 'All Products' })).toBeVisible();
  });


test('Homepage to Register', async ({ page }) => {
  // Navigate to the homepage
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Home' }).click();

  // Verify navigation to 'All Products' section
  await page.getByRole('heading', { name: 'All Products' }).click();

  // Navigate to the Register page
  await page.getByRole('link', { name: 'Register' }).click();

  // Attempt to register with user details
  await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('Tester');
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('testings1@test.com');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('testings1@test.com');
  await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('99000122');
  await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('test');
  await page.getByPlaceholder('Enter Your DOB').fill('2005-12-27');
  await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill('Football');
  await page.getByRole('button', { name: 'REGISTER' }).click();

});

test('Login, Navigate to Dashboard and Orders, and Return to Homepage', async ({ page }) => {
  // Navigate to the homepage
  await page.goto('http://localhost:3000/');

  // Perform login using provided credentials
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('testing@test.com');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('testing@test.com');
  await page.getByRole('button', { name: 'LOGIN' }).click();

  // Verify login and navigate to Dashboard
  await page.getByRole('button', { name: 'Tester' }).click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  // Navigate to Orders
  await page.getByRole('link', { name: 'Orders' }).click();
  await expect(page.getByRole('heading', { name: 'All Orders' })).toBeVisible();

  // Return to the homepage
  await page.getByRole('link', { name: 'Home' }).click();
  await expect(page.getByRole('heading', { name: 'All Products' })).toBeVisible();

  // Logout
  await page.getByRole('button', { name: 'Tester' }).click();
  await page.getByRole('link', { name: 'Logout' }).click();

  // Verify successful logout
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
});

test('Admin Dashboard Navigation from Homepage', async ({ page }) => {
  // Navigate to the homepage
  await page.goto('http://localhost:3000/');

  // Ensure the homepage is displayed
  await expect(page.getByRole('heading', { name: 'All Products' })).toBeVisible();

  // Navigate to the Login page
  await page.getByRole('link', { name: 'Login' }).click();

  // Perform login with admin credentials
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('cs4218@test.com');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('cs4218@test.com');
  await page.getByRole('button', { name: 'LOGIN' }).click();

  // Verify successful login by checking the presence of the admin account button
  await expect(page.getByRole('button', { name: 'CS 4218 Test Account' })).toBeVisible();

  // Navigate to Dashboard via admin account
  await page.getByRole('button', { name: 'CS 4218 Test Account' }).click();
  await page.getByRole('link', { name: 'Dashboard' }).click();

  // Verify Admin Panel is displayed
  await expect(page.getByRole('heading', { name: 'Admin Panel' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Admin Name : CS 4218 Test' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Admin Email : cs4218@test.com' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Admin Contact :' })).toBeVisible();

  // Navigate through different admin options
  await page.getByRole('link', { name: 'Create Category' }).click();
  await expect(page).toHaveURL(/.*create-category/);

  await page.getByRole('link', { name: 'Create Product' }).click();
  await expect(page).toHaveURL(/.*create-product/);

  await page.getByRole('link', { name: 'Products' }).click();
  await expect(page).toHaveURL(/.*products/);

  await page.getByRole('link', { name: 'Orders' }).click();
  await expect(page).toHaveURL(/.*orders/);

  // Logout from the admin account
  await page.getByRole('button', { name: 'CS 4218 Test Account' }).click();
  await page.getByRole('link', { name: 'Logout' }).click();

  // Confirm successful logout by checking redirection to the homepage
  await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
});
