'use client';

import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Image as ImageIcon, Send, Heart, MessageCircle, Share2, MoreHorizontal, SearchX, Trash2, X, ChevronDown, ChevronUp, Check } from 'lucide-react';
import Image from 'next/image';
import { UserHoverCard } from '@/components/UserHoverCard';
import { useGlobal } from '@/components/GlobalContext';

interface Comment {
  id: number;
  author: { name: string; handle: string; avatar: string };
  text: string;
  timestamp: string;
}

interface Post {
  id: number;
  author: { name: string; handle: string; avatar: string; status: string; bio: string };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  image?: string;
  isOwn?: boolean;
  commentList?: Comment[];
}

const INITIAL_POSTS: Post[] = [
  {
    id: 1,
    author: { name: 'Alex Chen', handle: '@alexc', avatar: 'https://picsum.photos/seed/alex/100/100', status: 'gaming', bio: 'Level 99 Mage. Looking for a party.' },
    content: 'Just discovered an amazing new open source tool for managing local databases. Check out the Tools section!',
    timestamp: '2h ago',
    likes: 24,
    comments: 5,
    commentList: [
      { id: 1, author: { name: 'Sarah Miller', handle: '@sarahm', avatar: 'https://picsum.photos/seed/sarah/100/100' }, text: 'Which tool is that? Sounds great!', timestamp: '1h ago' },
      { id: 2, author: { name: 'David Kim', handle: '@davidk', avatar: 'https://picsum.photos/seed/david/100/100' }, text: 'Great find! I was looking for something like this.', timestamp: '30m ago' },
    ],
  },
  {
    id: 2,
    author: { name: 'Sarah Miller', handle: '@sarahm', avatar: 'https://picsum.photos/seed/sarah/100/100', status: 'online', bio: 'Frontend dev & casual gamer.' },
    content: 'Anyone up for a quick game of Poker? Join my lobby!',
    timestamp: '4h ago',
    likes: 12,
    comments: 8,
    image: 'https://picsum.photos/seed/poker/800/400',
    commentList: [],
  },
  {
    id: 3,
    author: { name: 'David Kim', handle: '@davidk', avatar: 'https://picsum.photos/seed/david/100/100', status: 'watching', bio: 'Always learning.' },
    content: 'The new AI timetable planner is a game changer. It just scheduled my entire week of Python learning perfectly.',
    timestamp: '5h ago',
    likes: 56,
    comments: 14,
    commentList: [],
  }
];

