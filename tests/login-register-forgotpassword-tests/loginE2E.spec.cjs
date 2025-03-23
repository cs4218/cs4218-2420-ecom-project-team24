import { test, expect } from '@playwright/test';

test.describe('Login Tests', () => {
  test('successful login', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('newuser@test.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('newuser');
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
  });

  test('login with incorrect password', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('newuser@test.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('wrongpassword');
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await expect(page.getByText('Invalid Password')).toBeVisible();
  });

  test('login with unregistered email', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('unregistered@test.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('password');
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await expect(page.getByText('Something went wrong')).toBeVisible();
  });

  test('forgot password', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByRole('button', { name: 'Forgot Password' }).click();
    await expect(page.getByRole('heading', { name: 'FORGOT PASSWORD' })).toBeVisible();
  });
});