import { test, expect } from "@playwright/test";

test("Admin can log in successfully", async ({ page }) => {
  await page.goto("http://localhost:3000/login");

  // use locators api
  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');

  await emailInput.waitFor({ state: "visible" });
  await emailInput.fill("admin@example.com");
  await passwordInput.waitFor({ state: "visible" });
  await passwordInput.fill("password");

  const submitButton = page.getByRole("button", { name: "LOGIN" });
  await submitButton.click();

  await expect(page).toHaveURL("http://localhost:3000/login");

  const localStorageAuth = await page.evaluate(() =>
    localStorage.getItem("auth")
  );
  console.log("Stored Auth Data (should be null):", localStorageAuth);
  expect(localStorageAuth).toBeNull();
});
