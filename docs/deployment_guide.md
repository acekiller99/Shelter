# Shelter — Local Development & Deployment Guide

## Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local with your API key
cp .env.example .env.local
# Edit .env.local and set GEMINI_API_KEY

# 3. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

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
