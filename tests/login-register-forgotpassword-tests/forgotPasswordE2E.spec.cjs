import { test, expect } from '@playwright/test';

test.describe('Forgot Password Tests', () => {
  test('successful password reset', async ({ page }) => {
    await page.goto('http://localhost:3000/forgot-password');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('test@gmail.com');
    await page.getByRole('textbox', { name: 'Enter Your Security Answer' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Security Answer' }).fill('test@gmail.com');
    await page.getByRole('textbox', { name: 'Enter Your New Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your New Password' }).fill('newpassword');
    await page.getByRole('button', { name: 'RESET PASSWORD' }).click();
    await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toBeVisible();
  });

  test('missing email field', async ({ page }) => {
    await page.goto('http://localhost:3000/forgot-password');
    await page.getByRole('textbox', { name: 'Enter Your Security Answer' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Security Answer' }).fill('test@gmail.com');
    await page.getByRole('textbox', { name: 'Enter Your New Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your New Password' }).fill('newpassword');
    await page.getByRole('button', { name: 'RESET PASSWORD' }).click();
    await expect(page.getByRole('heading', { name: 'FORGOT PASSWORD' })).toBeVisible();
  });

  test('missing security answer field', async ({ page }) => {
    await page.goto('http://localhost:3000/forgot-password');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('test@gmail.com');
    await page.getByRole('textbox', { name: 'Enter Your New Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your New Password' }).fill('newpassword');
    await page.getByRole('button', { name: 'RESET PASSWORD' }).click();
    await expect(page.getByRole('heading', { name: 'FORGOT PASSWORD' })).toBeVisible();
  });

  test('missing new password field', async ({ page }) => {
    await page.goto('http://localhost:3000/forgot-password');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('test@gmail.com');
    await page.getByRole('textbox', { name: 'Enter Your Security Answer' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Security Answer' }).fill('test@gmail.com');
    await page.getByRole('button', { name: 'RESET PASSWORD' }).click();
    await expect(page.getByRole('heading', { name: 'FORGOT PASSWORD' })).toBeVisible();
  });

  test('invalid email or security answer', async ({ page }) => {
    await page.goto('http://localhost:3000/forgot-password');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('invalid@gmail.com');
    await page.getByRole('textbox', { name: 'Enter Your Security Answer' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Security Answer' }).fill('wronganswer');
    await page.getByRole('textbox', { name: 'Enter Your New Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your New Password' }).fill('newpassword');
    await page.getByRole('button', { name: 'RESET PASSWORD' }).click();
    await expect(page.getByText('Something went wrong')).toBeVisible();
  });

  test('navigate to login page', async ({ page }) => {
    await page.goto('http://localhost:3000/forgot-password');
    await page.getByRole('link', { name: 'Login' }).click();
    await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toBeVisible();
  });
});