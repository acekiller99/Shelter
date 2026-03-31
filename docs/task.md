# Shelter — Master Task Checklist

## Phase 1: Foundation & Core UI (Current Focus)

### 1.1 Auth System (Login / Sign Up)
- [x] Auth page skeleton with Sign In / Sign Up toggle
- [x] Form validation (email format, password strength, required fields)
- [x] "Remember me" checkbox & forgot password flow
- [x] OAuth buttons (GitHub) — wired to NextAuth.js
- [x] Session context (logged-in user state across app)
- [x] Protected route middleware (redirect unauthenticated users)
- [ ] Auth API routes (`/api/auth/...`)

### 1.2 Layout & Navigation
- [x] Sidebar with nav items, mobile toggle, animated active tab
- [x] LayoutWrapper with full-screen mode for auth/lobby
- [x] FloatingChat widget (global)
- [x] FloatingLobby PiP widget (global)
- [x] GlobalContext for shared UI state
- [x] Animated page transitions between routes
- [x] Responsive polish (tablet breakpoints, touch gestures)
- [x] Unified color palette (stone + amber across all pages)

### 1.3 Profile Page
- [x] Profile page skeleton (cover photo, avatar, bio, status, gaming stats)
- [x] Edit profile form (name, bio, avatar upload, cover upload)
- [x] Follow / Unfollow button on other users' profiles
- [x] Followers / Following counts and list
- [x] Activity feed on profile (user's posts)

### 1.4 Settings Page
- [x] Settings page skeleton (General, Appearance, Privacy, Notifications, Integrations tabs)
- [x] Theme switcher (dark/light/system) — functional
- [x] API key management (Gemini, OpenAI) — save to localStorage / DB
- [x] Privacy settings (profile visibility, post visibility)
- [x] Notification preferences (email, push, in-app)

---

## Phase 2: Content Features

### 2.1 Social Feed (Home Page)
- [x] Feed skeleton with create-post, like, comment, share buttons
- [x] Search bar placeholder
- [x] UserHoverCard on avatars
- [x] Create post with image upload
- [x] Like / Unlike toggle (optimistic UI)
- [x] Comment thread (expand/collapse)
- [x] Share post (copy link)
- [x] Search functionality (full-text search users & posts)
- [x] Follow system — filter feed to followed users
- [x] Infinite scroll / pagination
- [x] Post deletion (own posts only)

### 2.2 Tools Directory
- [x] Tools page skeleton with search, tag filter, grid cards
- [x] Add Tool form/modal (name, description, URL, author, tags)
- [x] Edit / Delete tool entries
- [x] Category/tag filter sidebar
- [x] Sort by (newest, popular, alphabetical)
- [x] Upvote/downvote or favorite tools

### 2.3 News & Updates
- [x] News page skeleton with featured article, grid layout, category filter
- [x] News article detail page
- [x] Admin: Create/edit/delete news articles
- [ ] RSS feed integration (optional)

---

## Phase 3: Real-Time & Interactive Features

### 3.1 Chat System
- [x] Chat page skeleton (contact list, message area, AI tab)
- [x] FloatingChat quick-chat widget
- [ ] Real-time messaging (Socket.io / WebSocket)
- [x] Chat with AI using user's API key (Gemini/OpenAI)
- [x] Voice recording in chat (MediaRecorder API)
- [x] Message history persistence
- [x] Typing indicators
- [x] Read receipts
- [x] File/image sharing in chat
- [x] Chat notifications (unread badge)

### 3.2 voice Lobby
- [x] Voice lobby page skeleton (participant grid, controls, side chat)
- [x] FloatingLobby minimized PiP
- [ ] WebRTC voice chat (LiveKit or Jitsi integration)
- [x] Screen sharing (getDisplayMedia API)
- [x] Mute/unmute, video on/off controls — functional
- [x] Room creation & join via invite link
- [x] Participant presence indicators
- [x] Push-to-talk option

### 3.3 Timetable & AI Planner
- [x] Timetable page skeleton (day/month view, events, AI study plan panel)
- [x] Create/edit/delete events (modal form)
- [x] Public vs. private event visibility toggle
- [x] Calendar navigation (prev/next day/week/month)
- [x] AI-generated study plans (user API key → Gemini)
- [x] Task/target completion tracking
- [x] Timetable REST/MCP API for external AI access (`/api/timetable` — public GET endpoint)
- [x] Notes & practical questions per target
- [x] Drag-and-drop event rescheduling

---

## Phase 4: Games

### 4.1 Game Center
- [x] Games listing page skeleton (Poker, RPG cards)
- [x] Game room skeleton (player avatars, chat, controls)
- [x] Poker game — full playable implementation (Phaser.js or React-based)
  - [x] Game logic (Texas Hold'em rules)
  - [x] Card rendering & animations
  - [ ] Multiplayer state sync (Colyseus or WebSocket)
  - [x] Betting UI (call, raise, fold, all-in)
  - [ ] Game lobby matchmaking
- [x] Dungeon Crawler RPG (Phase 4+, after Poker validated)
  - [x] Character creation
  - [x] Dungeon generation
  - [x] Combat system
  - [x] Item/equipment drops
  - [ ] Party system (co-op)
- [x] Leaderboards

---

## Phase 5: Backend & Infrastructure

### 5.1 Database Setup
- [x] PostgreSQL schema design (users, posts, tools, events, chat, games) — `prisma/schema.prisma`
- [x] Prisma ORM setup & migrations — Prisma 5, client singleton in `lib/prisma.ts`
- [x] Seed data for development — `prisma/seed.ts` (3 users, posts, tools, events, chat room, game room)

### 5.2 Authentication Backend
- [x] NextAuth.js v4 configuration — `auth.ts` (authOptions, JWT strategy)
- [x] JWT sessions
- [x] OAuth providers (GitHub)
- [x] Password hashing & credential auth (bcryptjs)

### 5.3 API Routes
- [x] `/api/posts` — CRUD for social feed (in-memory scaffold)
- [x] `/api/tools` — CRUD for tools directory (in-memory scaffold)
- [x] `/api/users` — profiles, search, follow (in-memory scaffold)
- [x] `/api/events` — timetable CRUD (in-memory scaffold)
- [x] `/api/chat` — message history (in-memory scaffold)
- [x] `/api/ai` — proxy AI calls with user API key (Gemini server-side proxy)

### 5.4 Real-Time Infrastructure
- [x] Socket.io server setup — custom `server.ts` with `/chat`, `/presence`, `/game` namespaces
- [x] Typed event definitions — `lib/socket-events.ts`
- [x] Browser socket client singletons — `lib/socket-client.ts`
- [ ] WebRTC TURN server (Coturn for voice lobby)
- [ ] Game server (Colyseus for multiplayer games — replaces current Socket.io `/game` namespace)

### 5.5 File Storage
- [ ] MinIO or Cloudflare R2 for avatars, images, voice recordings

---

## Testing & Quality

### Automated Tests
- [x] Set up testing framework (Playwright for E2E, Jest/Vitest for unit)
- [x] Auth flow tests (sign up, sign in, validation, password toggle)
- [x] Feed CRUD tests (create, like, search)
- [x] Tools CRUD tests
- [x] Timetable CRUD tests
- [x] Chat message send/receive tests
- [x] Navigation & routing tests
- [x] Responsive layout tests
- [x] Accessibility tests (keyboard nav, screen reader) — `e2e/accessibility.spec.ts`

### Manual Testing
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive testing
- [ ] UI animation smoothness verification
