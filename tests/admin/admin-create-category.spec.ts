import { test, expect } from "@playwright/test";

test.use({ storageState: "tests/setup/auth.json" });

// code adapted from https://chatgpt.com/share/67da575f-0608-8013-8437-626ab448bed7
test("admin can create a new category", async ({ page }) => {
  await page.goto("http://localhost:3000/");

  const profileDropdown = page.locator(
    ".nav-item.dropdown .nav-link.dropdown-toggle",
    {
      hasText: "CS 4218 TEST ACCOUNT",
    }
  );
  await profileDropdown.click();
  await page.waitForTimeout(500);

  const logoutButton = page.locator(".dropdown-menu .dropdown-item", {
    hasText: "Dashboard",
  });
  await logoutButton.click();

  await expect(page).toHaveURL("http://localhost:3000/dashboard/admin");

  await page.goto("http://localhost:3000/dashboard/admin/create-category");

  const categoryInput = page.locator('input[placeholder="Enter new category"]');
  await categoryInput.waitFor({ state: "visible" });

  await categoryInput.fill("Test Category");

  const submitButton = page.getByRole("button", { name: "Submit" });
  await submitButton.click();

  await expect(page.locator("table")).toContainText("Test Category");
});
