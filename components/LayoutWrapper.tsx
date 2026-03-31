'use client';

import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './Sidebar';
import { GlobalProvider } from './GlobalContext';
import { FloatingChat } from './FloatingChat';
import { FloatingLobby } from './FloatingLobby';

function PageTransition({ children, pathname }: { children: React.ReactNode; pathname: string }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18, ease: 'easeInOut' }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullScreenPage = pathname === '/auth' || pathname === '/lobby';

  return (
    <GlobalProvider>
      {isFullScreenPage ? (
        <main className="min-h-screen">
          <PageTransition pathname={pathname}>{children}</PageTransition>
        </main>
      ) : (
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 md:ml-64 min-h-screen pt-14 md:pt-0">
            <PageTransition pathname={pathname}>{children}</PageTransition>
          </main>
          <FloatingChat />
          <FloatingLobby />
        </div>
      )}
    </GlobalProvider>
  );
}
