'use client';

import { motion } from 'motion/react';
import { Play, Users, Trophy, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const GAMES = [
  {
    id: 'poker',
    title: 'Texas Hold\'em Poker',
    description: 'Play casual poker with your friends. No installation required.',
    image: 'https://picsum.photos/seed/pokergame/600/400',
    players: '2-8 Players',
    genre: 'Card Game',
    status: 'Play Now',
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'rpg',
    title: 'Dungeon Crawler RPG',
    description: 'Grind dungeons, collect loot, and level up with your party.',
    image: 'https://picsum.photos/seed/rpggame/600/400',
    players: '1-4 Players',
    genre: 'Action RPG',
    status: 'Coming Soon',
    color: 'from-indigo-500 to-purple-600'
  }
];

export default function Games() {
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-display)' }}>Game Center</h1>
        <p className="text-stone-400 mt-1">Play multiplayer games directly in your browser</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {GAMES.map((game, i) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-stone-900 rounded-3xl overflow-hidden shadow-lg border border-stone-800 group hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] hover:border-amber-500/50 transition-all duration-300"
          >
            <div className="relative h-64 w-full overflow-hidden">
              <div className="absolute inset-0 bg-stone-900/40 group-hover:bg-transparent transition-colors z-10" />
              <Image 
                src={game.image} 
                alt={game.title} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-500" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 z-20">
                <span className="px-3 py-1 bg-stone-900/80 backdrop-blur-md text-amber-400 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm border border-amber-500/30">
                  {game.genre}
                </span>
              </div>
            </div>
            
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">{game.title}</h2>
                <div className="flex items-center gap-1 text-amber-400">
                  <Star size={18} fill="currentColor" />
                  <span className="font-bold">4.8</span>
                </div>
              </div>
              
              <p className="text-stone-300 mb-6 text-lg">{game.description}</p>
              
              <div className="flex items-center gap-6 mb-8 text-sm font-medium text-stone-400">
                <div className="flex items-center gap-2">
                  <Users size={18} />
                  <span>{game.players}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy size={18} />
                  <span>Leaderboards</span>
                </div>
              </div>
              
              {game.status === 'Play Now' ? (
                <Link href={`/games/${game.id}`} className="block">
                  <button 
                    className={`w-full py-4 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-2 bg-gradient-to-r ${game.color} hover:opacity-90 transition-opacity shadow-lg`}
                  >
                    <Play size={20} fill="currentColor" />
                    <span>Play Now</span>
                  </button>
                </Link>
              ) : (
                <button 
                  className={`w-full py-4 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-2 bg-gradient-to-r ${game.color} opacity-50 cursor-not-allowed shadow-lg`}
                  disabled
                >
                  <span>Coming Soon</span>
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
