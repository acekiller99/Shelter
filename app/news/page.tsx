'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Newspaper, Clock, ArrowRight, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface NewsArticle {
  id: number;
  title: string;
  summary: string;
  source: string;
  time: string;
  image: string;
  category: string;
  url: string;
}

const SEED_NEWS: NewsArticle[] = [
  {
    id: 1,
    title: 'Nexus Update 2.0: New Multiplayer Games Added',
    summary: 'We are excited to announce the latest update to Nexus, bringing new multiplayer games including Texas Hold\'em and a Dungeon Crawler RPG.',
    source: 'Nexus Official',
    time: '2 hours ago',
    image: 'https://picsum.photos/seed/update/600/400',
    category: 'Platform Update',
    url: '#'
  },
  {
    id: 2,
    title: 'The Rise of Web-Based Gaming',
    summary: 'How browser games are making a massive comeback with modern web technologies like WebGL and WebRTC.',
    source: 'Tech Gaming Weekly',
    time: '5 hours ago',
    image: 'https://picsum.photos/seed/webgaming/600/400',
    category: 'Industry News',
    url: '#'
  },
  {
    id: 3,
    title: 'Top 10 Open Source Tools for Developers in 2024',
    summary: 'A curated list of the best open-source tools that every developer should have in their toolkit this year.',
    source: 'Dev Community',
    time: '1 day ago',
    image: 'https://picsum.photos/seed/devtools/600/400',
    category: 'Tools & Tech',
    url: '#'
  },
  {
    id: 4,
    title: 'AI Integration in Modern Web Apps',
    summary: 'Exploring how artificial intelligence is being seamlessly integrated into everyday web applications to enhance user experience.',
    source: 'AI Insights',
    time: '2 days ago',
    image: 'https://picsum.photos/seed/aiweb/600/400',
    category: 'Artificial Intelligence',
    url: '#'
  }
];

const CATEGORIES = ['Platform Update', 'Industry News', 'Tools & Tech', 'Artificial Intelligence'];
const EMPTY_FORM = { title: '', summary: '', source: 'Shelter Admin', time: 'Just now', image: 'https://picsum.photos/seed/news/600/400', category: 'Platform Update' };

