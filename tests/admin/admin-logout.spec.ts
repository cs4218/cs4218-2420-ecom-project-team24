import { test, expect } from "@playwright/test";

// code adapted from https://chatgpt.com/share/67da575f-0608-8013-8437-626ab448bed7
test("Admin can log out successfully", async ({ page }) => {
  await page.goto("http://localhost:3000/login");

  // use locators api
  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');

  await emailInput.waitFor({ state: "visible" });
  await emailInput.fill("cs4218@test.com");
  await passwordInput.waitFor({ state: "visible" });
  await passwordInput.fill("cs4218@test.com");

  const submitButton = page.getByRole("button", { name: "LOGIN" });
  await submitButton.click();

  await expect(page).toHaveURL("http://localhost:3000/");

  const localStorageAuth = await page.evaluate(() =>
    localStorage.getItem("auth")
  );
  console.log("Stored Auth Data:", localStorageAuth);
  expect(localStorageAuth).not.toBeNull();

  const profileDropdown = page.locator(
    ".nav-item.dropdown .nav-link.dropdown-toggle",
    {
      hasText: "CS 4218 TEST ACCOUNT",
    }
  );
  await profileDropdown.click();
  await page.waitForTimeout(500);

  const logoutButton = page.locator(".dropdown-menu .dropdown-item", { hasText: "Logout" });
  await logoutButton.click();

  await expect(page).toHaveURL("http://localhost:3000/login");

  const localStorageAuthAfter = await page.evaluate(() =>
    localStorage.getItem("auth")
  );
  console.log("Auth Data After Logout:", localStorageAuthAfter);
  expect(localStorageAuthAfter).toBeNull();
});
