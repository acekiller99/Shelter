# Shelter — Implementation Plan

## Project Overview

**Shelter** is a personal portal web app combining a tools directory, social feed, web-based multiplayer games, AI + user chat, voice lobby, and a smart timetable planner — all with a rich animated dark UI.

### Current State

The project has a solid UI skeleton built with:
- **Next.js 15** (App Router, TypeScript)
- **TailwindCSS v4** + `tw-animate-css`
- **Framer Motion** (`motion/react`) for animations
- **Lucide React** icons
- **Google Fonts** (Inter + Space Grotesk)
- **@google/genai** SDK (Gemini AI, already a dependency)

10 skeleton route pages exist with mock data and no backend:

| Page | Status | What exists |
|------|--------|-------------|
| `/auth` | Skeleton | Login/signup form, GitHub OAuth button, animated transitions |
| `/` (Feed) | Skeleton | Post creation, mock posts, search bar, UserHoverCard |
| `/tools` | Skeleton | Tool cards grid, search, "Add Tool" button |
| `/chat` | Skeleton | Contact list, Friends/AI tabs, message area, mic button |
| `/games` | Skeleton | Game cards (Poker, RPG), play/coming-soon buttons |
| `/games/[id]` | Skeleton | Game room with player seats, waiting state, chat sidebar |
| `/timetable` | Skeleton | Day/month views, events timeline, AI study plan panel |
| `/lobby` | Skeleton | Voice lobby grid, controls, screen share, side chat |
| `/profile` | Skeleton | Cover/avatar, bio, status picker, gaming stats |
| `/settings` | Skeleton | Tabs (General, Appearance, Privacy, Notifications, Integrations) |
| `/news` | Skeleton | Featured article, category filter, news grid |

6 shared components: `Sidebar`, `FloatingChat`, `FloatingLobby`, `GlobalContext`, `LayoutWrapper`, `UserHoverCard`

---

## Tech Stack Assessment

The AI-recommended stack is mostly solid. Here's my validation:

| Component | Recommendation | Assessment |
|-----------|---------------|------------|
| Frontend | Next.js 14+ | ✅ Already using Next.js 15 |
| Styling | TailwindCSS + Framer Motion | ✅ Already using both |
| Games | Phaser.js + Colyseus | ✅ Good choice, add later in Phase 4 |
| Backend API | Node.js + NestJS | ⚠️ **Use Next.js API Routes instead** — simpler, no separate server needed |
| Multiplayer | Colyseus | ✅ Free, MIT license, good for poker/RPG |
| Real-time Chat | Socket.io | ✅ Free, well-supported |
| Database | PostgreSQL + Prisma | ✅ Free with Supabase/Neon |
| Cache | Redis | ⚠️ **Skip initially** — add only when needed for scale |
| Auth | NextAuth.js / Auth.js | ✅ Free, supports JWT + OAuth |
| Voice/Video | LiveKit | ✅ Free to self-host |
| Calendar | FullCalendar.js | ✅ Free, feature-rich |
| File Storage | MinIO / Cloudflare R2 | ✅ Free tier available |

### Cost Summary

| Service | Cost | Notes |
|---------|------|-------|
| Vercel (frontend hosting) | **Free** | Free tier, 100GB bandwidth |
| Supabase (PostgreSQL) | **Free** | Free tier, 500MB DB |
| Cloudflare R2 (storage) | **Free** | Free 10GB/month |
| AI API (Gemini/OpenAI) | **$0 to you** | Users bring their own API key |
| Domain name | **~$10-15/year** | Only paid item for MVP |
| VPS for game/voice servers | **$5-10/month** | Needed at scale, Railway free tier initially |

---

## Proposed Changes — Phase 1 Start

Since this is a massive project, we'll work incrementally. **Phase 1 focuses on:**

1. **Auth — form validation & functional UX** (no real backend yet, but proper client-side validation)
2. **UI consistency & polish** (standardize colors, fix theme inconsistencies between pages)
3. **Testing infrastructure** (Playwright setup + initial E2E tests)
4. **Search bar functionality** on Feed page (client-side filtering)

---

### Auth Improvements

#### [MODIFY] [page.tsx](file:///c:/Users/User/source/repos/Shelter/app/auth/page.tsx)

- Add client-side form validation:
  - Email format validation with regex
  - Password minimum length (8 chars), show strength indicator
  - Username validation (sign-up only): 3-20 chars, alphanumeric + underscores
  - Show inline error messages with animated appearance
- Add "Remember me" checkbox on login
- Add password visibility toggle (eye icon)
- Add confirm password field on sign-up
- Keep the current dark theme and animations
- Maintain the current `Link` to `/` as a temporary navigation (real auth flow comes with NextAuth in Phase 5)

