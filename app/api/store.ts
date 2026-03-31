/**
 * Shared in-memory stores — imported by both route files and [id] sub-routes.
 * Replace these arrays with Prisma/DB queries when backend is wired up.
 */

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  website: string;
  followers: string[];
  following: string[];
  joinedAt: string;
  status: 'online' | 'away' | 'offline';
}

export const users: User[] = [
  {
    id: 'u1',
    name: 'Alex Chen',
    username: 'alex',
    email: 'alex@shelter.app',
    avatar: 'https://picsum.photos/seed/alex/100/100',
    bio: 'Software engineer & gamer. Building things at Shelter.',
    location: 'San Francisco, CA',
    website: 'alexchen.dev',
    followers: ['u2', 'u3'],
    following: ['u2'],
    joinedAt: '2025-01-15T00:00:00.000Z',
    status: 'online',
  },
  {
    id: 'u2',
    name: 'Sarah Miller',
    username: 'sarah',
    email: 'sarah@shelter.app',
    avatar: 'https://picsum.photos/seed/sarah/100/100',
    bio: 'UI/UX designer. Coffee lover. ☕',
    location: 'New York, NY',
    website: 'sarahmiller.design',
    followers: ['u1'],
    following: ['u1', 'u3'],
    joinedAt: '2025-02-01T00:00:00.000Z',
    status: 'online',
  },
  {
    id: 'u3',
    name: 'David Kim',
    username: 'david',
    email: 'david@shelter.app',
    avatar: 'https://picsum.photos/seed/david/100/100',
    bio: 'Game developer & dungeon master.',
    location: 'Austin, TX',
    website: 'davidkim.io',
    followers: ['u2'],
    following: ['u1'],
    joinedAt: '2025-03-10T00:00:00.000Z',
    status: 'away',
  },
];

export interface Post {
  id: string;
  author: { id: string; name: string; avatar: string; username: string };
  content: string;
  image?: string;
  likes: string[];
  comments: { id: string; authorId: string; authorName: string; text: string; createdAt: string }[];
  createdAt: string;
  visibility: 'public' | 'private';
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  author: string;
  tags: string[];
  upvotes: string[];
  favorites: string[];
  createdAt: string;
  authorId: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  description: string;
  type: 'study' | 'exam' | 'assignment' | 'social' | 'other';
  visibility: 'public' | 'private';
  authorId: string;
  completed: boolean;
  notes: string;
  color: string;
}

export const posts: Post[] = [
  {
    id: '1',
    author: { id: 'u1', name: 'Alex Chen', username: 'alex', avatar: 'https://picsum.photos/seed/alex/100/100' },
    content: 'Just finished a 2-hour study session on machine learning fundamentals. The timetable AI planner is a game changer!',
    likes: ['u2', 'u3'],
    comments: [{ id: 'c1', authorId: 'u2', authorName: 'Sarah', text: 'Great work!', createdAt: new Date().toISOString() }],
    createdAt: new Date(Date.now() - 3_600_000).toISOString(),
    visibility: 'public',
  },
  {
    id: '2',
    author: { id: 'u2', name: 'Sarah Miller', username: 'sarah', avatar: 'https://picsum.photos/seed/sarah/100/100' },
    content: 'Anyone else excited about the new poker room? Just won three hands in a row! 🃏',
    likes: ['u1'],
    comments: [],
    createdAt: new Date(Date.now() - 7_200_000).toISOString(),
    visibility: 'public',
  },
];

export const tools: Tool[] = [
  {
    id: 't1', name: 'VS Code', description: 'Lightweight but powerful source code editor.',
    url: 'https://code.visualstudio.com', author: 'Microsoft', tags: ['Development', 'Editor'],
    upvotes: ['u1', 'u2', 'u3'], favorites: ['u1'], createdAt: new Date(Date.now() - 86_400_000 * 30).toISOString(), authorId: 'u1',
  },
  {
    id: 't2', name: 'Figma', description: 'Collaborative interface design tool.',
    url: 'https://figma.com', author: 'Figma Inc.', tags: ['Design', 'UI/UX'],
    upvotes: ['u2', 'u3'], favorites: ['u2'], createdAt: new Date(Date.now() - 86_400_000 * 20).toISOString(), authorId: 'u2',
  },
  {
    id: 't3', name: 'Notion', description: 'All-in-one workspace for notes, tasks, and wikis.',
    url: 'https://notion.so', author: 'Notion Labs', tags: ['Productivity', 'Notes'],
    upvotes: ['u1'], favorites: [], createdAt: new Date(Date.now() - 86_400_000 * 10).toISOString(), authorId: 'u3',
  },
];

export const events: Event[] = [
  {
    id: 'e1', title: 'Study: Data Structures',
    date: new Date().toISOString().slice(0, 10), time: '09:00', duration: 90,
    description: 'Review trees, graphs, and dynamic programming',
    type: 'study', visibility: 'public', authorId: 'u1', completed: false, notes: 'Focus on BFS/DFS.', color: '#6366f1',
  },
  {
    id: 'e2', title: 'Quiz: Algorithms',
    date: new Date(Date.now() + 86_400_000).toISOString().slice(0, 10), time: '14:00', duration: 60,
    description: 'Weekly quiz on sorting algorithms',
    type: 'exam', visibility: 'public', authorId: 'u1', completed: false, notes: '', color: '#f59e0b',
  },
];
