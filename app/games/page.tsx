'use client';

import { motion } from 'motion/react';
import { Play, Users, Trophy, Star, Medal } from 'lucide-react';
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
    description: 'Grind dungeons, collect loot, and level up your hero.',
    image: 'https://picsum.photos/seed/rpggame/600/400',
    players: '1 Player',
    genre: 'Action RPG',
    status: 'Play Now',
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

      {/* Leaderboard */}
      <div className="mt-12">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="text-amber-400" size={22} />
          <h2 className="text-xl font-bold text-white">Global Leaderboard</h2>
          <span className="text-xs px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20 font-medium">Poker</span>
        </div>
        <div className="bg-stone-900 rounded-3xl border border-stone-800 divide-y divide-stone-800 overflow-hidden">
          {LEADERBOARD.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className="flex items-center gap-4 px-5 py-4 hover:bg-stone-800/50 transition-colors"
            >
              <div className="w-8 flex justify-center">
                {i === 0 ? <span className="text-xl">🥇</span>
                  : i === 1 ? <span className="text-xl">🥈</span>
                  : i === 2 ? <span className="text-xl">🥉</span>
                  : <span className="text-stone-500 font-bold text-sm">#{i + 1}</span>}
              </div>
              <img src={`https://picsum.photos/seed/${p.avatar}/80/80`} alt={p.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-stone-700" referrerPolicy="no-referrer" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{p.name}</p>
                <p className="text-xs text-stone-400">{p.wins} wins · {p.games} games</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-amber-400">${p.chips.toLocaleString()}</p>
                <p className="text-xs text-stone-400">{p.wr}% win rate</p>
              </div>
              {i < 3 && (
                <Medal size={16} className={i === 0 ? 'text-amber-400' : i === 1 ? 'text-stone-300' : 'text-amber-700'} />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const LEADERBOARD = [
  { name: 'NightOwl99',  avatar: 'lb1',  chips: 48200, wins: 87, games: 120, wr: 72 },
  { name: 'Sarah M.',    avatar: 'lb2',  chips: 41800, wins: 74, games: 105, wr: 70 },
  { name: 'BluffKing',   avatar: 'lb3',  chips: 37500, wins: 63, games:  95, wr: 66 },
  { name: 'Alex T.',     avatar: 'lb4',  chips: 31200, wins: 55, games:  90, wr: 61 },
  { name: 'RiverQueen',  avatar: 'lb5',  chips: 27900, wins: 49, games:  85, wr: 57 },
  { name: 'PokerFace22', avatar: 'lb6',  chips: 22400, wins: 40, games:  80, wr: 50 },
  { name: 'YouPlayHere', avatar: 'lb7',  chips: 18100, wins: 32, games:  70, wr: 45 },
];
