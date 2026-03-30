'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  email: string;
  avatar: string;
  cover: string;
  bio: string;
  location: string;
  website: string;
  joinDate: string;
  status: string;
  followers: number;
  following: number;
  gamingStats: { gamesPlayed: number; winRate: number; favoriteGame: string };
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  geminiApiKey: string;
  openaiApiKey: string;
  profileVisibility: 'public' | 'friends' | 'private';
  postVisibility: 'public' | 'friends' | 'private';
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
}

const DEFAULT_USER: UserProfile = {
  id: 'user-1',
  name: 'Alex Chen',
  handle: '@alexc',
  email: 'alex@example.com',
  avatar: 'https://picsum.photos/seed/you/200/200',
  cover: 'https://picsum.photos/seed/cover/1200/400',
  bio: 'Just exploring the Shelter. Always down for a game of poker or discussing the latest in web tech!',
  location: 'San Francisco, CA',
  website: 'github.com/alexc',
  joinDate: 'March 2024',
  status: 'online',
  followers: 128,
  following: 64,
  gamingStats: { gamesPlayed: 142, winRate: 58, favoriteGame: "Texas Hold'em" },
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  geminiApiKey: '',
  openaiApiKey: '',
  profileVisibility: 'public',
  postVisibility: 'public',
  emailNotifications: true,
  pushNotifications: false,
  inAppNotifications: true,
};

interface GlobalContextType {
  isChatOpen: boolean;
  setIsChatOpen: (v: boolean) => void;
  isLobbyMinimized: boolean;
  setIsLobbyMinimized: (v: boolean) => void;
  isLoggedIn: boolean;
  currentUser: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  followedUsers: Set<string>;
  toggleFollow: (userId: string) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

function applyTheme(theme: 'dark' | 'light' | 'system') {
  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
  if (isDark) {
    root.classList.remove('light');
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    root.style.colorScheme = 'light';
    root.style.setProperty('--bg-base', '#f5f5f4');
    root.style.setProperty('--text-base', '#1c1917');
  }
}

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLobbyMinimized, setIsLobbyMinimized] = useState(false);
  const [isLoggedIn] = useState(true); // Simulated: always logged in
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_USER);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  // Load persisted state from localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('shelter_user');
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
      const savedSettings = localStorage.getItem('shelter_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings) as AppSettings;
        setSettings(parsed);
        applyTheme(parsed.theme);
      }
      const savedFollows = localStorage.getItem('shelter_follows');
      if (savedFollows) setFollowedUsers(new Set(JSON.parse(savedFollows)));
    } catch { /* ignore */ }
  }, []);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setCurrentUser(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('shelter_user', JSON.stringify(next));
      return next;
    });
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('shelter_settings', JSON.stringify(next));
      if (updates.theme) applyTheme(updates.theme);
      return next;
    });
  };

  const toggleFollow = (userId: string) => {
    setFollowedUsers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      localStorage.setItem('shelter_follows', JSON.stringify([...next]));
      return next;
    });
  };

  return (
    <GlobalContext.Provider value={{
      isChatOpen, setIsChatOpen,
      isLobbyMinimized, setIsLobbyMinimized,
      isLoggedIn, currentUser, updateProfile,
      settings, updateSettings,
      followedUsers, toggleFollow,
    }}>
      {children}
    </GlobalContext.Provider>
  );
}

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error('useGlobal must be used within GlobalProvider');
  return context;
};
