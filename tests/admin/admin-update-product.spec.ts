import { test, expect } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

test.use({ storageState: "tests/setup/auth.json" });

// code adapted from https://chatgpt.com/share/67da575f-0608-8013-8437-626ab448bed7
// some code from playwright playgen
test("admin can create and update a product", async ({ page }, testInfo) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const filePath = path.resolve(__dirname, "../data/sample.png");
  const newfilePath = path.resolve(__dirname, "../data/sample-image.png");

  // because there are multiple workers in playwright test defined
  const uniqueId = `${Date.now()}-${testInfo.workerIndex}-${
    testInfo.project.name
  }`;
  const productName = `testing-${uniqueId}`;
  const updatedName = `${productName} updated`;

  await page.goto("http://localhost:3000/dashboard/admin/create-product");

  await page.locator("#rc_select_0").click();
  await page.getByTitle("Electronics New").locator("div").click();

  await page.getByText("Upload Photo").click();
  await page.locator("input[type='file']").setInputFiles(filePath);

  await page.getByRole("textbox", { name: "write a name" }).click();
  await page.getByRole("textbox", { name: "write a name" }).fill(productName);

  await page
    .getByRole("textbox", { name: "write a description" })
    .fill("testing desx");

  await page.getByPlaceholder("write a Price").fill("100");

  await page.getByPlaceholder("write a quantity").fill("1");

  await page.locator("#rc_select_1").click();
  await page.getByText("Yes").click();

  await page.getByRole("button", { name: "CREATE PRODUCT" }).click();

  await expect(page).toHaveURL(
    "http://localhost:3000/dashboard/admin/products"
  );

  const productCardLink = page.locator(".product-link", {
    hasText: productName,
  });
  await expect(productCardLink).toBeVisible();
  await productCardLink.click();

  await page.getByPlaceholder("write a name").fill(updatedName);
  await page
    .getByPlaceholder("write a description")
    .fill("Updated description here.");

  await page.getByPlaceholder("write a Price").fill("200");

  await page.getByPlaceholder("write a quantity").fill("8");

  await page.getByText("Upload Photo").click();
  await page.locator("input[type='file']").setInputFiles(filePath);

  const selects = page.locator(".ant-select");
  await selects.nth(0).click();
  await page.getByTitle("Clothing").click();

  await selects.nth(1).click();
  await page.getByText("Yes").click();

  await page.getByRole("button", { name: "UPDATE PRODUCT" }).click();

  await expect(page.getByText("Product Updated Successfully")).toBeVisible();
});
