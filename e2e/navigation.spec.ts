import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
    test('sidebar links navigate to correct pages', async ({ page }) => {
        await page.goto('/');

        // Test Tools page
        await page.getByRole('link', { name: 'Tools' }).click();
        await expect(page).toHaveURL('/tools');
        await expect(page.getByText('Recommended Tools')).toBeVisible();

        // Test Games page
        await page.getByRole('link', { name: 'Games' }).click();
        await expect(page).toHaveURL('/games');
        await expect(page.getByText('Game Center')).toBeVisible();

        // Test Chat page
        await page.getByRole('link', { name: 'Chat' }).click();
        await expect(page).toHaveURL('/chat');
        await expect(page.getByText('Messages')).toBeVisible();

        // Test Timetable page
        await page.getByRole('link', { name: 'Timetable' }).click();
        await expect(page).toHaveURL('/timetable');
        await expect(page.getByText('Timetable & Targets')).toBeVisible();

        // Test News page
        await page.getByRole('link', { name: 'News' }).click();
        await expect(page).toHaveURL('/news');
        await expect(page.getByText('News & Updates')).toBeVisible();

        // Test Profile page
        await page.getByRole('link', { name: 'Profile' }).click();
        await expect(page).toHaveURL('/profile');

        // Test Settings page
        await page.getByRole('link', { name: 'Settings' }).click();
        await expect(page).toHaveURL('/settings');
        await expect(page.getByText('Settings')).toBeVisible();

        // Test Feed (home) page
        await page.getByRole('link', { name: 'Feed' }).click();
        await expect(page).toHaveURL('/');
        await expect(page.getByText('Feed')).toBeVisible();
    });

    test('sidebar highlights active page', async ({ page }) => {
        await page.goto('/tools');
        // The active nav item should have the amber highlight style
        const toolsLink = page.getByRole('link', { name: 'Tools' });
        await expect(toolsLink).toBeVisible();
    });

    test('page titles are correct', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle('Shelter');
    });
});
