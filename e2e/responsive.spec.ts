import { test, expect } from '@playwright/test';

const PAGES = ['/', '/news', '/tools', '/timetable', '/games', '/profile', '/settings', '/chat'];

/* ── Mobile 375×667 ─────────────────────────────────────────────── */
test.describe('Mobile responsive (375px)', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  for (const url of PAGES) {
    test(`${url} has no horizontal overflow`, async ({ page }) => {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
    });
  }

  test('hamburger menu button is visible on mobile', async ({ page }) => {
    await page.goto('/');
    // The mobile toggle has md:hidden; on 375px it renders visibly
    const btn = page.locator('button[class*="md:hidden"]');
    await expect(btn).toBeVisible();
  });

  test('sidebar opens when hamburger is clicked', async ({ page }) => {
    await page.goto('/');
    const btn = page.locator('button[class*="md:hidden"]');
    await btn.click();
    // A nav link should now be visible
    const toolsLink = page.locator('a[href="/tools"]').first();
    await expect(toolsLink).toBeVisible({ timeout: 3000 });
  });

  test('sidebar closes when backdrop is clicked', async ({ page }) => {
    await page.goto('/');
    const btn = page.locator('button[class*="md:hidden"]');
    await btn.click();
    // Backdrop appears
    const backdrop = page.locator('.fixed.inset-0.z-30');
    await expect(backdrop).toBeVisible({ timeout: 3000 });
    await backdrop.click();
    await expect(backdrop).not.toBeVisible({ timeout: 3000 });
  });

  test('news featured image does not overflow viewport', async ({ page }) => {
    await page.goto('/news');
    await page.waitForLoadState('networkidle');
    const img = page.locator('.relative.mb-12').first();
    await expect(img).toBeVisible();
    const box = await img.boundingBox();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(375 + 2);
    }
  });

  test('timetable month calendar shows scrollable container', async ({ page }) => {
    await page.goto('/timetable');
    await page.getByRole('button', { name: 'Month' }).click();
    const scrollContainer = page.locator('.overflow-x-auto').first();
    await expect(scrollContainer).toBeVisible();
  });

  test('tools add modal fits viewport', async ({ page }) => {
    await page.goto('/tools');
    await page.getByRole('button', { name: /add tool/i }).click();
    const modal = page.locator('[class*="max-h-\\[90vh\\]"]');
    await expect(modal).toBeVisible({ timeout: 3000 });
  });

  test('feed post cards visible and not clipped', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const firstPost = page.locator('[class*="rounded-3xl"]').first();
    await expect(firstPost).toBeVisible();
    const box = await firstPost.boundingBox();
    if (box) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(375 + 4);
    }
  });
});

/* ── Tablet 768×1024 ────────────────────────────────────────────── */
test.describe('Tablet responsive (768px)', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  for (const url of PAGES) {
    test(`${url} has no horizontal overflow`, async ({ page }) => {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
    });
  }

  test('sidebar is permanently visible on tablet', async ({ page }) => {
    await page.goto('/');
    // At 768px the sidebar has md:translate-x-0 applied making it visible
    const navLink = page.locator('nav a[href="/"]').first();
    await expect(navLink).toBeVisible();
  });

  test('hamburger is hidden on tablet', async ({ page }) => {
    await page.goto('/');
    const btn = page.locator('button[class*="md:hidden"]');
    // The element exists in DOM but is not visible at >=768px
    await expect(btn).not.toBeVisible();
  });

  test('timetable shows side-by-side layout on tablet', async ({ page }) => {
    await page.goto('/timetable');
    await page.waitForLoadState('networkidle');
    // md:grid-cols-3 should apply — AI panel and calendar share the row
    const grid = page.locator('.grid.grid-cols-1.md\\:grid-cols-3, [class*="md:grid-cols-3"]').first();
    await expect(grid).toBeVisible();
  });
});

/* ── Desktop 1280×800 ───────────────────────────────────────────── */
test.describe('Desktop responsive (1280px)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  for (const url of PAGES) {
    test(`${url} renders without overflow`, async ({ page }) => {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
    });
  }

  test('games leaderboard is visible on desktop', async ({ page }) => {
    await page.goto('/games');
    await expect(page.getByText('Global Leaderboard')).toBeVisible();
  });

  test('lobby side chat is visible on desktop (xl breakpoint)', async ({ page }) => {
    await page.goto('/lobby');
    await expect(page.getByText('Lobby Chat')).toBeVisible();
  });
});
