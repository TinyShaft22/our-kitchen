import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display all 5 navigation tabs', async ({ page }) => {
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Check for all 5 nav items
    await expect(nav.getByText('Home')).toBeVisible();
    await expect(nav.getByText('Meals')).toBeVisible();
    await expect(nav.getByText('Grocery')).toBeVisible();
    await expect(nav.getByText('Baking')).toBeVisible();
    await expect(nav.getByText('Settings')).toBeVisible();
  });

  test('should navigate to Meals page', async ({ page }) => {
    await page.click('text=Meals');
    await expect(page).toHaveURL('/meals');
    await expect(page.locator('h1')).toContainText('Meal Library');
  });

  test('should navigate to Grocery page', async ({ page }) => {
    await page.click('text=Grocery');
    await expect(page).toHaveURL('/grocery');
    await expect(page.locator('h1')).toContainText('Grocery List');
  });

  test('should navigate to Baking page', async ({ page }) => {
    await page.click('text=Baking');
    await expect(page).toHaveURL('/baking');
    await expect(page.locator('h1')).toContainText('Baking Corner');
  });

  test('should navigate to Settings page', async ({ page }) => {
    await page.click('text=Settings');
    await expect(page).toHaveURL('/settings');
    await expect(page.locator('h1')).toContainText('Settings');
  });

  test('should navigate back to Home', async ({ page }) => {
    await page.click('text=Meals');
    await page.click('text=Home');
    await expect(page).toHaveURL('/');
  });
});

test.describe('Floating Action Button', () => {
  test('should show FAB on Home page', async ({ page }) => {
    await page.goto('/');
    const fab = page.locator('button[aria-label="Add meal to week"]');
    await expect(fab).toBeVisible();
  });

  test('should show FAB on Meals page', async ({ page }) => {
    await page.goto('/meals');
    const fab = page.locator('button[aria-label="Add new meal"]');
    await expect(fab).toBeVisible();
  });

  test('should show FAB on Baking page', async ({ page }) => {
    await page.goto('/baking');
    const fab = page.locator('button[aria-label="Add baking essential"]');
    await expect(fab).toBeVisible();
  });
});

test.describe('Page Load', () => {
  test('Home page loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
  });

  test('pages have display font for headings', async ({ page }) => {
    await page.goto('/');

    // Check that the h1 uses the display font (Fraunces)
    const h1 = page.locator('h1').first();
    await expect(h1).toHaveCSS('font-family', /Fraunces/);
  });
});