---

### Feed — Client-Side Search

#### [MODIFY] [page.tsx](file:///c:/Users/User/source/repos/Shelter/app/page.tsx)

- Wire the search bar to filter posts by content and author name
- Add animated empty state when no results match
- Add basic like toggle (client-side state)

---

### UI Consistency Pass

#### [MODIFY] [globals.css](file:///c:/Users/User/source/repos/Shelter/app/globals.css)

- Add CSS custom properties for the design system colors (`--color-primary`, `--color-accent`, etc.)
- Add keyframe for the sidebar gradient animation (`animate-gradient`)
- Standardize scrollbar colors

> [!NOTE]
> Currently the auth/chat/feed pages use `bg-[#0B0F19]` (slate) while the layout body uses `bg-[#0c0a09]` (stone). The sidebar and games use warm stone tones. We should unify to the **stone** palette project-wide to match the "Shelter" brand (warm, cozy, campfire theme with amber/orange accents).

#### [MODIFY] [page.tsx](file:///c:/Users/User/source/repos/Shelter/app/auth/page.tsx)
- Update background from `bg-[#0B0F19]` to `bg-[#0c0a09]` (stone-950)
- Update card/input colors from slate to stone palette

#### [MODIFY] [page.tsx](file:///c:/Users/User/source/repos/Shelter/app/chat/page.tsx)
- Update background from `bg-[#0B0F19]` to `bg-[#0c0a09]`
- Update colors from slate to stone palette

#### [MODIFY] [page.tsx](file:///c:/Users/User/source/repos/Shelter/app/lobby/page.tsx)
- Update background and component colors from slate to stone

#### [MODIFY] [FloatingChat.tsx](file:///c:/Users/User/source/repos/Shelter/components/FloatingChat.tsx)
- Update colors from slate to stone

---

### Testing Setup

#### [NEW] [playwright.config.ts](file:///c:/Users/User/source/repos/Shelter/playwright.config.ts)
- Configure Playwright for E2E testing
- Set base URL to `http://localhost:3000`
- Configure browsers (Chromium, Firefox)
- Screenshot on failure

#### [NEW] [auth.spec.ts](file:///c:/Users/User/source/repos/Shelter/e2e/auth.spec.ts)
- Test login form renders with email/password fields
- Test signup form shows additional fields when toggled
- Test form validation shows error on empty submit
- Test form validation shows error on invalid email
- Test navigation from auth to feed

#### [NEW] [navigation.spec.ts](file:///c:/Users/User/source/repos/Shelter/e2e/navigation.spec.ts)
- Test all sidebar links navigate to correct pages
- Test sidebar active state highlights correctly
- Test mobile menu toggle works
- Test page titles render correctly

#### [NEW] [feed.spec.ts](file:///c:/Users/User/source/repos/Shelter/e2e/feed.spec.ts)
- Test feed page loads with mock posts
- Test create post adds to feed
- Test search filters posts
- Test like button toggles

---

## User Review Required

> [!IMPORTANT]
> **Color theme decision**: The skeleton currently mixes two color palettes:
> - **Slate** (`#0B0F19`, cold blue-gray) — used in auth, chat, feed, lobby, FloatingChat
> - **Stone** (`#0c0a09`, warm gray-brown) — used in layout body, sidebar, games, profile, settings
>
> I recommend **unifying to stone** since the "Shelter" brand suggests warmth, and the sidebar/games already use it. This will require updating ~6 files. **Do you agree with stone as the unified palette, or would you prefer slate?**

> [!IMPORTANT]
> **Framework confirmation**: The AI recommendation suggests NestJS for backend, but since you're already on Next.js 15, I recommend using **Next.js API Routes** instead. This keeps everything in one project and avoids running a separate backend server. The only exception would be the game server (Colyseus), which does need its own process. **Do you agree with this approach?**

> [!NOTE]
> **News page**: This wasn't in your original requirements. It was added in the skeleton. Do you want to keep it, or should we remove it and focus on the core features?

---

## Verification Plan

### Automated Tests (Playwright E2E)

After installing Playwright and implementing Phase 1 changes:

```bash
# Install Playwright
npm install -D @playwright/test
npx playwright install

# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test e2e/auth.spec.ts

# Run with UI mode for debugging
npx playwright test --ui
```

**Test coverage for Phase 1:**
1. **Auth page** — form renders, validation works, toggle between login/signup
2. **Navigation** — all sidebar links work, active state correct
3. **Feed** — posts render, create post works, search filters posts

### Manual Verification
- After implementation, I'll use the browser tool to visually verify:
  1. Auth page form validation with various inputs
  2. Color consistency across all pages
  3. Animations are smooth and not broken
  4. Responsive layout on mobile viewport
