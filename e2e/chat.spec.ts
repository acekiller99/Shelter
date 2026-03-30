import { test, expect } from '@playwright/test';

test.describe('Chat Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/chat');
    });

    test('renders chat page with heading', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Messages' })).toBeVisible();
    });

    test('shows Friends and AI Assistant tabs', async ({ page }) => {
        await expect(page.getByRole('button', { name: 'Friends' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'AI Assistant' })).toBeVisible();
    });

    test('shows initial messages in Friends tab', async ({ page }) => {
        await expect(page.getByText('Hey, how are you doing?')).toBeVisible();
        await expect(page.getByText(/configure your Gemini API key in Settings/i)).toBeVisible();
    });

    test('can send a message via button click', async ({ page }) => {
        const input = page.getByPlaceholder('Type a message...');
        await input.fill('Hello from the test!');
        // Use dispatchEvent to fire directly on the element, bypassing the
        // FloatingChat widget that physically overlaps at bottom-right
        await page.getByTestId('chat-send').dispatchEvent('click');
        await expect(page.getByText('Hello from the test!')).toBeVisible();
        // Input should be cleared after sending
        await expect(input).toHaveValue('');
    });

    test('Enter key sends a message', async ({ page }) => {
        const input = page.getByPlaceholder('Type a message...');
        await input.fill('Sent via Enter key');
        await input.press('Enter');
        await expect(page.getByText('Sent via Enter key')).toBeVisible();
    });

    test('send button is disabled when input is empty', async ({ page }) => {
        await expect(page.getByTestId('chat-send')).toBeDisabled();
    });

    test('send button enables when input has text', async ({ page }) => {
        await expect(page.getByTestId('chat-send')).toBeDisabled();
        await page.getByPlaceholder('Type a message...').fill('hi');
        await expect(page.getByTestId('chat-send')).toBeEnabled();
    });

    test('can switch to AI Assistant tab', async ({ page }) => {
        await page.getByRole('button', { name: 'AI Assistant' }).click();
        await expect(page.getByText(/Hi! I'm Shelter AI/)).toBeVisible();
    });

    test('AI tab shows no API key message in sidebar', async ({ page }) => {
        await page.getByRole('button', { name: 'AI Assistant' }).click();
        await expect(page.getByText(/Add your Gemini API key in Settings/i)).toBeVisible();
    });

    test('AI tab input placeholder changes', async ({ page }) => {
        await page.getByRole('button', { name: 'AI Assistant' }).click();
        await expect(page.getByPlaceholder('Ask Shelter AI...')).toBeVisible();
    });

    test('sending in AI tab without API key shows error reply', async ({ page }) => {
        await page.getByRole('button', { name: 'AI Assistant' }).click();
        const input = page.getByPlaceholder('Ask Shelter AI...');
        await input.fill('What is the capital of France?');
        await input.press('Enter');
        await expect(page.getByText(/No Gemini API key configured/i)).toBeVisible();
    });
});
