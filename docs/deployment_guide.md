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

---

## Infrastructure Setup Guide

Follow these sections in order. Each one is independent — do only what you need.

---

### 1. PostgreSQL Database (Supabase — Free)

Supabase gives you a free hosted PostgreSQL instance with 500 MB storage.

**Steps:**

1. Go to [https://supabase.com](https://supabase.com) → **Start your project** → sign in with GitHub
2. Click **New Project**, fill in name (`shelter`), strong database password, select a region close to you
3. Wait ~2 minutes for the project to spin up
4. Go to **Project Settings → Database → Connection string → URI**
5. Copy the URI — it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
   ```
6. Create a `.env` file in the project root (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
7. Paste the URI as `DATABASE_URL` in `.env`
8. Run migrations and seed:
   ```bash
   npx prisma migrate dev --name init
   npm run db:seed
   ```
9. Verify in Supabase dashboard → **Table Editor** — you should see all tables populated

> **Tip:** Supabase also has a free connection pooler (PgBouncer) at port 6543 — use that URL for production to avoid exhausting connections.

---

### 2. Authentication (NextAuth + GitHub OAuth)

**Generate AUTH_SECRET:**
```bash
# Run this and copy the output into .env as AUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Create GitHub OAuth App:**

1. Go to [https://github.com/settings/developers](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name:** Shelter
   - **Homepage URL:** `http://localhost:3000` (change for production)
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
4. Click **Register application**
5. Copy **Client ID** and generate a **Client Secret**
6. Add to `.env`:
   ```env
   GITHUB_CLIENT_ID=your_client_id_here
   GITHUB_CLIENT_SECRET=your_client_secret_here
   AUTH_SECRET=your_generated_secret_here
   ```

**Enable credential auth (wiring):**

The credential sign-in flow in `app/auth/page.tsx` currently uses localStorage simulation. To switch to real DB auth, update the sign-in handler to call `signIn('credentials', { email, password, redirect: false })` from `next-auth/react`. The `authOptions` in `auth.ts` already handles the `bcrypt.compare` check against the database.

---

### 3. Real-Time Chat (Socket.io — already implemented)

The Socket.io server is built into `server.ts` and **already works in local dev**.

**To run with Socket.io instead of plain `next dev`:**
```bash
# This starts Next.js + Socket.io together on port 3000
npm run dev
```

**To wire the Chat page UI to sockets**, the client helpers are ready at `lib/socket-client.ts`. The chat page currently uses in-memory state — connect it like this in `app/chat/page.tsx`:

```ts
import { getChatSocket } from '@/lib/socket-client';

// On mount:
const socket = getChatSocket();
socket.connect();
socket.emit('join_room', { roomId: 'room-general', userId: currentUser.id });
socket.on('message', (msg) => setMessages(prev => [...prev, msg]));

// On send:
socket.emit('message', { roomId, authorId, authorName, authorAvatar, content, type: 'TEXT' });

// On unmount:
socket.off('message');
socket.emit('leave_room', roomId);
```

**Deploy Socket.io to Railway (free $5 credit):**

1. Go to [https://railway.app](https://railway.app) → sign in with GitHub
2. **New Project → Deploy from GitHub repo** → select your Shelter repo
3. Set start command to: `npm start`
4. Add all `.env` variables in Railway's **Variables** panel
5. Railway auto-assigns a domain — update `NEXT_PUBLIC_APP_URL` to that domain

---

### 4. File Storage — Avatars & Images (Cloudflare R2 — Free)

Cloudflare R2 gives 10 GB/month free with no egress fees.

**Steps:**

1. Go to [https://dash.cloudflare.com](https://dash.cloudflare.com) → **R2 Object Storage → Create bucket**
2. Name it `shelter-media`, choose a region
3. Go to **R2 → Manage R2 API tokens → Create API Token** with **Edit** permissions
4. Copy the `Access Key ID`, `Secret Access Key`, and your `Account ID`
5. Add to `.env`:
   ```env
   R2_ACCOUNT_ID=your_cloudflare_account_id
   R2_ACCESS_KEY_ID=your_r2_access_key
   R2_SECRET_ACCESS_KEY=your_r2_secret_key
   R2_BUCKET_NAME=shelter-media
   R2_PUBLIC_URL=https://pub-xxxxxxxx.r2.dev   # from R2 bucket public access settings
   ```
6. Install the AWS S3 SDK (R2 is S3-compatible):
   ```bash
   npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
   ```
7. Create `lib/r2.ts`:
   ```ts
   import { S3Client } from '@aws-sdk/client-s3';
   export const r2 = new S3Client({
     region: 'auto',
     endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
     credentials: {
       accessKeyId: process.env.R2_ACCESS_KEY_ID!,
       secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
     },
   });
   ```
8. In your API route for avatar upload, replace the base64/localStorage approach with a `PutObjectCommand` to R2 and return the public URL

---

### 5. Voice Lobby — WebRTC (LiveKit Cloud — Free Tier)

LiveKit is the easiest managed WebRTC service with a free tier (100 concurrent participants).

**Steps:**

1. Go to [https://livekit.io](https://livekit.io) → **Sign up → Create a project**
2. Copy **API Key**, **API Secret**, and **WebSocket URL** (e.g. `wss://yourproject.livekit.cloud`)
3. Add to `.env`:
   ```env
   LIVEKIT_API_KEY=your_api_key
   LIVEKIT_API_SECRET=your_api_secret
   NEXT_PUBLIC_LIVEKIT_URL=wss://yourproject.livekit.cloud
   ```
4. Install the LiveKit SDK:
   ```bash
   npm install livekit-client @livekit/components-react
   ```
5. Create a token API route at `app/api/livekit-token/route.ts`:
   ```ts
   import { AccessToken } from 'livekit-server-sdk';
   import { NextRequest, NextResponse } from 'next/server';

   export async function GET(req: NextRequest) {
     const room = req.nextUrl.searchParams.get('room');
     const userId = req.nextUrl.searchParams.get('userId');
     const name = req.nextUrl.searchParams.get('name') ?? userId;
     if (!room || !userId) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

     const at = new AccessToken(process.env.LIVEKIT_API_KEY!, process.env.LIVEKIT_API_SECRET!, {
       identity: userId, name,
     });
     at.addGrant({ roomJoin: true, room, canPublish: true, canSubscribe: true });
     return NextResponse.json({ token: await at.toJwt() });
   }
   ```
6. In `app/lobby/page.tsx`, replace the mock participant grid with:
   ```tsx
   import { LiveKitRoom, VideoConference } from '@livekit/components-react';
   // ...
   <LiveKitRoom token={token} serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}>
     <VideoConference />
   </LiveKitRoom>
   ```

---

### 6. Multiplayer Games (Colyseus — Free Self-Host)

Colyseus is an open-source multiplayer game server. You can self-host it free on Railway or Fly.io.

**Steps (local first):**

1. Install Colyseus in a **separate** folder (keep it separate from Next.js):
   ```bash
   mkdir shelter-game-server && cd shelter-game-server
   npm create colyseus-app@latest .
   ```
2. Create a room for Poker (`src/rooms/PokerRoom.ts`):
   ```ts
   import { Room, Client } from '@colyseus/core';
   export class PokerRoom extends Room {
     onCreate() { this.setState({ phase: 'idle', pot: 0, players: {} }); }
     onJoin(client: Client, options: { name: string }) {
       this.state.players[client.sessionId] = { name: options.name, chips: 1000 };
     }
     onMessage(client: Client, message: { action: string; amount?: number }) {
       // Handle bet/fold/call — broadcast updated state
       this.broadcast('state', this.state);
     }
     onLeave(client: Client) { delete this.state.players[client.sessionId]; }
   }
   ```
3. Register the room in `src/app.config.ts` and start: `npm start`
4. In `app/games/[id]/page.tsx`, replace the local game engine with a Colyseus client connection:
   ```ts
   import * as Colyseus from 'colyseus.js';
   const client = new Colyseus.Client('ws://localhost:2567');
   const room = await client.joinOrCreate('poker', { name: currentUser.name });
   room.onStateChange((state) => setGameState(state));
   room.send('action', { action: 'bet', amount: 100 });
   ```
5. **Deploy game server to Railway:**
   - New project → Deploy from folder → set start command `npm start`
   - Default port is `2567` — Railway exposes it automatically
   - Update the client connection URL to your Railway domain

---

### 7. Final .env Checklist

Before going to production, ensure all of these are set in your `.env`:

```env
# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
APP_URL=https://yourdomain.com
PORT=3000

# Database (Supabase)
DATABASE_URL=postgresql://postgres:PASSWORD@db.XXX.supabase.co:5432/postgres

# Auth
AUTH_SECRET=your_random_base64_secret
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx

# AI
GEMINI_API_KEY=xxx   # optional — users can enter their own in Settings

# File Storage (Cloudflare R2)
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=shelter-media
R2_PUBLIC_URL=https://pub-xxx.r2.dev

# Voice (LiveKit)
LIVEKIT_API_KEY=xxx
LIVEKIT_API_SECRET=xxx
NEXT_PUBLIC_LIVEKIT_URL=wss://yourproject.livekit.cloud

# Game Server (Colyseus on Railway)
NEXT_PUBLIC_GAME_SERVER_URL=wss://your-game-server.railway.app
```

Update the GitHub OAuth callback URL to `https://yourdomain.com/api/auth/callback/github` when going live.
