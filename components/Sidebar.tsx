'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Wrench, 
  Gamepad2, 
  MessageSquare, 
  Calendar, 
  Mic, 
  LogOut,
  Menu,
  X,
  Newspaper,
  Tent,
  UserCircle,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Feed', href: '/', icon: Home },
  { name: 'Tools', href: '/tools', icon: Wrench },
  { name: 'Games', href: '/games', icon: Gamepad2 },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Timetable', href: '/timetable', icon: Calendar },
  { name: 'News', href: '/news', icon: Newspaper },
  { name: 'Profile', href: '/profile', icon: UserCircle },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-stone-800 text-white rounded-full shadow-md border border-stone-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <motion.div 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-[#0c0a09]/95 backdrop-blur-xl border-r border-stone-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(245,158,11,0.5)]">
            <Tent size={24} />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500" style={{ fontFamily: 'var(--font-display)' }}>
            Shelter
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors relative overflow-hidden",
                    isActive ? "text-amber-400 font-medium" : "text-stone-400 hover:bg-stone-800/50 hover:text-stone-200"
                  )}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute inset-0 bg-amber-950/50 rounded-xl border border-amber-900/50"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon size={20} className="relative z-10" />
                  <span className="relative z-10">{item.name}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 space-y-4">
          <Link href="/lobby" onClick={() => setIsOpen(false)}>
            <button className="w-full relative group overflow-hidden rounded-xl p-[1px]">
              <span className="absolute inset-0 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 bg-[length:200%_auto] animate-gradient" />
              <div className="relative bg-stone-900 px-4 py-3 rounded-xl flex items-center gap-3 transition-all group-hover:bg-stone-800/50">
                <Mic className="text-amber-400" />
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Voice Lobby</span>
              </div>
            </button>
          </Link>

          <div className="border-t border-stone-800 pt-4">
            <Link href="/auth">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.div>
    </>
  );
}
