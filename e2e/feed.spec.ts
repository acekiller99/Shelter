import { test, expect } from '@playwright/test';

test.describe('Feed Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('renders feed with mock posts', async ({ page }) => {
        await expect(page.getByText('Alex Chen')).toBeVisible();
        await expect(page.getByText('Sarah Miller')).toBeVisible();
        await expect(page.getByText('David Kim')).toBeVisible();
    });

    test('create post adds to feed', async ({ page }) => {
        const postText = 'This is a test post from Playwright!';
        await page.getByPlaceholder("What's on your mind?").fill(postText);
        await page.getByRole('button', { name: /post/i }).click();
        await expect(page.getByText(postText)).toBeVisible();
        await expect(page.getByText('Just now')).toBeVisible();
    });

    test('search filters posts by content', async ({ page }) => {
        await page.getByPlaceholder('Search users or posts...').fill('poker');
        // Sarah's poker post should be visible
        await expect(page.getByText('Sarah Miller')).toBeVisible();
        // Other posts should NOT be visible
        await expect(page.getByText('Alex Chen')).not.toBeVisible();
        await expect(page.getByText('David Kim')).not.toBeVisible();
    });

    test('search filters posts by author name', async ({ page }) => {
        await page.getByPlaceholder('Search users or posts...').fill('david');
        await expect(page.getByText('David Kim')).toBeVisible();
        await expect(page.getByText('Alex Chen')).not.toBeVisible();
    });

    test('shows empty state when no results', async ({ page }) => {
        await page.getByPlaceholder('Search users or posts...').fill('xyznonexistent');
        await expect(page.getByText('No results found')).toBeVisible();
    });

    test('clear search restores all posts', async ({ page }) => {
        await page.getByPlaceholder('Search users or posts...').fill('poker');
        await expect(page.getByText('Alex Chen')).not.toBeVisible();
        // Clear the search
        await page.getByPlaceholder('Search users or posts...').fill('');
        await expect(page.getByText('Alex Chen')).toBeVisible();
        await expect(page.getByText('Sarah Miller')).toBeVisible();
    });

    test('like button toggles', async ({ page }) => {
        // Find the first post's like button and get initial count
        const firstPost = page.locator('[class*="rounded-3xl"]').filter({ hasText: 'Alex Chen' }).first();
        const likeBtn = firstPost.locator('button').filter({ hasText: /^\d+$/ }).first();
        const initialCount = parseInt((await likeBtn.textContent() || '0').trim());
        await likeBtn.click();
        // After clicking, count should increment by 1
        await expect(likeBtn).toContainText(String(initialCount + 1));
    });

    test('post button is disabled when textarea is empty', async ({ page }) => {
        const postButton = page.getByRole('button', { name: /post/i });
        await expect(postButton).toBeDisabled();
    });
});
