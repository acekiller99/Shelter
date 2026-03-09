'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Bell, Lock, Eye, Monitor, Key, Shield, Smartphone, Moon } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'appearance', label: 'Appearance', icon: Monitor },
    { id: 'privacy', label: 'Privacy & Safety', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Key },
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3" style={{ fontFamily: 'var(--font-display)' }}>
          <SettingsIcon className="text-amber-400" size={32} />
          Settings
        </h1>
        <p className="text-stone-400">Manage your account preferences and application settings</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-2 flex flex-row md:flex-col gap-1 overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-stone-800 text-amber-400 shadow-sm' 
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                }`}
              >
                <tab.icon size={18} className={activeTab === tab.id ? 'text-amber-400' : 'text-stone-500'} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-stone-900 rounded-3xl border border-stone-800 p-6 md:p-8 shadow-xl"
          >
            {activeTab === 'general' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Account Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-400 mb-1.5">Email Address</label>
                      <input 
                        type="email" 
                        defaultValue="alex@example.com" 
                        className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-400 mb-1.5">Username</label>
                      <input 
                        type="text" 
                        defaultValue="alexc" 
                        className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-stone-800">
                  <h2 className="text-xl font-bold text-white mb-4">Danger Zone</h2>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-red-400 font-bold mb-1">Delete Account</h3>
                      <p className="text-sm text-stone-400">Permanently delete your account and all data.</p>
                    </div>
                    <button className="px-4 py-2 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-medium transition-colors border border-red-500/30 shrink-0">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Theme</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {['Dark', 'Light', 'System'].map((theme) => (
                      <button 
                        key={theme}
                        className={`p-4 rounded-2xl border ${theme === 'Dark' ? 'bg-stone-800 border-amber-500/50 ring-1 ring-amber-500/50' : 'bg-stone-800/50 border-stone-700 hover:border-stone-600'} flex flex-col items-center gap-3 transition-all`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${theme === 'Dark' ? 'bg-stone-900 text-white' : theme === 'Light' ? 'bg-white text-stone-900' : 'bg-gradient-to-br from-stone-900 to-white'}`}>
                          {theme === 'Dark' ? <Moon size={20} /> : theme === 'Light' ? <Monitor size={20} /> : <Smartphone size={20} />}
                        </div>
                        <span className="font-medium text-stone-200">{theme}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">API Keys</h2>
                  <p className="text-stone-400 text-sm mb-6">Configure your API keys for AI features and other integrations. Keys are stored securely in your browser.</p>
                  
                  <div className="space-y-4">
                    <div className="bg-stone-800/50 border border-stone-700 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <Key size={20} />
                          </div>
                          <div>
                            <h3 className="font-bold text-white">Gemini API Key</h3>
                            <p className="text-xs text-stone-400">Used for AI Chat and Planner</p>
                          </div>
                        </div>
                      </div>
                      <div className="relative">
                        <input 
                          type="password" 
                          placeholder="Enter your Gemini API Key" 
                          className="w-full bg-stone-900 border border-stone-700 rounded-xl pl-4 pr-12 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors font-mono text-sm"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300">
                          <Eye size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other tabs can be implemented similarly */}
            {(activeTab === 'privacy' || activeTab === 'notifications') && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center text-stone-500 mb-4">
                  <SettingsIcon size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Coming Soon</h3>
                <p className="text-stone-400 max-w-sm">These settings are currently under development and will be available in a future update.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
