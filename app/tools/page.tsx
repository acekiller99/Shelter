'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, ExternalLink, Tag, Plus } from 'lucide-react';

const MOCK_TOOLS = [
  {
    id: 1,
    name: 'BCUninstaller',
    description: 'Bulk Crap Uninstaller is a free (as in speech and beer) bulk program uninstaller with advanced automation.',
    url: 'https://www.bcuninstaller.com/',
    author: 'Klocman',
    tags: ['Utility', 'Windows', 'Open Source'],
    color: 'from-cyan-500 to-blue-600'
  },
  {
    id: 2,
    name: 'OBS Studio',
    description: 'Free and open source software for video recording and live streaming.',
    url: 'https://obsproject.com/',
    author: 'OBS Project',
    tags: ['Media', 'Streaming', 'Open Source'],
    color: 'from-fuchsia-500 to-purple-600'
  },
  {
    id: 3,
    name: 'VS Code',
    description: 'Code editing. Redefined. Free. Built on open source. Runs everywhere.',
    url: 'https://code.visualstudio.com/',
    author: 'Microsoft',
    tags: ['Development', 'Editor'],
    color: 'from-emerald-400 to-teal-600'
  }
];

export default function Tools() {
  const [search, setSearch] = useState('');

  const filteredTools = MOCK_TOOLS.filter(tool =>
    tool.name.toLowerCase().includes(search.toLowerCase()) ||
    tool.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-display)' }}>Recommended Tools</h1>
          <p className="text-stone-400 mt-1">Curated software and open source projects</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
            <input
              type="text"
              placeholder="Search tools or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-stone-900 border border-stone-800 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm text-stone-200 placeholder:text-stone-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-bold hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(245,158,11,0.3)] whitespace-nowrap">
            <Plus size={18} />
            <span className="hidden sm:inline">Add Tool</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool, i) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-stone-900 rounded-3xl overflow-hidden shadow-lg border border-stone-800 flex flex-col group hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] transition-all"
          >
            <div className={`h-24 bg-gradient-to-r ${tool.color} p-6 flex items-end relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/20" />
              <h3 className="text-2xl font-bold text-white relative z-10">{tool.name}</h3>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="text-sm font-medium text-amber-400 mb-3">By {tool.author}</div>
              <p className="text-stone-300 mb-6 flex-1">{tool.description}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {tool.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-800 border border-stone-700 text-stone-300 text-xs font-medium">
                    <Tag size={12} />
                    {tag}
                  </span>
                ))}
              </div>

              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-white rounded-xl font-bold transition-colors border border-stone-700 hover:border-amber-500/50"
              >
                <span>Visit Website</span>
                <ExternalLink size={16} />
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
