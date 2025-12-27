
import { test, expect } from '@playwright/test';

test.describe('Play Store Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('custom_api_key', 'mock_key_for_e2e');
      localStorage.setItem('hasStarted', 'true');
      localStorage.setItem('mascotMode', 'image');
    });
  });

  test('1. Chat with AI mascot', async ({ page }) => {
    await page.goto('/home');
    await expect(page.getByTestId('new-mission-btn')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('new-mission-btn').click();
    const input = page.getByRole('textbox');
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill('Čo je 2+2?');
    await page.getByRole('button', { name: 'Odoslať' }).click();
    await expect(page.getByText('4')).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'e2e/screenshots/1-chat.png' });
  });

  test('2. Dashboard with gems and level', async ({ page }) => {
    await page.goto('/home');
    await expect(page.getByTestId('new-mission-btn')).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'e2e/screenshots/2-dashboard.png' });
  });

  test('3. Shop with backgrounds', async ({ page }) => {
    await page.goto('/home');
    await expect(page.getByTestId('new-mission-btn')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('shop-btn').click();
    await expect(page.getByText('Obchod')).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'e2e/screenshots/3-shop.png' });
  });

  test('4. Settings / Profile', async ({ page }) => {
    await page.goto('/home');
    await expect(page.getByTestId('new-mission-btn')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('settings-btn').click();
    await expect(page.getByText('Vzhľad a Téma')).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'e2e/screenshots/4-settings.png' });
  });
});
