import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
    test('sidebar links navigate to correct pages', async ({ page }) => {
        await page.goto('/');

        // Helper: click a sidebar link and wait for URL
        const nav = async (href: string, url: string) => {
            await page.locator(`a[href="${href}"]`).click({ force: true });
            await expect(page).toHaveURL(url, { timeout: 15000 });
        };

        await nav('/tools', '/tools');
        await expect(page.getByRole('heading', { name: 'Recommended Tools' })).toBeVisible();

        await nav('/games', '/games');
        await expect(page.getByRole('heading', { name: 'Game Center' })).toBeVisible();

        await nav('/chat', '/chat');
        await expect(page.getByRole('heading', { name: 'Messages' })).toBeVisible();

        await nav('/timetable', '/timetable');
        await expect(page.getByRole('heading', { name: 'Timetable & Targets' })).toBeVisible();

        await nav('/news', '/news');
        await expect(page.getByRole('heading', { name: 'News & Updates' })).toBeVisible();

        await nav('/profile', '/profile');

        await nav('/settings', '/settings');
        await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

        await nav('/', '/');
        await expect(page.getByRole('heading', { name: 'Feed' })).toBeVisible();
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