export default function News() {
  const [articles, setArticles] = useState<NewsArticle[]>(SEED_NEWS);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const filterCategories = ['All', ...CATEGORIES];

  const filteredNews = activeCategory === 'All'
    ? articles
    : articles.filter(a => a.category === activeCategory);

  const openCreate = () => {
    setEditingArticle(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (article: NewsArticle) => {
    setEditingArticle(article);
    setForm({ title: article.title, summary: article.summary, source: article.source, time: article.time, image: article.image, category: article.category });
    setFormError('');
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    setArticles(prev => prev.filter(a => a.id !== id));
    setDeleteConfirmId(null);
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.summary.trim()) { setFormError('Title and summary are required.'); return; }
    if (editingArticle) {
      setArticles(prev => prev.map(a => a.id === editingArticle.id ? { ...a, ...form } : a));
    } else {
      setArticles(prev => [{ ...form, id: Date.now(), url: '#' }, ...prev]);
    }
    setShowModal(false);
  };

  const featuredArticle = filteredNews[0];

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3" style={{ fontFamily: 'var(--font-display)' }}>
            <Newspaper className="text-amber-400" size={32} />
            News & Updates
          </h1>
          <p className="text-stone-400">Stay up to date with the latest from Shelter and the tech world</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/20"
          >
            <Plus size={16} /> Write Article
          </button>

          <div className="flex items-center gap-2 bg-stone-900 p-1.5 rounded-2xl border border-stone-800 overflow-x-auto no-scrollbar">
            {filterCategories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeCategory === category
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Article */}
      {featuredArticle && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 relative rounded-3xl overflow-hidden border border-stone-800 group"
        >
          <Link href={`/news/${featuredArticle.id}`} className="block cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent z-10" />
            <div className="relative h-[220px] sm:h-[300px] md:h-[400px] w-full">
              <Image
                src={featuredArticle.image}
                alt={featuredArticle.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 md:p-8 z-20">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                  {featuredArticle.category}
                </span>
                <span className="flex items-center gap-1 text-stone-300 text-sm">
                  <Clock size={14} />
                  {featuredArticle.time}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-amber-400 transition-colors">
                {featuredArticle.title}
              </h2>
              <p className="text-stone-300 max-w-3xl text-lg mb-6 line-clamp-2">
                {featuredArticle.summary}
              </p>
              <div className="flex items-center gap-2 text-amber-400 font-medium group-hover:gap-3 transition-all">
                Read Full Article <ArrowRight size={16} />
              </div>
            </div>
          </Link>
          {/* Admin controls on featured */}
          <div className="absolute top-4 right-4 z-30 flex gap-2">
            <button
              onClick={(e) => { e.preventDefault(); openEdit(featuredArticle); }}
              className="p-2 bg-stone-900/80 backdrop-blur-md text-amber-400 rounded-lg hover:bg-stone-800 transition-colors border border-stone-700"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); setDeleteConfirmId(featuredArticle.id); }}
              className="p-2 bg-stone-900/80 backdrop-blur-md text-red-400 rounded-lg hover:bg-red-500/20 transition-colors border border-stone-700"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </motion.div>
      )}

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNews.map((news, i) => (
          activeCategory === 'All' && i === 0 ? null : (
            <motion.div
              key={news.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 group hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] transition-all flex flex-col relative"
            >
              {/* Admin controls */}
              <div className="absolute top-3 right-3 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(news)}
                  className="p-1.5 bg-stone-900/90 backdrop-blur-md text-amber-400 rounded-lg hover:bg-stone-800 transition-colors border border-stone-700"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(news.id)}
                  className="p-1.5 bg-stone-900/90 backdrop-blur-md text-red-400 rounded-lg hover:bg-red-500/20 transition-colors border border-stone-700"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              <Link href={`/news/${news.id}`} className="flex flex-col flex-1">
                <div className="relative h-48 w-full overflow-hidden shrink-0">
                  <Image
                    src={news.image}
                    alt={news.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 bg-stone-900/80 backdrop-blur-md text-white border border-stone-700 rounded-full text-xs font-medium">
                      {news.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between text-xs text-stone-400 mb-3">
                    <span className="font-medium text-amber-400">{news.source}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {news.time}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors line-clamp-2">
                    {news.title}
                  </h3>

                  <p className="text-stone-400 text-sm mb-6 line-clamp-3 flex-1">
                    {news.summary}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-stone-300 font-medium mt-auto group-hover:text-amber-400 transition-colors">
                    Read More <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        ))}
      </div>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirmId !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteConfirmId(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-stone-900 rounded-2xl border border-stone-700 p-6 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-white mb-2">Delete Article?</h3>
              <p className="text-stone-400 text-sm mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 bg-stone-800 text-stone-300 border border-stone-700 rounded-xl font-medium hover:bg-stone-700 transition-colors">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirmId)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-stone-900 rounded-3xl border border-stone-700 p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">{editingArticle ? 'Edit Article' : 'Write Article'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors"><X size={20} /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-400 mb-1">Title *</label>
                  <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Article headline"
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-400 mb-1">Summary *</label>
                  <textarea value={form.summary} onChange={e => setForm(p => ({ ...p, summary: e.target.value }))} placeholder="Brief description of the article..."
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm resize-none min-h-[90px]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-stone-400 mb-1">Source</label>
                    <input value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))} placeholder="e.g. Shelter Admin"
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-400 mb-1">Timestamp</label>
                    <input value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} placeholder="e.g. Just now"
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-400 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 text-sm">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-400 mb-1">Image URL</label>
                  <input value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} placeholder="https://..."
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm" />
                </div>
                {formError && <p className="text-red-400 text-sm">{formError}</p>}
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-stone-800 text-stone-300 border border-stone-700 rounded-xl font-medium hover:bg-stone-700 transition-colors">Cancel</button>
                <button onClick={handleSubmit} className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                  <Check size={16} /> {editingArticle ? 'Save Changes' : 'Publish'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

