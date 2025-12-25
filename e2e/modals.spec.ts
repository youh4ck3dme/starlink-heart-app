import { test, expect } from '@playwright/test';

test.describe('Starlink Heart Modals & Features', () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('custom_api_key', 'mock_key_for_e2e');
            localStorage.removeItem('hasStarted'); // Force Intro
            localStorage.setItem('mascotMode', 'image'); // Force 2D for speed
        });
        await page.goto('/');
        
        // Ensure we are on Welcome Screen
        await expect(page.getByText('Začať misiu')).toBeVisible();
        await page.getByText('Začať misiu').click();
        
        // Wait for Dashboard key element to be visible
        // Uses stable data-testid
        await expect(page.getByTestId('new-mission-btn')).toBeVisible({ timeout: 10000 });
    });

    test('Profile Modal opens and displays content', async ({ page }) => {
        // Find and click Profile button
        await page.getByTestId('profile-btn').click();

        // Verify Modal Title
        await expect(page.getByText('Môj Profil Kadeta')).toBeVisible();
        
        // Verify Stats presence
        await expect(page.getByText('Úroveň')).toBeVisible();
        await expect(page.getByText('Splnené misie')).toBeVisible();

        // Close Modal
        await page.getByRole('button', { name: /Zavrieť/i }).click();
        
        // Verify Modal is hidden (title not visible)
        await expect(page.getByText('Môj Profil Kadeta')).not.toBeVisible();
    });

    test('Settings Modal opens and displays options', async ({ page }) => {
        // Find and click Settings button
        await page.getByTestId('settings-btn').click();

        // Verify Modal Title
        await expect(page.getByText('Riadiace Centrum')).toBeVisible();
        
        // Verify sections
        await expect(page.getByText('Tvoj Avatar')).toBeVisible();
        await expect(page.getByText('Prostredie')).toBeVisible();

        // Close Modal
        await page.getByRole('button', { name: /Uložiť a Zavrieť/i }).click();
        
        // Verify Modal is hidden
        await expect(page.getByText('Riadiace Centrum')).not.toBeVisible();
    });

    test('Coach Mode toggle switches state', async ({ page }) => {
        // Initial State: Hra (Game)
        const toggleBtn = page.getByTestId('coach-toggle-btn');
        await expect(toggleBtn).toBeVisible();
        
        // Check text content matches Hra
        await expect(toggleBtn).toContainText(/Hra/i);
        
        // Click to toggle
        await toggleBtn.click();
        
        // Check new state: Kouč (Coach)
        await expect(toggleBtn).toContainText(/Kouč/i);
        
        // Toggle back
        await toggleBtn.click();
        await expect(toggleBtn).toContainText(/Hra/i);
    });
});
