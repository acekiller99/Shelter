/**
 * Prisma seed — populates the database with development data.
 * Run: npx prisma db seed
 *
 * Mirrors the in-memory store data from lib/api/store.ts.
 */

import { PrismaClient, EventType, GameType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ── Users ───────────────────────────────────────────────
  const password = await bcrypt.hash('shelter123', 12);

  const alex = await prisma.user.upsert({
    where: { email: 'alex@shelter.app' },
    update: {},
    create: {
      id: 'u1',
      name: 'Alex Chen',
      username: 'alex',
      email: 'alex@shelter.app',
      password,
      image: 'https://picsum.photos/seed/alex/100/100',
      bio: 'Software engineer & gamer. Building things at Shelter.',
      location: 'San Francisco, CA',
      website: 'alexchen.dev',
      status: 'ONLINE',
    },
  });

  const sarah = await prisma.user.upsert({
    where: { email: 'sarah@shelter.app' },
    update: {},
    create: {
      id: 'u2',
      name: 'Sarah Miller',
      username: 'sarah',
      email: 'sarah@shelter.app',
      password,
      image: 'https://picsum.photos/seed/sarah/100/100',
      bio: 'UI/UX designer. Coffee lover. ☕',
      location: 'New York, NY',
      website: 'sarahmiller.design',
      status: 'ONLINE',
    },
  });

  const david = await prisma.user.upsert({
    where: { email: 'david@shelter.app' },
    update: {},
    create: {
      id: 'u3',
      name: 'David Kim',
      username: 'david',
      email: 'david@shelter.app',
      password,
      image: 'https://picsum.photos/seed/david/100/100',
      bio: 'Game developer & dungeon master.',
      location: 'Austin, TX',
      website: 'davidkim.io',
      status: 'AWAY',
    },
  });

  // ── Follows ──────────────────────────────────────────────
  await prisma.follow.createMany({
    skipDuplicates: true,
    data: [
      { followerId: alex.id, followingId: sarah.id },
      { followerId: sarah.id, followingId: alex.id },
      { followerId: sarah.id, followingId: david.id },
      { followerId: david.id, followingId: alex.id },
      { followerId: alex.id, followingId: david.id }, // alex also follows david (u3)
    ],
  });

  // ── Posts ────────────────────────────────────────────────
  const post1 = await prisma.post.create({
    data: {
      id: 'post1',
      content: 'Just finished a 2-hour study session on machine learning fundamentals. The timetable AI planner is a game changer!',
      authorId: alex.id,
      visibility: 'PUBLIC',
    },
  });

  const post2 = await prisma.post.create({
    data: {
      id: 'post2',
      content: 'Anyone else excited about the new poker room? Just won three hands in a row! 🃏',
      authorId: sarah.id,
      visibility: 'PUBLIC',
    },
  });

  // Likes
  await prisma.like.createMany({
    skipDuplicates: true,
    data: [
      { userId: sarah.id, postId: post1.id },
      { userId: david.id, postId: post1.id },
      { userId: alex.id, postId: post2.id },
    ],
  });

  // Comments
  await prisma.comment.create({
    data: {
      text: 'Great work!',
      postId: post1.id,
      authorId: sarah.id,
    },
  });

  // ── Tools ────────────────────────────────────────────────
  const vscode = await prisma.tool.create({
    data: {
      id: 't1',
      name: 'VS Code',
      description: 'Lightweight but powerful source code editor.',
      url: 'https://code.visualstudio.com',
      authorLabel: 'Microsoft',
      tags: ['Development', 'Editor'],
      authorId: alex.id,
    },
  });

  const figma = await prisma.tool.create({
    data: {
      id: 't2',
      name: 'Figma',
      description: 'Collaborative interface design tool.',
      url: 'https://figma.com',
      authorLabel: 'Figma Inc.',
      tags: ['Design', 'UI/UX'],
      authorId: sarah.id,
    },
  });

  const notion = await prisma.tool.create({
    data: {
      id: 't3',
      name: 'Notion',
      description: 'All-in-one workspace for notes, tasks, and wikis.',
      url: 'https://notion.so',
      authorLabel: 'Notion Labs',
      tags: ['Productivity', 'Notes'],
      authorId: david.id,
    },
  });

  // Tool upvotes / favorites
  await prisma.toolUpvote.createMany({
    skipDuplicates: true,
    data: [
      { userId: alex.id, toolId: vscode.id },
      { userId: sarah.id, toolId: vscode.id },
      { userId: david.id, toolId: vscode.id },
      { userId: sarah.id, toolId: figma.id },
      { userId: david.id, toolId: figma.id },
      { userId: alex.id, toolId: notion.id },
    ],
  });

  await prisma.toolFavorite.createMany({
    skipDuplicates: true,
    data: [
      { userId: alex.id, toolId: vscode.id },
      { userId: sarah.id, toolId: figma.id },
    ],
  });

  // ── Events ───────────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

  await prisma.event.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'e1',
        title: 'Study: Data Structures',
        date: today,
        time: '09:00',
        duration: 90,
        description: 'Review trees, graphs, and dynamic programming',
        type: EventType.STUDY,
        visibility: 'PUBLIC',
        authorId: alex.id,
        notes: 'Focus on BFS/DFS.',
        color: '#6366f1',
      },
      {
        id: 'e2',
        title: 'Quiz: Algorithms',
        date: tomorrow,
        time: '14:00',
        duration: 60,
        description: 'Weekly quiz on sorting algorithms',
        type: EventType.EXAM,
        visibility: 'PUBLIC',
        authorId: alex.id,
        color: '#f59e0b',
      },
    ],
  });

  // ── Chat room ────────────────────────────────────────────
  const generalRoom = await prisma.chatRoom.create({
    data: {
      id: 'room-general',
      name: 'General',
      isDirect: false,
      members: {
        create: [
          { userId: alex.id },
          { userId: sarah.id },
          { userId: david.id },
        ],
      },
    },
  });

  await prisma.chatMessage.createMany({
    data: [
      {
        content: 'Hey everyone, welcome to the general chat!',
        roomId: generalRoom.id,
        authorId: alex.id,
      },
      {
        content: 'Thanks! Looking forward to it 😊',
        roomId: generalRoom.id,
        authorId: sarah.id,
      },
    ],
  });

  // ── Game room ────────────────────────────────────────────
  await prisma.gameRoom.create({
    data: {
      id: 'game-poker-1',
      type: GameType.POKER,
      status: 'WAITING',
      maxPlayers: 6,
      config: { smallBlind: 10, bigBlind: 20 },
      participants: {
        create: [
          { userId: alex.id, seat: 0, chips: 1000 },
          { userId: david.id, seat: 1, chips: 1000 },
        ],
      },
    },
  });

  console.log('✅ Seed complete');
  console.log(`   Users: alex@shelter.app / sarah@shelter.app / david@shelter.app`);
  console.log(`   Password (all): shelter123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
