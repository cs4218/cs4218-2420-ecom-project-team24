import { test, expect } from "@playwright/test";

test.use({ storageState: "tests/setup/auth.json" });

// code adapted from https://chatgpt.com/share/67da575f-0608-8013-8437-626ab448bed7
test("admin can delete a category", async ({ page }) => {
  await page.goto("http://localhost:3000/dashboard/admin/create-category");

  const categoryInput = page.locator('input[placeholder="Enter new category"]');
  await categoryInput.waitFor({ state: "visible" });

  await categoryInput.fill("Test Category");

  const submitButton = page.getByRole("button", { name: "Submit" });
  await submitButton.click();

  const categoryRow = page.locator("table tr", { hasText: "Test Category" });

  const deleteButton = categoryRow.locator("button.btn-danger");
  await deleteButton.click();

  await expect(page.locator("table")).not.toContainText("Test Category");
});
