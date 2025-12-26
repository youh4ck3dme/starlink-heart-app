import { test, expect } from '@playwright/test';

test.describe('Starlink Heart Modals & Features', () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('custom_api_key', 'mock_key_for_e2e');
            localStorage.removeItem('hasStarted'); // Force Intro
            localStorage.setItem('mascotMode', 'image'); // Force 2D for speed
        });
        await page.goto('/');
        
        // Ensure we are on Welcome Screen and navigate to Home
        await expect(page.getByText('Začať misiu')).toBeVisible();
        await page.getByText('Začať misiu').click();
        
        // Now we're on IntroScreen - click ŠTART to get to Dashboard
        const startButton = page.getByRole('button', { name: /štart/i });
        await expect(startButton).toBeVisible({ timeout: 10000 });
        await startButton.click();
        
        // Wait for Dashboard key element to be visible
        await expect(page.getByTestId('new-mission-btn')).toBeVisible({ timeout: 10000 });
    });

    test('Profile Modal opens and displays content', async ({ page }) => {
        // Find and click Profile button
        await page.getByTestId('profile-btn').click();

        // Wait for modal to appear - look for specific content
        await expect(page.getByText('Drahokamy')).toBeVisible({ timeout: 5000 });
        
        // Close Modal using specific test id
        await page.getByTestId('close-profile-btn').click();
        
        // Wait for modal to close
        await expect(page.getByTestId('close-profile-btn')).not.toBeVisible();
    });

    test('Settings Modal opens and displays options', async ({ page }) => {
        // Find and click Settings button
        await page.getByTestId('settings-btn').click();

        // Wait for modal to appear - look for Title
        await expect(page.getByText('Vzhľad a Téma')).toBeVisible({ timeout: 5000 });

        // Close Modal using specific test id
        await page.getByTestId('close-settings-btn').click();
        
        // Wait for modal to close
        await expect(page.getByTestId('close-settings-btn')).not.toBeVisible();
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
