import { test, expect } from '@playwright/test';

test.describe('Timetable Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/timetable');
    });

    test('renders timetable page with heading', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Timetable & Targets' })).toBeVisible();
    });

    test('shows day/month view toggle and New Event button', async ({ page }) => {
        await expect(page.getByRole('button', { name: 'day' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'month' })).toBeVisible();
        await expect(page.getByRole('button', { name: /new event/i })).toBeVisible();
    });

    test('New Event button opens modal', async ({ page }) => {
        await page.getByRole('button', { name: /new event/i }).click();
        await expect(page.getByRole('heading', { name: 'New Event' })).toBeVisible();
    });

    test('create event modal closes on cancel', async ({ page }) => {
        await page.getByRole('button', { name: /new event/i }).click();
        await expect(page.getByRole('heading', { name: 'New Event' })).toBeVisible();
        await page.getByRole('button', { name: 'Cancel' }).click();
        await expect(page.getByRole('heading', { name: 'New Event' })).not.toBeVisible();
    });

    test('create event form validation shows error on empty submit', async ({ page }) => {
        await page.getByRole('button', { name: /new event/i }).click();
        // Submit button says 'Create' inside modal
        await page.getByRole('button', { name: 'Create' }).click();
        await expect(page.getByText(/required/i)).toBeVisible();
    });

    test('can create a new event', async ({ page }) => {
        await page.getByRole('button', { name: /new event/i }).click();
        await page.getByPlaceholder('Event or task title').fill('My Test Event');
        await page.getByPlaceholder('e.g. 10:00 AM - 12:00 PM').fill('10:00 - 11:00');
        await page.getByRole('button', { name: 'Create' }).click();
        // Event appears in day view (not in AI Study Plan heading)
        await expect(page.locator('div').filter({ hasText: /^My Test Event$/ }).first()).toBeVisible();
    });

    test('can delete an event', async ({ page }) => {
        // Delete an existing event (Learn Python Basics, id=1)
        await expect(page.locator('div').filter({ hasText: /^Learn Python Basics$/ }).first()).toBeVisible();
        await page.getByTestId('event-delete-1').click();
        await expect(page.locator('div').filter({ hasText: /^Learn Python Basics$/ })).toHaveCount(0);
    });

    test('can edit an event', async ({ page }) => {
        // Edit 'Team Meeting' (id=2)
        await page.getByTestId('event-edit-2').click();
        // Change title
        const titleInput = page.getByPlaceholder('Event or task title');
        await titleInput.clear();
        await titleInput.fill('Team Stand-up');
        await page.getByRole('button', { name: 'Save' }).click();
        await expect(page.locator('div').filter({ hasText: /^Team Stand-up$/ }).first()).toBeVisible();
        await expect(page.locator('div').filter({ hasText: /^Team Meeting$/ })).toHaveCount(0);
    });

    test('prev/next navigation changes displayed date', async ({ page }) => {
        const dateHeading = page.locator('h2').nth(0);
        const initialDate = await dateHeading.textContent();
        // Click the right (next) navigation arrow
        await page.getByTestId('timetable-next').click();
        const afterNav = await dateHeading.textContent();
        expect(afterNav).not.toBe(initialDate);
    });

    test('can switch to month view', async ({ page }) => {
        await page.getByRole('button', { name: 'month' }).click();
        // Month view shows day-of-week headers
        await expect(page.getByText('Sun', { exact: true })).toBeVisible();
        await expect(page.getByText('Mon', { exact: true })).toBeVisible();
    });

    test('Today link appears after navigating away', async ({ page }) => {
        // Navigate to next day
        await page.getByTestId('timetable-next').click();
        // Go to Today link should appear
        await expect(page.getByText('Go to Today')).toBeVisible();
        await page.getByText('Go to Today').click();
        await expect(page.getByText('Go to Today')).not.toBeVisible();
    });
});
