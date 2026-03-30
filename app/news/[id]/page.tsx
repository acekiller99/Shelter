'use client';

import { use } from 'react';
import { motion } from 'motion/react';
import { Clock, ArrowLeft, Share2, Bookmark, ThumbsUp, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const MOCK_NEWS = [
  {
    id: '1',
    title: 'Nexus Update 2.0: New Multiplayer Games Added',
    body: `We are excited to announce the latest major update to Shelter, bringing with it an array of new multiplayer games including Texas Hold'em Poker and a Dungeon Crawler RPG.

This update represents months of work from our dedicated development team and community contributors. The new game engine leverages WebRTC and WebGL for smooth, low-latency gameplay directly in your browser.

## What's New

**Texas Hold'em Poker** — Full multiplayer experience with up to 8 players per table. Features include real-time betting, animated card dealing, and an AI-powered statistics overlay.

**Dungeon Crawler RPG** — Explore procedurally generated dungeons with up to 4 friends. Collect loot, level up your character, and defeat powerful bosses.

## Performance Improvements

We've also significantly improved the loading times across all pages, with initial load time reduced by 40% thanks to better code splitting and asset optimization.

## What's Coming Next

Our roadmap for the next quarter includes voice lobby enhancements, a full AI study planner integration, and a mobile-native PWA experience.`,
    summary: "We are excited to announce the latest update to Shelter, bringing new multiplayer games including Texas Hold'em and a Dungeon Crawler RPG.",
    source: 'Shelter Official',
    time: '2 hours ago',
    image: 'https://picsum.photos/seed/update/1200/600',
    category: 'Platform Update',
    readTime: '4 min read',
    likes: 142,
    comments: 28,
  },
  {
    id: '2',
    title: 'The Rise of Web-Based Gaming',
    body: `Browser games are making a massive comeback. With modern web technologies like WebGL, WebRTC, and WebAssembly, the gap between native and browser-based games has never been smaller.

## The Technology Stack

Modern web gaming relies on several key technologies:

**WebGL 2.0** provides GPU-accelerated 3D graphics directly in the browser without plugins. Games like the ones powered by Three.js or Babylon.js demonstrate console-quality visuals.

**WebRTC** enables peer-to-peer communication for real-time multiplayer without the need for dedicated game servers — perfect for small party games.

**WebAssembly** allows developers to compile high-performance game engines like Unity and Godot to run at near-native speeds in the browser.

## Why Now?

The combination of improved internet speeds, more powerful devices, and better browser APIs means today's web games can deliver experiences that were impossible just five years ago.`,
    summary: 'How browser games are making a massive comeback with modern web technologies like WebGL and WebRTC.',
    source: 'Tech Gaming Weekly',
    time: '5 hours ago',
    image: 'https://picsum.photos/seed/webgaming/1200/600',
    category: 'Industry News',
    readTime: '6 min read',
    likes: 89,
    comments: 17,
  },
  {
    id: '3',
    title: 'Top 10 Open Source Tools for Developers in 2024',
    body: `Every developer should have a solid toolkit. Here are the top 10 open-source tools that have made the biggest impact this year.

1. **VS Code** — Still the undisputed king of code editors with an enormous ecosystem.
2. **Docker** — Containerization has become essential for any modern development workflow.
3. **Git + GitHub** — The backbone of collaborative software development.
4. **OBS Studio** — Record and stream your coding sessions with professional quality.
5. **Postman** — API development and testing made simple.
6. **BCUninstaller** — Bulk remove bloatware from Windows machines.
7. **Linux (WSL)** — The Windows Subsystem for Linux has matured into a first-class development environment.
8. **Figma** — UI/UX design collaboration at its finest.
9. **Excalidraw** — Quick hand-drawn style diagrams for system design sessions.
10. **Raycast** — The productivity launcher that replaces Spotlight on macOS.`,
    summary: 'A curated list of the best open-source tools that every developer should have in their toolkit this year.',
    source: 'Dev Community',
    time: '1 day ago',
    image: 'https://picsum.photos/seed/devtools/1200/600',
    category: 'Tools & Tech',
    readTime: '5 min read',
    likes: 234,
    comments: 45,
  },
  {
    id: '4',
    title: 'AI Integration in Modern Web Apps',
    body: `Artificial intelligence is no longer a novelty feature — it's becoming a fundamental part of how web applications are built and experienced.

## The AI-First Approach

Leading apps today are integrating AI not as an afterthought, but as a core part of the product experience. From smart search to personalized recommendations, AI is reshaping expectations.

## Practical Use Cases

**Smart Timetabling** — AI can analyze your schedule, goals, and learning patterns to automatically plan your study sessions and optimize for retention.

**Content Moderation** — ML models can detect spam and harmful content in real time, keeping communities safe without manual review.

**Code Assistance** — Tools like GitHub Copilot demonstrate how AI can dramatically accelerate developer productivity.

## What's Next

The next frontier is agentic AI — AI that can take actions on your behalf, not just answer questions. We're already experimenting with this in Shelter's AI planner feature.`,
    summary: 'Exploring how artificial intelligence is being seamlessly integrated into everyday web applications to enhance user experience.',
    source: 'AI Insights',
    time: '2 days ago',
    image: 'https://picsum.photos/seed/aiweb/1200/600',
    category: 'Artificial Intelligence',
    readTime: '7 min read',
    likes: 187,
    comments: 33,
  },
];

function renderBody(body: string) {
  return body.split('\n\n').map((paragraph, i) => {
    if (paragraph.startsWith('## ')) {
      return <h2 key={i} className="text-2xl font-bold text-white mt-8 mb-4">{paragraph.slice(3)}</h2>;
    }
    const rendered = paragraph
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white">$1</strong>')
      .replace(/^\d+\. /, '<span class="text-amber-400 font-bold">$&</span>');
    return <p key={i} className="text-stone-300 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: rendered }} />;
  });
}

export default function NewsArticle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const article = MOCK_NEWS.find(n => n.id === id);

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Article Not Found</h1>
        <Link href="/news" className="text-amber-400 hover:underline">← Back to News</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      {/* Back button */}
      <Link href="/news" className="inline-flex items-center gap-2 text-stone-400 hover:text-amber-400 transition-colors mb-8 group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to News
      </Link>

      <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Category & Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
            {article.category}
          </span>
          <span className="flex items-center gap-1.5 text-stone-400 text-sm"><Clock size={14} /> {article.time}</span>
          <span className="text-stone-500 text-sm">{article.readTime}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
          {article.title}
        </h1>

        {/* Source */}
        <p className="text-amber-400 font-medium mb-8">By {article.source}</p>

        {/* Hero Image */}
        <div className="relative w-full h-72 md:h-96 rounded-3xl overflow-hidden border border-stone-800 mb-10">
          <Image src={article.image} alt={article.title} fill className="object-cover" referrerPolicy="no-referrer" />
        </div>

        {/* Body */}
        <div className="prose-custom">
          {renderBody(article.body)}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-8 mt-8 border-t border-stone-800">
          <button className="flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-red-400 rounded-xl border border-stone-700 transition-all text-sm font-medium">
            <ThumbsUp size={16} /> {article.likes}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-400 rounded-xl border border-stone-700 transition-all text-sm font-medium">
            <MessageCircle size={16} /> {article.comments}
          </button>
          <button
            onClick={() => navigator.clipboard?.writeText(window.location.href)}
            className="flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-emerald-400 rounded-xl border border-stone-700 transition-all text-sm font-medium"
          >
            <Share2 size={16} /> Share
          </button>
          <button className="ml-auto flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-400 rounded-xl border border-stone-700 transition-all text-sm font-medium">
            <Bookmark size={16} /> Save
          </button>
        </div>
      </motion.article>
    </div>
  );
}
