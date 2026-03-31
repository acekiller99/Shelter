'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { BellRing, Gamepad2, MonitorPlay, Moon, CircleDot, UserCheck, UserMinus } from 'lucide-react';
import { useGlobal } from './GlobalContext';

export function UserHoverCard({ user, children }: { user: any, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { followedUsers, toggleFollow, currentUser } = useGlobal();

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 300);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'gaming': return <Gamepad2 size={14} className="text-fuchsia-400" />;
      case 'watching': return <MonitorPlay size={14} className="text-purple-400" />;
      case 'busy': return <Moon size={14} className="text-red-400" />;
      default: return <CircleDot size={14} className="text-emerald-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'gaming': return 'Playing Dungeon Crawler';
      case 'watching': return 'Watching a stream';
      case 'busy': return 'Do not disturb';
      default: return 'Online';
    }
  };

  return (
    <div className="relative inline-block" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
          >
            <div className="h-16 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />
            <div className="px-4 pb-4 relative">
              <div className="absolute -top-8 left-4 rounded-full border-4 border-stone-900 bg-stone-800">
                <Image src={user.avatar} alt={user.name} width={48} height={48} className="rounded-full object-cover w-12 h-12" referrerPolicy="no-referrer" />
              </div>
              <div className="pt-8">
                <h4 className="font-bold text-white flex items-center gap-2">
                  {user.name}
                </h4>
                <p className="text-xs text-stone-400 mb-2">{user.handle}</p>

                <div className="flex items-center gap-2 mb-3 bg-stone-800/50 p-2 rounded-lg border border-stone-700/50">
                  {getStatusIcon(user.status || 'online')}
                  <span className="text-xs font-medium text-stone-300">{getStatusText(user.status || 'online')}</span>
                </div>

                <p className="text-sm text-stone-300 mb-4 line-clamp-2">
                  {user.bio || "Just exploring the Nexus. Always down for a game of poker!"}
                </p>
                <button
                  onClick={() => alert(`Nudged ${user.name}!`)}
                  className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-amber-400 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-stone-700 hover:border-amber-500/30"
                >
                  <BellRing size={16} />
                  Nudge
                </button>
                {user.handle !== currentUser.handle && (
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFollow(user.handle); }}
                    className={`w-full mt-2 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors border ${
                      followedUsers.has(user.handle)
                        ? 'bg-stone-800 text-stone-300 border-stone-600 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                    }`}
                  >
                    {followedUsers.has(user.handle) ? <UserMinus size={16} /> : <UserCheck size={16} />}
                    {followedUsers.has(user.handle) ? 'Unfollow' : 'Follow'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