export default function Feed() {
  const { currentUser } = useGlobal();
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [newPost, setNewPost] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [postImage, setPostImage] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handlePost = () => {
    if (!newPost.trim() && !postImage) return;
    const post: Post = {
      id: Date.now(),
      author: { name: currentUser.name, handle: currentUser.handle, avatar: currentUser.avatar, status: currentUser.status, bio: currentUser.bio },
      content: newPost,
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      isOwn: true,
      ...(postImage ? { image: postImage } : {}),
      commentList: [],
    };
    setPosts([post, ...posts]);
    setNewPost('');
    setPostImage(null);
  };

  const handleImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setPostImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const toggleLike = (postId: number) => {
    const wasLiked = likedPosts.has(postId);
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (wasLiked) newSet.delete(postId); else newSet.add(postId);
      return newSet;
    });
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, likes: wasLiked ? p.likes - 1 : p.likes + 1 } : p
    ));
  };

  const toggleComments = (postId: number) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId); else next.add(postId);
      return next;
    });
  };

  const addComment = (postId: number) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    const comment: Comment = {
      id: Date.now(),
      author: { name: currentUser.name, handle: currentUser.handle, avatar: currentUser.avatar },
      text,
      timestamp: 'Just now',
    };
    setPosts(prev => prev.map(p => p.id === postId
      ? { ...p, comments: p.comments + 1, commentList: [...(p.commentList || []), comment] }
      : p
    ));
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const sharePost = async (postId: number) => {
    const url = `${window.location.origin}/?post=${postId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback silently
    }
    setCopiedId(postId);
    setTimeout(() => setCopiedId(null), 2000);
    setOpenMenuId(null);
  };

  const deletePost = (postId: number) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    setOpenMenuId(null);
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
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors">✕</button>
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
          <Image src={currentUser.avatar} alt="You" width={40} height={40} className="rounded-full w-10 h-10 object-cover border border-stone-700" referrerPolicy="no-referrer" />
          <div className="flex-1">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full bg-transparent resize-none outline-none text-lg min-h-[80px] text-stone-200 placeholder:text-stone-600"
            />
            {postImage && (
              <div className="relative w-full h-48 mb-3 rounded-2xl overflow-hidden border border-stone-700">
                <img src={postImage} alt="Upload preview" className="w-full h-full object-cover" />
                <button onClick={() => setPostImage(null)} className="absolute top-2 right-2 p-1 bg-stone-900/80 rounded-full text-white hover:bg-stone-800">
                  <X size={16} />
                </button>
              </div>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-stone-800/50">
              <div>
                <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageSelect(e.target.files[0])} />
                <button onClick={() => imageInputRef.current?.click()} className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-full transition-colors">
                  <ImageIcon size={20} />
                </button>
              </div>
              <button
                onClick={handlePost}
                disabled={!newPost.trim() && !postImage}
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
              <p className="text-stone-400 max-w-sm">No posts match &quot;{searchQuery}&quot;. Try a different search term.</p>
            </motion.div>
          ) : (
            filteredPosts.map((post, i) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
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
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === post.id ? null : post.id)}
                      className="text-stone-500 hover:text-stone-300 p-2 rounded-full hover:bg-stone-800 transition-colors"
                    >
                      <MoreHorizontal size={20} />
                    </button>
                    <AnimatePresence>
                      {openMenuId === post.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 top-10 bg-stone-800 border border-stone-700 rounded-2xl shadow-xl py-1 z-50 min-w-[160px]"
                        >
                          <button
                            onClick={() => sharePost(post.id)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-300 hover:bg-stone-700 hover:text-white transition-colors"
                          >
                            {copiedId === post.id ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
                            {copiedId === post.id ? 'Copied!' : 'Copy Link'}
                          </button>
                          {post.isOwn && (
                            <button
                              onClick={() => deletePost(post.id)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 size={16} />
                              Delete Post
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
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
                  <button
                    onClick={() => toggleComments(post.id)}
                    className={`flex items-center gap-2 transition-colors group ${expandedComments.has(post.id) ? 'text-amber-400' : 'hover:text-amber-400'}`}
                  >
                    <div className="p-2 rounded-full group-hover:bg-amber-500/10 transition-colors">
                      <MessageCircle size={20} />
                    </div>
                    <span className="font-medium">{post.comments}</span>
                    {expandedComments.has(post.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button
                    onClick={() => sharePost(post.id)}
                    className="flex items-center gap-2 hover:text-emerald-400 transition-colors group ml-auto"
                  >
                    <div className="p-2 rounded-full group-hover:bg-emerald-500/10 transition-colors">
                      {copiedId === post.id ? <Check size={20} className="text-emerald-400" /> : <Share2 size={20} />}
                    </div>
                  </button>
                </div>

                {/* Comments section */}
                <AnimatePresence>
                  {expandedComments.has(post.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 space-y-3 border-t border-stone-800/50 mt-4">
                        {(post.commentList || []).map(comment => (
                          <div key={comment.id} className="flex gap-3">
                            <Image src={comment.author.avatar} alt={comment.author.name} width={32} height={32} className="rounded-full object-cover border border-stone-700 shrink-0" referrerPolicy="no-referrer" />
                            <div className="flex-1 bg-stone-800/50 rounded-2xl px-4 py-2">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-stone-200 text-sm">{comment.author.name}</span>
                                <span className="text-xs text-stone-500">{comment.timestamp}</span>
                              </div>
                              <p className="text-stone-300 text-sm">{comment.text}</p>
                            </div>
                          </div>
                        ))}
                        {/* Add comment input */}
                        <div className="flex gap-3 pt-2">
                          <Image src={currentUser.avatar} alt="You" width={32} height={32} className="rounded-full object-cover border border-stone-700 shrink-0" referrerPolicy="no-referrer" />
                          <div className="flex-1 flex gap-2">
                            <input
                              value={commentInputs[post.id] || ''}
                              onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                              onKeyDown={e => e.key === 'Enter' && addComment(post.id)}
                              placeholder="Write a comment..."
                              className="flex-1 bg-stone-800 border border-stone-700 rounded-full px-4 py-2 text-sm text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
                            />
                            <button
                              onClick={() => addComment(post.id)}
                              disabled={!commentInputs[post.id]?.trim()}
                              className="p-2 bg-amber-500/20 text-amber-400 rounded-full hover:bg-amber-500/30 transition-colors disabled:opacity-40"
                            >
                              <Send size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
