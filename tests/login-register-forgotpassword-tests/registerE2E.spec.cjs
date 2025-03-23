import { test, expect } from '@playwright/test';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

test.describe('Registration Tests', () => {
  test('successful registration', async ({ page }) => {
    const userModel = await import('../../models/userModel.js');

    await page.goto('http://localhost:3000/register');
    await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('New User');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('newuser20@test.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('newuser');
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('00009000');
    await page.getByRole('textbox', { name: 'Enter Your Address' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('Random Street');
    await page.getByPlaceholder('Enter Your DOB').click();
    await page.getByPlaceholder('Enter Your DOB').fill('2002-01-01');
    await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).click();
    await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill('Badminton');
    await page.getByRole('button', { name: 'REGISTER' }).click();

    // Add a small delay to give the page time to update
    await page.waitForTimeout(1000);

    // Take a screenshot for debugging
    await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });

    // Check if the heading is visible
    await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toBeVisible();

    await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    await userModel.default.deleteOne({ email: 'newuser20@test.com' });
    await mongoose.disconnect();
  });

  test('registration with missing fields', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('');
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('');
    await page.getByRole('textbox', { name: 'Enter Your Address' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('');
    await page.getByPlaceholder('Enter Your DOB').click();
    await page.getByPlaceholder('Enter Your DOB').fill('');
    await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).click();
    await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill('');
    await page.getByRole('button', { name: 'REGISTER' }).click();
    
    await page.waitForTimeout(1000);

    // Take a screenshot for debugging
    
    await expect(page.getByRole('heading', { name: 'REGISTER FORM' })).toBeVisible();

  });

  test('registration with existing email', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('Existing User');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('newuser@test.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('password');
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('00009000');
    await page.getByRole('textbox', { name: 'Enter Your Address' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('Random Street');
    await page.getByPlaceholder('Enter Your DOB').click();
    await page.getByPlaceholder('Enter Your DOB').fill('2002-01-01');
    await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).click();
    await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill('Badminton');
    await page.getByRole('button', { name: 'REGISTER' }).click();
    await expect(page.getByText('Already Register please login')).toBeVisible();
  });
});