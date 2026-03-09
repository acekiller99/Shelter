'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface GlobalContextType {
  isChatOpen: boolean;
  setIsChatOpen: (v: boolean) => void;
  isLobbyMinimized: boolean;
  setIsLobbyMinimized: (v: boolean) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLobbyMinimized, setIsLobbyMinimized] = useState(false);

  return (
    <GlobalContext.Provider value={{ isChatOpen, setIsChatOpen, isLobbyMinimized, setIsLobbyMinimized }}>
      {children}
    </GlobalContext.Provider>
  );
}

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error('useGlobal must be used within GlobalProvider');
  return context;
};
