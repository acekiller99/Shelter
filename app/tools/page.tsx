'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ExternalLink, Tag, Plus, ThumbsUp, Edit3, Trash2, X, Check, ArrowUpDown } from 'lucide-react';

interface Tool {
  id: number;
  name: string;
  description: string;
  url: string;
  author: string;
  tags: string[];
  color: string;
  upvotes: number;
  isOwn?: boolean;
  createdAt: number;
}

const INITIAL_TOOLS: Tool[] = [
  { id: 1, name: 'BCUninstaller', description: 'Bulk Crap Uninstaller is a free bulk program uninstaller with advanced automation.', url: 'https://www.bcuninstaller.com/', author: 'Klocman', tags: ['Utility', 'Windows', 'Open Source'], color: 'from-cyan-500 to-blue-600', upvotes: 24, createdAt: Date.now() - 5000000 },
  { id: 2, name: 'OBS Studio', description: 'Free and open source software for video recording and live streaming.', url: 'https://obsproject.com/', author: 'OBS Project', tags: ['Media', 'Streaming', 'Open Source'], color: 'from-fuchsia-500 to-purple-600', upvotes: 56, createdAt: Date.now() - 3000000 },
  { id: 3, name: 'VS Code', description: 'Code editing. Redefined. Free. Built on open source. Runs everywhere.', url: 'https://code.visualstudio.com/', author: 'Microsoft', tags: ['Development', 'Editor'], color: 'from-emerald-400 to-teal-600', upvotes: 102, createdAt: Date.now() - 2000000 },
  { id: 4, name: 'Postman', description: 'API platform for building and using APIs. Simplifies each step of the API lifecycle.', url: 'https://www.postman.com/', author: 'Postman Inc.', tags: ['Development', 'API', 'Testing'], color: 'from-orange-400 to-red-500', upvotes: 38, createdAt: Date.now() - 1000000 },
];

const ALL_TAGS = ['All', 'Utility', 'Windows', 'Open Source', 'Media', 'Streaming', 'Development', 'Editor', 'API', 'Testing'];
const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest' },
  { id: 'popular', label: 'Most Popular' },
  { id: 'alphabetical', label: 'A–Z' },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]['id'];

const EMPTY_FORM = { name: '', description: '', url: '', author: '', tags: '', color: 'from-amber-400 to-orange-500' };

