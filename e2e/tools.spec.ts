import { test, expect } from '@playwright/test';

test.describe('Tools Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/tools');
    });

    test('renders tools page with initial tools', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Recommended Tools' })).toBeVisible();
        await expect(page.getByText('BCUninstaller')).toBeVisible();
        await expect(page.getByText('OBS Studio')).toBeVisible();
        await expect(page.getByText('VS Code')).toBeVisible();
    });

    test('search filters tools', async ({ page }) => {
        await page.getByPlaceholder('Search tools or tags...').fill('obs');
        await expect(page.getByText('OBS Studio')).toBeVisible();
        await expect(page.getByText('BCUninstaller')).not.toBeVisible();
    });

    test('tag filter works', async ({ page }) => {
        // Use the sidebar to filter (scoped to aside to avoid strict-mode with card tag buttons)
        await page.locator('aside').getByRole('button', { name: 'Development' }).click();
        await expect(page.getByText('VS Code')).toBeVisible();
        await expect(page.getByText('BCUninstaller')).not.toBeVisible();
    });

    test('sort by alphabetical works', async ({ page }) => {
        await page.getByRole('button', { name: 'A–Z' }).click();
        // BCUninstaller should appear before VS Code alphabetically
        const cards = page.locator('.bg-stone-900.rounded-3xl');
        await expect(cards.first()).toContainText('BC');
    });

    test('Add Tool modal opens and closes', async ({ page }) => {
        await page.getByRole('button', { name: /add tool/i }).click();
        await expect(page.getByText('Add New Tool')).toBeVisible();
        await page.getByRole('button', { name: 'Cancel' }).click();
        await expect(page.getByText('Add New Tool')).not.toBeVisible();
    });

    test('Add Tool form validation shows error on empty submit', async ({ page }) => {
        await page.getByRole('button', { name: 'Add Tool' }).first().click();
        await page.getByRole('button', { name: 'Add Tool' }).last().click();
        await expect(page.getByText(/required/i)).toBeVisible();
    });

    test('can add a new tool', async ({ page }) => {
        await page.getByRole('button', { name: /add tool/i }).click();
        await page.getByPlaceholder('e.g. VS Code').fill('My Test Tool');
        await page.getByPlaceholder('e.g. Microsoft').fill('Test Author');
        await page.getByPlaceholder('https://...').fill('https://example.com');
        await page.getByPlaceholder('Brief description of the tool...').fill('A tool for testing purposes.');
        await page.getByPlaceholder('Development, Editor').fill('Testing');
        await page.getByRole('button', { name: 'Add Tool' }).last().click();
        await expect(page.getByText('My Test Tool')).toBeVisible();
        await expect(page.getByText('Test Author')).toBeVisible();
    });

    test('can delete own tool after adding', async ({ page }) => {
        // Add a tool first
        await page.getByRole('button', { name: 'Add Tool' }).first().click();
        await page.getByPlaceholder('e.g. VS Code').fill('DeleteMe Tool');
        await page.getByPlaceholder('https://...').fill('https://example.com');
        await page.getByPlaceholder('Brief description of the tool...').fill('Will be deleted.');
        await page.getByRole('button', { name: 'Add Tool' }).last().click();
        await expect(page.getByText('DeleteMe Tool')).toBeVisible();
        // Find the card and click its delete button
        const card = page.locator('[class*="rounded-3xl"]').filter({ hasText: 'DeleteMe Tool' });
        await card.locator('button').nth(1).click();
        await expect(page.getByText('DeleteMe Tool')).not.toBeVisible();
    });

    test('upvote button toggles', async ({ page }) => {
        const upvoteBtn = page.locator('[data-testid="upvote-1"]');
        await expect(upvoteBtn).toBeVisible();
        const initialText = await upvoteBtn.textContent();
        await upvoteBtn.click();
        const afterText = await upvoteBtn.textContent();
        expect(afterText).not.toBe(initialText);
    });
});
