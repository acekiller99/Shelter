import { test, expect } from '@playwright/test';

test.describe('Auth Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/auth');
    });

    test('renders login form by default', async ({ page }) => {
        await expect(page.getByText('Shelter')).toBeVisible();
        await expect(page.getByPlaceholder('Email Address')).toBeVisible();
        await expect(page.getByPlaceholder('Password')).toBeVisible();
        await expect(page.getByText('Remember me')).toBeVisible();
        await expect(page.getByText('Forgot password?')).toBeVisible();
        // Use the submit button specifically to avoid matching the tab button
        await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('switches to signup form when Sign Up tab is clicked', async ({ page }) => {
        // Click the Sign Up tab (first button with name matching, not the submit button)
        await page.getByRole('button', { name: 'Sign Up' }).click();
        await expect(page.getByPlaceholder('Full Name')).toBeVisible();
        await expect(page.getByPlaceholder('Confirm Password')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toContainText('Create Account');
    });

    test('shows validation error on empty submit (login)', async ({ page }) => {
        await page.locator('button[type="submit"]').click();
        await expect(page.getByText('Email is required')).toBeVisible();
        await expect(page.getByText('Password is required')).toBeVisible();
    });

    test('shows validation error for invalid email', async ({ page }) => {
        await page.getByPlaceholder('Email Address').fill('notanemail');
        await page.getByPlaceholder('Email Address').blur();
        await expect(page.getByText('Please enter a valid email')).toBeVisible();
    });

    test('shows validation error for short password', async ({ page }) => {
        await page.getByPlaceholder('Password').fill('123');
        await page.getByPlaceholder('Password').blur();
        await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();
    });

    test('shows password strength indicator (signup)', async ({ page }) => {
        await page.getByRole('button', { name: 'Sign Up' }).click();
        // Use exact: true to only match the Password field, not Confirm Password
        await page.getByPlaceholder('Password', { exact: true }).fill('MyStr0ng!Pass');
        await expect(page.getByText(/strong/i)).toBeVisible();
    });

    test('shows mismatch error on confirm password (signup)', async ({ page }) => {
        await page.getByRole('button', { name: 'Sign Up' }).click();
        await page.getByPlaceholder('Password', { exact: true }).fill('MyPassword123');
        await page.getByPlaceholder('Confirm Password').fill('DifferentPass');
        await page.getByPlaceholder('Confirm Password').blur();
        await expect(page.getByText('Passwords do not match')).toBeVisible();
    });

    test('toggles password visibility', async ({ page }) => {
        const passwordInput = page.getByPlaceholder('Password');
        await expect(passwordInput).toHaveAttribute('type', 'password');
        // The eye toggle button is inside the password field's parent div
        await passwordInput.locator('..').locator('button').click();
        await expect(passwordInput).toHaveAttribute('type', 'text');
    });

    test('GitHub OAuth button is present', async ({ page }) => {
        await expect(page.getByRole('button', { name: /github/i })).toBeVisible();
    });
});
