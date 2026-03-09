'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { GlobalProvider } from './GlobalContext';
import { FloatingChat } from './FloatingChat';
import { FloatingLobby } from './FloatingLobby';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullScreenPage = pathname === '/auth' || pathname === '/lobby';

  return (
    <GlobalProvider>
      {isFullScreenPage ? (
        <main className="min-h-screen">{children}</main>
      ) : (
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 md:ml-64 min-h-screen">
            {children}
          </main>
        </div>
      )}
      <FloatingChat />
      <FloatingLobby />
    </GlobalProvider>
  );
}
