'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Mic, Maximize2, X, Users } from 'lucide-react';
import { useGlobal } from './GlobalContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export function FloatingLobby() {
  const { isLobbyMinimized, setIsLobbyMinimized } = useGlobal();
  const router = useRouter();

  const handleMaximize = () => {
    setIsLobbyMinimized(false);
    router.push('/lobby');
  };

  const handleClose = () => {
    setIsLobbyMinimized(false);
  };

  return (
    <AnimatePresence>
      {isLobbyMinimized && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.1}
          className="fixed bottom-24 left-6 z-50 w-64 bg-stone-900/90 backdrop-blur-xl border border-stone-700/50 rounded-2xl shadow-2xl overflow-hidden cursor-move"
        >
          <div className="h-10 bg-stone-800/80 border-b border-stone-700/50 flex items-center justify-between px-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Gaming Lounge
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleMaximize} className="p-1 text-stone-400 hover:text-white hover:bg-stone-700 rounded transition-colors">
                <Maximize2 size={14} />
              </button>
              <button onClick={handleClose} className="p-1 text-stone-400 hover:text-red-400 hover:bg-stone-700 rounded transition-colors">
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="p-3 flex items-center justify-between">
            <div className="flex -space-x-2">
              <Image src="https://picsum.photos/seed/you/100/100" alt="You" width={32} height={32} className="rounded-full border-2 border-stone-900" referrerPolicy="no-referrer" />
              <Image src="https://picsum.photos/seed/sarah/100/100" alt="Sarah" width={32} height={32} className="rounded-full border-2 border-stone-900" referrerPolicy="no-referrer" />
              <Image src="https://picsum.photos/seed/alex/100/100" alt="Alex" width={32} height={32} className="rounded-full border-2 border-stone-900" referrerPolicy="no-referrer" />
              <div className="w-8 h-8 rounded-full border-2 border-stone-900 bg-stone-800 flex items-center justify-center text-xs font-bold text-stone-400">
                +1
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-emerald-400 hover:bg-stone-700 transition-colors">
                <Mic size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
