'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Image as ImageIcon, Send, Heart, MessageCircle, Share2, MoreHorizontal, SearchX } from 'lucide-react';
import Image from 'next/image';
import { UserHoverCard } from '@/components/UserHoverCard';

const MOCK_POSTS = [
  {
    id: 1,
    author: { name: 'Alex Chen', handle: '@alexc', avatar: 'https://picsum.photos/seed/alex/100/100', status: 'gaming', bio: 'Level 99 Mage. Looking for a party.' },
    content: 'Just discovered an amazing new open source tool for managing local databases. Check out the Tools section!',
    timestamp: '2h ago',
    likes: 24,
    comments: 5,
  },
  {
    id: 2,
    author: { name: 'Sarah Miller', handle: '@sarahm', avatar: 'https://picsum.photos/seed/sarah/100/100', status: 'online', bio: 'Frontend dev & casual gamer.' },
    content: 'Anyone up for a quick game of Poker? Join my lobby!',
    timestamp: '4h ago',
    likes: 12,
    comments: 8,
    image: 'https://picsum.photos/seed/poker/800/400'
  },
  {
    id: 3,
    author: { name: 'David Kim', handle: '@davidk', avatar: 'https://picsum.photos/seed/david/100/100', status: 'watching', bio: 'Always learning.' },
    content: 'The new AI timetable planner is a game changer. It just scheduled my entire week of Python learning perfectly.',
    timestamp: '5h ago',
    likes: 56,
    comments: 14,
  }
];

export default function Feed() {
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [newPost, setNewPost] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  const handlePost = () => {
    if (!newPost.trim()) return;
    const post = {
      id: Date.now(),
      author: { name: 'You', handle: '@you', avatar: 'https://picsum.photos/seed/you/100/100', status: 'online', bio: 'Me!' },
      content: newPost,
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
    };
    setPosts([post, ...posts]);
    setNewPost('');
  };

  const toggleLike = (postId: number) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, likes: likedPosts.has(postId) ? p.likes - 1 : p.likes + 1 }
        : p
    ));
  };

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(p =>
      p.content.toLowerCase().includes(q) ||
      p.author.name.toLowerCase().includes(q) ||
      p.author.handle.toLowerCase().includes(q)
    );
  }, [posts, searchQuery]);

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-display)' }}>Feed</h1>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
          <input
            type="text"
            placeholder="Search users or posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-900 border border-stone-800 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm text-stone-200 placeholder:text-stone-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Create Post */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-stone-900 rounded-3xl p-5 shadow-lg border border-stone-800 mb-8 relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex gap-4 relative z-10">
          <Image src="https://picsum.photos/seed/you/100/100" alt="You" width={40} height={40} className="rounded-full w-10 h-10 object-cover border border-stone-700" referrerPolicy="no-referrer" />
          <div className="flex-1">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full bg-transparent resize-none outline-none text-lg min-h-[80px] text-stone-200 placeholder:text-stone-600"
            />
            <div className="flex items-center justify-between pt-3 border-t border-stone-800/50">
              <button className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-full transition-colors">
                <ImageIcon size={20} />
              </button>
              <button
                onClick={handlePost}
                disabled={!newPost.trim()}
                className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <span>Post</span>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Posts */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {filteredPosts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center text-stone-500 mb-4">
                <SearchX size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
              <p className="text-stone-400 max-w-sm">
                No posts match &quot;{searchQuery}&quot;. Try a different search term.
              </p>
            </motion.div>
          ) : (
            filteredPosts.map((post, i) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: i * 0.05 }}
                className="bg-stone-900 rounded-3xl p-6 shadow-lg border border-stone-800"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <UserHoverCard user={post.author}>
                      <div className="cursor-pointer">
                        <Image src={post.author.avatar} alt={post.author.name} width={40} height={40} className="rounded-full w-10 h-10 object-cover border border-stone-700 hover:border-amber-500 transition-colors" referrerPolicy="no-referrer" />
                      </div>
                    </UserHoverCard>
                    <div>
                      <div className="font-bold text-stone-200 hover:text-amber-400 cursor-pointer transition-colors">{post.author.name}</div>
                      <div className="text-sm text-stone-500">{post.author.handle} • {post.timestamp}</div>
                    </div>
                  </div>
                  <button className="text-stone-500 hover:text-stone-300 p-2 rounded-full hover:bg-stone-800 transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                <p className="text-stone-300 mb-4 whitespace-pre-wrap">{post.content}</p>

                {post.image && (
                  <div className="relative w-full h-64 mb-4 rounded-2xl overflow-hidden border border-stone-800">
                    <Image src={post.image} alt="Post attachment" fill className="object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}

                <div className="flex items-center gap-6 pt-4 border-t border-stone-800/50 text-stone-400">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-2 transition-colors group ${likedPosts.has(post.id) ? 'text-red-400' : 'hover:text-red-400'}`}
                  >
                    <div className={`p-2 rounded-full transition-colors ${likedPosts.has(post.id) ? 'bg-red-500/10' : 'group-hover:bg-red-500/10'}`}>
                      <Heart size={20} fill={likedPosts.has(post.id) ? 'currentColor' : 'none'} />
                    </div>
                    <span className="font-medium">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-amber-400 transition-colors group">
                    <div className="p-2 rounded-full group-hover:bg-amber-500/10 transition-colors">
                      <MessageCircle size={20} />
                    </div>
                    <span className="font-medium">{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-emerald-400 transition-colors group ml-auto">
                    <div className="p-2 rounded-full group-hover:bg-emerald-500/10 transition-colors">
                      <Share2 size={20} />
                    </div>
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
