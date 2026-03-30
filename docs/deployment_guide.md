# Shelter — Local Development & Deployment Guide

## Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

> **Note:** No `.env` file is required to run the app. The Gemini API key is
> entered at runtime via **Settings → Integrations** and saved to localStorage.

---

## Run Automated Tests

The test suite uses [Playwright](https://playwright.dev/) for E2E testing.
The dev server must be running on port 3000 before you start the tests.

```bash
# Terminal 1 — start the dev server
npm run dev

# Terminal 2 — run all tests
npx playwright test

# Run with visible output (list format, no HTML report)
npx playwright test --reporter=list

# Run a single spec file
npx playwright test e2e/chat.spec.ts

# First-time only: install the Chromium browser if not already present
npx playwright install chromium
```

The test results are saved to `playwright-report/index.html`. Open it with:

```bash
npx playwright show-report
```

### What's tested

| Spec file | Tests | Covers |
|-----------|-------|--------|
| `auth.spec.ts` | 9 | Login/signup forms, validation, OAuth button |
| `chat.spec.ts` | 11 | Send messages, AI tab, disabled state |
| `feed.spec.ts` | 7 | Posts, likes, search, comments |
| `navigation.spec.ts` | 3 | Sidebar links, active highlight, page titles |
| `settings.spec.ts` | 11 | Tabs, theme, privacy, notifications, API key |
| `timetable.spec.ts` | 11 | CRUD events, navigation, month view |
| `tools.spec.ts` | 8 | Search, filter, sort, add/delete, upvote |
| **Total** | **60** | |

---

## Testing with Friends (Free, No Deployment)

### Option 1: Cloudflare Tunnel ⭐ Recommended

Exposes your local dev server to the internet. Your PC acts as the server.

```bash
# Install once
npm install -g cloudflared

# Start tunnel (run AFTER npm run dev)
npx cloudflared tunnel --url http://localhost:3000
```

Share the generated URL (e.g. `https://abc-xyz.trycloudflare.com`) with friends.

### Option 2: ngrok

```bash
npx ngrok http 3000
```

**Limitations (both):**
- Your PC must stay on while testing
- URL changes each restart
- Latency depends on your upload speed

---

## Deployment (Free Tiers)

| Service | Use Case | Free Tier |
|---------|----------|-----------|
| **Vercel** | Frontend + API routes | Unlimited deploys, 100GB bandwidth |
| **Railway** | Game server (Colyseus), WebSocket | $5/month credit |
| **Render** | Backend services | Free with cold starts |
| **Fly.io** | LiveKit / game servers | 3 free shared VMs |
| **Supabase** | PostgreSQL database | 500MB free |
| **Cloudflare R2** | File/media storage | 10GB/month free |

### Deploy to Vercel

```bash
# One-time setup
npm install -g vercel

# Deploy
vercel
```

### Recommended Phased Deployment

| Phase | Strategy |
|-------|----------|
| Phase 1-3 (UI, Feed, Chat) | Cloudflare Tunnel for testing, Vercel for staging |
| Phase 4 (Games) | Vercel (frontend) + Railway (Colyseus game server) |
| Phase 5 (Voice) | Add Fly.io for LiveKit |
| Production | $5-10/month VPS (Hetzner/DigitalOcean) for always-on |

---

## Costs Summary

| Item | Cost |
|------|------|
| Domain name | ~$10-15/year |
| AI API (Gemini/OpenAI) | $0 (users bring own key) |
| Hosting (free tiers) | $0 |
| VPS (optional, at scale) | $5-10/month |
