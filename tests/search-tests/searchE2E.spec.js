// @ts-check
import { test, expect } from '@playwright/test';

const priceRegex = new RegExp("\\$.+\\...");

test.beforeAll(async () => {

});

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
});

test.describe('Viewing all products before searching', () => {
    test('should display correct products on page one', async ({ page }) => {
        const prices = page.getByText(priceRegex);
        const images = page.locator('img');
        const moreDetailsButtons = page.locator('button:has-text("More Details")');
        const addToCartButtons = page.locator('button:has-text("ADD TO CART")');

        expect(await prices.count()).toEqual(6);
        expect(await images.count() -1).toEqual(6); // -1 to ignore banner image
        expect(await moreDetailsButtons.count()).toEqual(6);
        expect(await addToCartButtons.count()).toEqual(6);
    });

    test('should display correct additional products on page two', async ({ page }) => {
        const loadMoreButton = page.getByRole('button', { name: 'Loadmore' });
        await loadMoreButton.click();

        const loadMoreText = page.locator('text=Loading ...');
        await loadMoreText.waitFor({ state: 'detached' });

        const prices = page.getByText(priceRegex);
        const images = page.locator('img');
        const moreDetailsButtons = page.locator('button:has-text("More Details")');
        const addToCartButtons = page.locator('button:has-text("ADD TO CART")');

        expect(await prices.count()).toEqual(9);
        expect(await images.count() -1).toEqual(9); // -1 to ignore banner image
        expect(await moreDetailsButtons.count()).toEqual(9);
        expect(await addToCartButtons.count()).toEqual(9);
    });
});

test.describe('Searching for products', () => {
    test('should display search bar with correct placeholder', async ({ page }) => {
        const searchBar = page.getByRole('searchbox');
        await expect(searchBar).toBeVisible();

        const searchBarPlaceholder = await searchBar.getAttribute('placeholder');
        expect(searchBarPlaceholder).toBe('Search');
    });

    test('should allow typing in search bar', async ({ page }) => {
        const searchBar = page.getByRole('searchbox');
        await searchBar.fill('somekeyword');
  
        const searchBarValue = await searchBar.inputValue();
        expect(searchBarValue).toBe('somekeyword');
    });

    test('should display correct search results when searching by name', async ({ page }) => {
        const searchBar = page.getByRole('searchbox');
        await searchBar.fill('Law of Contract');
        await page.getByRole('button', { name: /Search/i }).click();

        const searchResultText = page.locator('text=Search Resuts');
        await searchResultText.waitFor({ state: 'attached' });
  
        const images = page.locator('img');
        const moreDetailsButtons = page.locator('button:has-text("More Details")');
        const addToCartButtons = page.locator('button:has-text("ADD TO CART")');

        await expect(page.getByText('Found 1')).toBeVisible();
        await expect(page.getByText('Law of Contract')).toBeVisible();
        expect(await images.count()).toEqual(1);
        expect(await moreDetailsButtons.count()).toEqual(1);
        expect(await addToCartButtons.count()).toEqual(1);
    });

    test('should display correct search results when searching by description', async ({ page }) => {
        const searchBar = page.getByRole('searchbox');
        await searchBar.fill('bestselling');
        await page.getByRole('button', { name: /Search/i }).click();

        const searchResultText = page.locator('text=Search Resuts');
        await searchResultText.waitFor({ state: 'attached' });
  
        const images = page.locator('img');
        const keyword = page.locator('text=bestselling');
        const moreDetailsButtons = page.locator('button:has-text("More Details")');
        const addToCartButtons = page.locator('button:has-text("ADD TO CART")');

        await expect(page.getByText('Found 3')).toBeVisible();
        expect(await images.count()).toEqual(3);
        expect(await keyword.count()).toEqual(3);
        expect(await moreDetailsButtons.count()).toEqual(3);
        expect(await addToCartButtons.count()).toEqual(3);
    });

    test('should correctly truncate description if it exceeds 30 characters', async ({ page }) => {
        const searchBar = page.getByRole('searchbox');
        await searchBar.fill('bestselling');
        await page.getByRole('button', { name: /Search/i }).click();

        const searchResultText = page.locator('text=Search Resuts');
        await searchResultText.waitFor({ state: 'attached' });
  
        const keyword = page.locator('text=bestselling');
        const keywordCount = await keyword.count();
        for (let i = 0; i < keywordCount; i++) {
            const text = await keyword.nth(i).textContent();
            if (text) {
                expect(text.length).toBeLessThanOrEqual(33); // include ellipses
            }
        }
    });

    test('should display search keyword in searchbox when navigating', async ({ page }) => {
        const searchBar = page.getByRole('searchbox');
        await searchBar.fill('bestselling');
        await page.getByRole('button', { name: /Search/i }).click();

        const searchResultText = page.locator('text=Search Resuts');
        await searchResultText.waitFor({ state: 'attached' });

        const resultsSearchBarValue = await searchBar.inputValue();
        expect(resultsSearchBarValue).toBe('bestselling');

        const homePageLink = page.locator('a[href="/"]:has-text("Virtual Vault")');
        await homePageLink.click();

        const allProductsText = page.locator('text=All Products');
        await allProductsText.waitFor({ state: 'attached' });

        const homeSearchBarValue = await searchBar.inputValue();
        expect(homeSearchBarValue).toBe('bestselling');
    });

    test('should not display search results when keyword is not found', async ({ page }) => {
        const searchBar = page.getByRole('searchbox');
        await searchBar.fill('keywordnotfound');
        await page.getByRole('button', { name: /Search/i }).click();

        const searchResultText = page.locator('text=Search Resuts');
        await searchResultText.waitFor({ state: 'attached' });

        const images = page.locator('img');
        const moreDetailsButtons = page.locator('button:has-text("More Details")');
        const addToCartButtons = page.locator('button:has-text("ADD TO CART")');
        await expect(page.getByText('No Products Found')).toBeVisible();
        expect(await images.count()).toEqual(0);
        expect(await moreDetailsButtons.count()).toEqual(0);
        expect(await addToCartButtons.count()).toEqual(0);
    });

    test('should not perform search if searchbox is empty', async ({ page }) => {
        const searchBar = page.getByRole('searchbox');
        await searchBar.fill('');
        await page.getByRole('button', { name: /Search/i }).click();

        await expect(page.getByText('All Products')).toBeVisible();
    });
});