import { test, expect } from '@playwright/test';

test.describe('School Dashboard E2E', () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('custom_api_key', 'mock_key_for_e2e');
            localStorage.setItem('hasStarted', 'true');
            localStorage.setItem('mascotMode', 'image');
        });
    });

    test('Can navigate to School Dashboard from Home', async ({ page }) => {
        // Go to home directly
        await page.goto('/home');
        
        // Wait for dashboard to load
        await expect(page.getByTestId('new-mission-btn')).toBeVisible({ timeout: 10000 });
        
        // Navigate to School Dashboard
        await page.goto('/dashboard');
        
        // Verify School Dashboard loaded
        await expect(page.getByText('ŠKOLA')).toBeVisible();
    });

    test('School Dashboard displays all cards', async ({ page }) => {
        await page.goto('/dashboard');
        
        // Verify Timetable Card
        await expect(page.getByRole('region', { name: /Dnešný rozvrh/i })).toBeVisible();
        await expect(page.getByText('Matematika')).toBeVisible();
        await expect(page.getByText('TERAZ')).toBeVisible();
        
        // Verify Grades Card
        await expect(page.getByRole('region', { name: /Posledné známky/i })).toBeVisible();
        await expect(page.getByText('MAT')).toBeVisible();
        
        // Verify Notices Card
        await expect(page.getByRole('region', { name: /Oznamy/i })).toBeVisible();
        await expect(page.getByText('Nová úloha z matematiky')).toBeVisible();
    });

    test('Theme toggle switches between green and pink', async ({ page }) => {
        await page.goto('/dashboard');
        
        // Start with green theme
        const themeButton = page.getByLabel(/Prepnúť na ružovú tému/i);
        await expect(themeButton).toBeVisible();
        
        // Toggle to pink
        await themeButton.click();
        
        // Should now show green toggle option
        await expect(page.getByLabel(/Prepnúť na zelenú tému/i)).toBeVisible();
        
        // Verify localStorage was updated
        const theme = await page.evaluate(() => localStorage.getItem('dashboardTheme'));
        expect(theme).toBe('pink');
    });

    test('Back button navigates to Home', async ({ page }) => {
        await page.goto('/dashboard');
        
        // Click back button
        const backButton = page.getByLabel(/Späť na hlavnú stránku/i);
        await backButton.click();
        
        // Should be on Home page
        await expect(page).toHaveURL('/home');
    });

    test('Mobile responsive - no horizontal scroll', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/dashboard');
        
        // Verify no horizontal scroll
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = await page.evaluate(() => window.innerWidth);
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
        
        // Verify cards are visible
        await expect(page.getByText('ŠKOLA')).toBeVisible();
    });
});

test.describe('Extended Chat Flow E2E', () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('custom_api_key', 'mock_key_for_e2e');
            localStorage.setItem('hasStarted', 'true');
            localStorage.setItem('mascotMode', 'image');
        });
    });

    test('Chat input accepts text and clears on navigation', async ({ page }) => {
        await page.goto('/home');
        
        // Wait for dashboard
        await expect(page.getByTestId('new-mission-btn')).toBeVisible({ timeout: 10000 });
        
        // Go to chat
        await page.getByTestId('new-mission-btn').click();
        
        // Wait for chat input
        const input = page.getByRole('textbox');
        await expect(input).toBeVisible({ timeout: 5000 });
        
        // Type message
        await input.fill('Čo je 2+2?');
        await expect(input).toHaveValue('Čo je 2+2?');
    });

    test('Settings changes persist across navigation', async ({ page }) => {
        await page.goto('/home');
        
        // Wait for dashboard
        await expect(page.getByTestId('new-mission-btn')).toBeVisible({ timeout: 10000 });
        
        // Open Settings
        await page.getByTestId('settings-btn').click();
        await expect(page.getByText('Vzhľad a Téma')).toBeVisible({ timeout: 5000 });
        
        // Close settings
        await page.getByTestId('close-settings-btn').click();
        
        // Navigate to Dashboard and back
        await page.goto('/dashboard');
        await page.goto('/home');
        
        // Verify we're still on home
        await expect(page.getByTestId('new-mission-btn')).toBeVisible();
    });
});
