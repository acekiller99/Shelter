'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Newspaper, ExternalLink, Clock, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const MOCK_NEWS = [
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

export default function News() {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'Platform Update', 'Industry News', 'Tools & Tech', 'Artificial Intelligence'];

  const filteredNews = activeCategory === 'All'
    ? MOCK_NEWS
    : MOCK_NEWS.filter(news => news.category === activeCategory);

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

        <div className="flex items-center gap-2 bg-stone-900 p-1.5 rounded-2xl border border-stone-800 overflow-x-auto no-scrollbar">
          {categories.map(category => (
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

      {/* Featured Article */}
      {activeCategory === 'All' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 relative rounded-3xl overflow-hidden border border-stone-800 group cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent z-10" />
          <div className="relative h-[400px] w-full">
            <Image
              src={MOCK_NEWS[0].image}
              alt={MOCK_NEWS[0].title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute bottom-0 left-0 w-full p-8 z-20">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                {MOCK_NEWS[0].category}
              </span>
              <span className="flex items-center gap-1 text-stone-300 text-sm">
                <Clock size={14} />
                {MOCK_NEWS[0].time}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-amber-400 transition-colors">
              {MOCK_NEWS[0].title}
            </h2>
            <p className="text-stone-300 max-w-3xl text-lg mb-6 line-clamp-2">
              {MOCK_NEWS[0].summary}
            </p>
            <div className="flex items-center gap-2 text-amber-400 font-medium group-hover:gap-3 transition-all">
              Read Full Article <ExternalLink size={16} />
            </div>
          </div>
        </motion.div>
      )}

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNews.map((news, i) => (
          activeCategory === 'All' && i === 0 ? null : ( // Skip featured article in grid if showing all
            <motion.div
              key={news.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 group hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] transition-all flex flex-col cursor-pointer"
            >
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
            </motion.div>
          )
        ))}
      </div>
    </div>
  );
}
