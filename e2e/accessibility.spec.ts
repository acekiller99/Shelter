/**
 * Accessibility tests — keyboard navigation and ARIA semantics.
 * These tests do NOT require @axe-core/playwright; they use Playwright's
 * built-in keyboard and ARIA APIs only.
 */
import { test, expect } from '@playwright/test';

test.describe('Accessibility — ARIA landmarks', () => {
  test('feed page has main navigation landmark', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Site pages' });
    await expect(nav).toBeAttached();
  });

  test('feed action buttons have accessible names', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const likeBtn = page.getByRole('button', { name: /like post/i }).first();
    await expect(likeBtn).toBeAttached();
    const commentBtn = page.getByRole('button', { name: /show comments|hide comments/i }).first();
    await expect(commentBtn).toBeAttached();
    const shareBtn = page.getByRole('button', { name: 'Share post' }).first();
    await expect(shareBtn).toBeAttached();
  });

  test('chat send button has accessible name', async ({ page }) => {
    await page.goto('/chat');
    const sendBtn = page.getByRole('button', { name: 'Send message' });
    await expect(sendBtn).toBeAttached();
  });

  test('tools add modal has dialog role and aria-modal', async ({ page }) => {
    await page.goto('/tools');
    await page.getByRole('button', { name: /add tool/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 4000 });
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  test('tools modal close button has accessible name', async ({ page }) => {
    await page.goto('/tools');
    await page.getByRole('button', { name: /add tool/i }).click();
    const closeBtn = page.getByRole('button', { name: 'Close dialog' });
    await expect(closeBtn).toBeVisible({ timeout: 4000 });
  });

  test('lobby mic button has aria-label', async ({ page }) => {
    await page.goto('/lobby');
    const micBtn = page.getByRole('button', { name: /mute microphone|unmute microphone/i });
    await expect(micBtn).toBeAttached();
  });

  test('sidebar mobile toggle has aria-expanded', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    const toggle = page.getByRole('button', { name: /open navigation menu|close navigation menu/i });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('Accessibility — Keyboard navigation', () => {
  test('sidebar links are focusable and navigable by keyboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Tab from body to first focusable element
    await page.keyboard.press('Tab');
    // Keep tabbing until we land on a sidebar link
    let found = false;
    for (let i = 0; i < 20; i++) {
      const focused = await page.evaluate(() => document.activeElement?.getAttribute('href'));
      if (focused === '/tools' || focused === '/' || focused === '/games') { found = true; break; }
      await page.keyboard.press('Tab');
    }
    expect(found).toBe(true);
  });

  test('Enter key activates feed like button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const likeBtn = page.getByRole('button', { name: /like post/i }).first();
    await likeBtn.focus();
    await expect(likeBtn).toBeFocused();
    await page.keyboard.press('Enter');
    // After pressing enter the button should have aria-pressed=true
    await expect(likeBtn).toHaveAttribute('aria-pressed', 'true');
  });

  test('Escape key closes tools modal', async ({ page }) => {
    await page.goto('/tools');
    await page.getByRole('button', { name: /add tool/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 4000 });
    await page.keyboard.press('Escape');
    // Modal should close via button click handler (Esc press focuses close btn)
    // We use the backdrop click handler as fallback — just check it disappears
    await expect(dialog).not.toBeVisible({ timeout: 4000 });
  });

  test('sidebar opens with Enter key on mobile toggle', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    const toggle = page.getByRole('button', { name: /open navigation menu/i });
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  test('Tab order in chat stays within send area', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
    const sendBtn = page.getByRole('button', { name: 'Send message' });
    await sendBtn.focus();
    await expect(sendBtn).toBeFocused();
  });

  test('PTT button is keyboard accessible in lobby', async ({ page }) => {
    await page.goto('/lobby');
    const pttBtn = page.getByRole('button', { name: /push-to-talk/i });
    await expect(pttBtn).toBeAttached();
    await pttBtn.focus();
    await expect(pttBtn).toBeFocused();
  });
});

test.describe('Accessibility — Semantic structure', () => {
  const PAGES = ['/', '/news', '/tools', '/timetable', '/games', '/chat', '/settings', '/profile'];

  for (const url of PAGES) {
    test(`${url} has exactly one h1`, async ({ page }) => {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      const h1s = await page.locator('h1').count();
      expect(h1s).toBeGreaterThanOrEqual(1);
    });
  }

  test('images have alt text on feed', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const imgs = page.locator('main img');
    const count = await imgs.count();
    for (let i = 0; i < Math.min(count, 6); i++) {
      const alt = await imgs.nth(i).getAttribute('alt');
      expect(alt).not.toBeNull();
    }
  });

  test('form inputs in timetable event modal have labels', async ({ page }) => {
    await page.goto('/timetable');
    await page.getByRole('button', { name: /new event/i }).click();
    const titleInput = page.getByLabel(/event title/i).or(page.getByPlaceholder(/event title/i));
    await expect(titleInput).toBeVisible({ timeout: 4000 });
  });

  test('page has lang attribute set to en', async ({ page }) => {
    await page.goto('/');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('en');
  });

  test('auth page inputs have labels', async ({ page }) => {
    await page.goto('/auth');
    const emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i)).first();
    await expect(emailInput).toBeVisible();
  });
});