export default function Tools() {
  const [tools, setTools] = useState<Tool[]>(INITIAL_TOOLS);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [upvoted, setUpvoted] = useState<Set<number>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  const filteredTools = useMemo(() => {
    let result = tools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase()) ||
        tool.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchesTag = activeTag === 'All' || tool.tags.includes(activeTag);
      return matchesSearch && matchesTag;
    });
    if (sortBy === 'newest') result = [...result].sort((a, b) => b.createdAt - a.createdAt);
    else if (sortBy === 'popular') result = [...result].sort((a, b) => b.upvotes - a.upvotes);
    else if (sortBy === 'alphabetical') result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [tools, search, activeTag, sortBy]);

  const openAdd = () => { setEditingTool(null); setForm(EMPTY_FORM); setFormError(''); setShowModal(true); };
  const openEdit = (tool: Tool) => { setEditingTool(tool); setForm({ name: tool.name, description: tool.description, url: tool.url, author: tool.author, tags: tool.tags.join(', '), color: tool.color }); setFormError(''); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingTool(null); };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.description.trim() || !form.url.trim()) {
      setFormError('Name, description, and URL are required.');
      return;
    }
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    if (editingTool) {
      setTools(prev => prev.map(t => t.id === editingTool.id ? { ...t, ...form, tags, url: form.url } : t));
    } else {
      setTools(prev => [{ id: Date.now(), ...form, tags, upvotes: 0, isOwn: true, createdAt: Date.now() }, ...prev]);
    }
    closeModal();
  };

  const deleteTool = (id: number) => setTools(prev => prev.filter(t => t.id !== id));

  const toggleUpvote = (id: number) => {
    const wasUp = upvoted.has(id);
    setUpvoted(prev => {
      const next = new Set(prev);
      if (wasUp) next.delete(id); else next.add(id);
      return next;
    });
    setTools(prev => prev.map(t => t.id === id ? { ...t, upvotes: wasUp ? t.upvotes - 1 : t.upvotes + 1 } : t));
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-display)' }}>Recommended Tools</h1>
          <p className="text-stone-400 mt-1">Curated software and open source projects</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
            <input type="text" placeholder="Search tools or tags..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-stone-900 border border-stone-800 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm text-stone-200 placeholder:text-stone-500" />
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-bold hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(245,158,11,0.3)] whitespace-nowrap">
            <Plus size={18} /> <span className="hidden sm:inline">Add Tool</span>
          </button>
        </div>
      </div>

      {/* Mobile tag pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-6 lg:hidden">
        {ALL_TAGS.map(tag => (
          <button key={tag} onClick={() => setActiveTag(tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
              activeTag === tag ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-stone-800/50 text-stone-400 border-stone-700 hover:text-stone-200'
            }`}>
            {tag}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Category / tag filter sidebar — desktop */}
        <aside className="hidden lg:flex flex-col w-44 shrink-0">
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-4 sticky top-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
              <Tag size={12} /> Categories
            </h3>
            <div className="space-y-0.5">
              {ALL_TAGS.map(tag => (
                <button key={tag} onClick={() => setActiveTag(tag)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                    activeTag === tag
                      ? 'bg-amber-500/20 text-amber-400 font-medium'
                      : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                  }`}>
                  {tag === 'All' ? 'All Tags' : tag}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Sort bar */}
          <div className="flex items-center gap-2 flex-wrap mb-6">
            <ArrowUpDown size={14} className="text-stone-500" />
            {SORT_OPTIONS.map(opt => (
              <button key={opt.id} onClick={() => setSortBy(opt.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border whitespace-nowrap ${
                  sortBy === opt.id ? 'bg-stone-700 text-white border-stone-600' : 'bg-stone-800/50 text-stone-400 border-stone-700 hover:text-stone-200'
                }`}>
                {opt.label}
              </button>
            ))}
            {activeTag !== 'All' && (
              <button onClick={() => setActiveTag('All')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors ml-auto">
                <X size={12} /> Clear: {activeTag}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredTools.map((tool, i) => (
                <motion.div key={tool.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }}
                  className="bg-stone-900 rounded-3xl overflow-hidden shadow-lg border border-stone-800 flex flex-col group hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] transition-all">
                  <div className={`h-24 bg-gradient-to-r ${tool.color} p-6 flex items-end relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="flex items-end justify-between w-full relative z-10">
                      <h3 className="text-2xl font-bold text-white">{tool.name}</h3>
                      {tool.isOwn && (
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(tool)} className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"><Edit3 size={14} /></button>
                          <button onClick={() => deleteTool(tool.id)} className="p-1.5 bg-red-500/30 hover:bg-red-500/50 rounded-lg text-white transition-colors"><Trash2 size={14} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="text-sm font-medium text-amber-400 mb-3">By {tool.author}</div>
                    <p className="text-stone-300 mb-4 flex-1 text-sm">{tool.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tool.tags.map(t => (
                        <button key={t} onClick={() => setActiveTag(t)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-800 border border-stone-700 text-stone-300 text-xs font-medium hover:border-amber-500/50 hover:text-amber-400 transition-colors">
                          <Tag size={12} /> {t}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <a href={tool.url} target="_blank" rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-stone-800 hover:bg-stone-700 text-white rounded-xl font-bold transition-colors border border-stone-700 hover:border-amber-500/50 text-sm">
                        <ExternalLink size={16} /> Visit
                      </a>
                      <button onClick={() => toggleUpvote(tool.id)}
                        data-testid={`upvote-${tool.id}`}
                        className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                          upvoted.has(tool.id) ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-amber-400 hover:border-amber-500/30'
                        }`}>
                        <ThumbsUp size={16} fill={upvoted.has(tool.id) ? 'currentColor' : 'none'} /> {tool.upvotes}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && closeModal()}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-stone-900 rounded-3xl border border-stone-700 p-6 w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">{editingTool ? 'Edit Tool' : 'Add New Tool'}</h2>
                <button onClick={closeModal} className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                {[
                  { key: 'name', label: 'Tool Name *', placeholder: 'e.g. VS Code' },
                  { key: 'author', label: 'Author / Creator', placeholder: 'e.g. Microsoft' },
                  { key: 'url', label: 'Website URL *', placeholder: 'https://...' },
                  { key: 'tags', label: 'Tags (comma separated)', placeholder: 'Development, Editor' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-stone-400 mb-1">{label}</label>
                    <input value={form[key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder}
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-stone-400 mb-1">Description *</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of the tool..."
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm min-h-[80px] resize-none" />
                </div>
                {formError && <p className="text-red-400 text-sm">{formError}</p>}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={closeModal} className="flex-1 py-2.5 bg-stone-800 text-stone-300 border border-stone-700 rounded-xl font-medium hover:bg-stone-700 transition-colors">Cancel</button>
                <button onClick={handleSubmit} className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                  <Check size={16} /> {editingTool ? 'Save Changes' : 'Add Tool'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
