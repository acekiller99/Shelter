# Shelter — Master Task Checklist

## Phase 1: Foundation & Core UI (Current Focus)

### 1.1 Auth System (Login / Sign Up)
- [x] Auth page skeleton with Sign In / Sign Up toggle
- [ ] Form validation (email format, password strength, required fields)
- [ ] "Remember me" checkbox & forgot password flow
- [ ] OAuth buttons (GitHub) — wired to NextAuth.js
- [ ] Session context (logged-in user state across app)
- [ ] Protected route middleware (redirect unauthenticated users)
- [ ] Auth API routes (`/api/auth/...`)

### 1.2 Layout & Navigation
- [x] Sidebar with nav items, mobile toggle, animated active tab
- [x] LayoutWrapper with full-screen mode for auth/lobby
- [x] FloatingChat widget (global)
- [x] FloatingLobby PiP widget (global)
- [x] GlobalContext for shared UI state
- [ ] Animated page transitions between routes
- [ ] Responsive polish (tablet breakpoints, touch gestures)

### 1.3 Profile Page
- [x] Profile page skeleton (cover photo, avatar, bio, status, gaming stats)
- [ ] Edit profile form (name, bio, avatar upload, cover upload)
- [ ] Follow / Unfollow button on other users' profiles
- [ ] Followers / Following counts and list
- [ ] Activity feed on profile (user's posts)

### 1.4 Settings Page
- [x] Settings page skeleton (General, Appearance, Privacy, Notifications, Integrations tabs)
- [ ] Theme switcher (dark/light/system) — functional
- [ ] API key management (Gemini, OpenAI) — save to localStorage / DB
- [ ] Privacy settings (profile visibility, post visibility)
- [ ] Notification preferences (email, push, in-app)

---

## Phase 2: Content Features

### 2.1 Social Feed (Home Page)
- [x] Feed skeleton with create-post, like, comment, share buttons
- [x] Search bar placeholder
- [x] UserHoverCard on avatars
- [ ] Create post with image upload
- [ ] Like / Unlike toggle (optimistic UI)
- [ ] Comment thread (expand/collapse)
- [ ] Share post (copy link)
- [ ] Search functionality (full-text search users & posts)
- [ ] Follow system — filter feed to followed users
- [ ] Infinite scroll / pagination
- [ ] Post deletion (own posts only)

### 2.2 Tools Directory
- [x] Tools page skeleton with search, tag filter, grid cards
- [ ] Add Tool form/modal (name, description, URL, author, tags)
- [ ] Edit / Delete tool entries
- [ ] Category/tag filter sidebar
- [ ] Sort by (newest, popular, alphabetical)
- [ ] Upvote/downvote or favorite tools

### 2.3 News & Updates
- [x] News page skeleton with featured article, grid layout, category filter
- [ ] News article detail page
- [ ] Admin: Create/edit/delete news articles
- [ ] RSS feed integration (optional)

---

## Phase 3: Real-Time & Interactive Features

### 3.1 Chat System
- [x] Chat page skeleton (contact list, message area, AI tab)
- [x] FloatingChat quick-chat widget
- [ ] Real-time messaging (Socket.io / WebSocket)
- [ ] Chat with AI using user's API key (Gemini/OpenAI)
- [ ] Voice recording in chat (MediaRecorder API)
- [ ] Message history persistence
- [ ] Typing indicators
- [ ] Read receipts
- [ ] File/image sharing in chat
- [ ] Chat notifications (unread badge)

### 3.2 voice Lobby
- [x] Voice lobby page skeleton (participant grid, controls, side chat)
- [x] FloatingLobby minimized PiP
- [ ] WebRTC voice chat (LiveKit or Jitsi integration)
- [ ] Screen sharing (getDisplayMedia API)
- [ ] Mute/unmute, video on/off controls — functional
- [ ] Room creation & join via invite link
- [ ] Participant presence indicators
- [ ] Push-to-talk option

### 3.3 Timetable & AI Planner
- [x] Timetable page skeleton (day/month view, events, AI study plan panel)
- [ ] Create/edit/delete events (modal form)
- [ ] Public vs. private event visibility toggle
- [ ] Calendar navigation (prev/next day/week/month)
- [ ] AI-generated study plans (user API key → Gemini)
- [ ] Task/target completion tracking
- [ ] Timetable REST/MCP API for external AI access
- [ ] Notes & practical questions per target
- [ ] Drag-and-drop event rescheduling

---

## Phase 4: Games

### 4.1 Game Center
- [x] Games listing page skeleton (Poker, RPG cards)
- [x] Game room skeleton (player avatars, chat, controls)
- [ ] Poker game — full playable implementation (Phaser.js or React-based)
  - [ ] Game logic (Texas Hold'em rules)
  - [ ] Card rendering & animations
  - [ ] Multiplayer state sync (Colyseus or WebSocket)
  - [ ] Betting UI (call, raise, fold, all-in)
  - [ ] Game lobby matchmaking
- [ ] Dungeon Crawler RPG (Phase 4+, after Poker validated)
  - [ ] Character creation
  - [ ] Dungeon generation
  - [ ] Combat system
  - [ ] Item/equipment drops
  - [ ] Party system (co-op)
- [ ] Leaderboards

---

## Phase 5: Backend & Infrastructure

### 5.1 Database Setup
- [ ] PostgreSQL schema design (users, posts, tools, events, chat, games)
- [ ] Prisma ORM setup & migrations
- [ ] Seed data for development

### 5.2 Authentication Backend
- [ ] NextAuth.js / Auth.js configuration
- [ ] JWT sessions
- [ ] OAuth providers (GitHub)
- [ ] Password hashing & credential auth

### 5.3 API Routes
- [ ] `/api/posts` — CRUD for social feed
- [ ] `/api/tools` — CRUD for tools directory
- [ ] `/api/users` — profiles, search, follow
- [ ] `/api/events` — timetable CRUD
- [ ] `/api/chat` — message history
- [ ] `/api/ai` — proxy AI calls with user API key

### 5.4 Real-Time Infrastructure
- [ ] Socket.io server setup (chat, presence)
- [ ] WebRTC TURN server (Coturn for voice lobby)
- [ ] Game server (Colyseus for multiplayer games)

### 5.5 File Storage
- [ ] MinIO or Cloudflare R2 for avatars, images, voice recordings

---

## Testing & Quality

### Automated Tests
- [ ] Set up testing framework (Playwright for E2E, Jest/Vitest for unit)
- [ ] Auth flow tests (sign up, sign in, sign out, protected routes)
- [ ] Feed CRUD tests (create, like, comment, delete post)
- [ ] Tools CRUD tests
- [ ] Timetable CRUD tests
- [ ] Chat message send/receive tests
- [ ] Navigation & routing tests
- [ ] Responsive layout tests
- [ ] Accessibility tests (keyboard nav, screen reader)

### Manual Testing
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive testing
- [ ] UI animation smoothness verification
