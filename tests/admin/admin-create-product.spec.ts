import { test, expect } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

test.use({ storageState: "tests/setup/auth.json" });

// code adapted from https://chatgpt.com/share/67da575f-0608-8013-8437-626ab448bed7
test("admin can create a new product", async ({ page }) => {
  await page.goto("http://localhost:3000/");

  const profileDropdown = page.locator(
    ".nav-item.dropdown .nav-link.dropdown-toggle",
    {
      hasText: "CS 4218 TEST ACCOUNT",
    }
  );
  await profileDropdown.click();
  await page.waitForTimeout(500);

  const dashboardButton = page.locator(".dropdown-menu .dropdown-item", {
    hasText: "Dashboard",
  });
  await dashboardButton.click();

  await expect(page).toHaveURL("http://localhost:3000/dashboard/admin");

  await page.goto("http://localhost:3000/dashboard/admin/create-product");

  const categoryDropdown = page.locator(".form-select", {
    hasText: "Select a category",
  });
  await categoryDropdown.click();

  const dropdown = page.locator(".ant-select-dropdown");
  await expect(dropdown).toBeVisible();

  const firstOption = dropdown.locator(".ant-select-item").first();
  await firstOption.click();

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const filePath = path.resolve(__dirname, "../data/sample-image.png");

  const uploadLabel = page.locator(".btn-outline-secondary");
  await uploadLabel.click();

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(filePath);

  await expect(page.locator("img[alt='product_photo']")).toBeVisible();

  await page.getByPlaceholder("write a name").fill("Sample Product");
  await page.getByPlaceholder("write a description").fill("This is a sample product for testing.");
  await page.getByPlaceholder("write a Price").fill("99.99");
  await page.getByPlaceholder("write a quantity").fill("10");

  await expect(page.getByPlaceholder("write a name")).toHaveValue("Sample Product");
  await expect(page.getByPlaceholder("write a description")).toHaveValue("This is a sample product for testing.");
  await expect(page.getByPlaceholder("write a Price")).toHaveValue("99.99");
  await expect(page.getByPlaceholder("write a quantity")).toHaveValue("10");

  const submitButton = page.locator('button[type="submit"]');
  await submitButton.click();
});
