import { test, expect } from '@playwright/test';

test.describe('Settings Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/settings');
    });

    test('renders settings page with tab navigation', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Appearance' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Privacy' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Notifications' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Integrations' })).toBeVisible();
    });

    test('appearance tab shows theme options when clicked', async ({ page }) => {
        await page.getByRole('button', { name: 'Appearance' }).click();
        await expect(page.getByText('Theme')).toBeVisible();
        await expect(page.getByTestId('theme-dark')).toBeVisible();
        await expect(page.getByTestId('theme-light')).toBeVisible();
        await expect(page.getByTestId('theme-system')).toBeVisible();
    });

    test('can switch theme to light', async ({ page }) => {
        await page.getByRole('button', { name: 'Appearance' }).click();
        const lightBtn = page.getByTestId('theme-light');
        await lightBtn.click();
        // Button should have active/selected styling
        await expect(lightBtn).toHaveClass(/ring|border|active|bg-amber/);
    });

    test('can switch theme to dark', async ({ page }) => {
        await page.getByRole('button', { name: 'Appearance' }).click();
        // Switch to light first, then back to dark
        await page.getByTestId('theme-light').click();
        const darkBtn = page.getByTestId('theme-dark');
        await darkBtn.click();
        await expect(darkBtn).toHaveClass(/ring|border|active|bg-amber/);
    });

    test('privacy tab opens and shows visibility options', async ({ page }) => {
        await page.getByRole('button', { name: 'Privacy' }).click();
        await expect(page.getByText('Profile Visibility')).toBeVisible();
        await expect(page.getByTestId('profile-vis-public')).toBeVisible();
        await expect(page.getByTestId('profile-vis-friends')).toBeVisible();
        await expect(page.getByTestId('profile-vis-private')).toBeVisible();
    });

    test('can change profile visibility to friends', async ({ page }) => {
        await page.getByRole('button', { name: 'Privacy' }).click();
        const friendsBtn = page.getByTestId('profile-vis-friends');
        await friendsBtn.click();
        await expect(friendsBtn).toHaveClass(/ring|border|active|bg-amber/);
    });

    test('notifications tab opens and shows toggles', async ({ page }) => {
        await page.getByRole('button', { name: 'Notifications' }).click();
        await expect(page.getByTestId('toggle-emailNotifications')).toBeVisible();
        await expect(page.getByTestId('toggle-pushNotifications')).toBeVisible();
        await expect(page.getByTestId('toggle-inAppNotifications')).toBeVisible();
    });

    test('notification toggle changes aria-checked', async ({ page }) => {
        await page.getByRole('button', { name: 'Notifications' }).click();
        const emailToggle = page.getByTestId('toggle-emailNotifications');
        const initialChecked = await emailToggle.getAttribute('aria-checked');
        await emailToggle.click();
        const afterChecked = await emailToggle.getAttribute('aria-checked');
        expect(afterChecked).not.toBe(initialChecked);
    });

    test('integrations tab shows API key fields', async ({ page }) => {
        await page.getByRole('button', { name: 'Integrations' }).click();
        await expect(page.getByTestId('gemini-api-key')).toBeVisible();
        await expect(page.getByTestId('openai-api-key')).toBeVisible();
    });

    test('can type in Gemini API key field', async ({ page }) => {
        await page.getByRole('button', { name: 'Integrations' }).click();
        const geminiInput = page.getByTestId('gemini-api-key');
        await geminiInput.fill('test-gemini-key-123');
        await expect(geminiInput).toHaveValue('test-gemini-key-123');
    });

    test('save settings button persists changes', async ({ page }) => {
        await page.getByRole('button', { name: 'Integrations' }).click();
        await page.getByTestId('gemini-api-key').fill('my-api-key');
        await page.getByRole('button', { name: 'Save Key' }).first().click();
        // Reload and verify key is still there
        await page.reload();
        await page.getByRole('button', { name: 'Integrations' }).click();
        await expect(page.getByTestId('gemini-api-key')).toHaveValue('my-api-key');
    });
});
