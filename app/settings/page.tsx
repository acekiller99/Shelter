'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Bell, Lock, Eye, EyeOff, Monitor, Key, Shield, Smartphone, Moon, Check, Save, Globe, Users } from 'lucide-react';
import { useGlobal } from '@/components/GlobalContext';

export default function Settings() {
  const { settings, updateSettings } = useGlobal();
  const [activeTab, setActiveTab] = useState('general');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const showSaved = () => {
    setSavedMsg('Saved!');
    setTimeout(() => setSavedMsg(''), 2000);
  };

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
                    <button onClick={showSaved} className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
                      <Save size={16} />
                      Save Changes
                    </button>
                    {savedMsg && <p className="text-emerald-400 text-sm flex items-center gap-2"><Check size={16} /> {savedMsg}</p>}
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

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Theme</h2>
                  <p className="text-stone-400 text-sm mb-4">Choose how Shelter looks to you.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {(['dark', 'light', 'system'] as const).map((theme) => {
                      const labels = { dark: 'Dark', light: 'Light', system: 'System' };
                      const icons = { dark: Moon, light: Monitor, system: Smartphone };
                      const Icon = icons[theme];
                      const isActive = settings.theme === theme;
                      return (
                        <button
                          key={theme}
                          data-testid={`theme-${theme}`}
                          onClick={() => { updateSettings({ theme }); showSaved(); }}
                          className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${
                            isActive
                              ? 'bg-stone-800 border-amber-500/50 ring-1 ring-amber-500/50'
                              : 'bg-stone-800/50 border-stone-700 hover:border-stone-600'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            theme === 'dark' ? 'bg-stone-900 text-white'
                            : theme === 'light' ? 'bg-white text-stone-900'
                            : 'bg-gradient-to-br from-stone-900 to-white text-stone-400'
                          }`}>
                            <Icon size={20} />
                          </div>
                          <span className="font-medium text-stone-200">{labels[theme]}</span>
                          {isActive && <Check size={16} className="text-amber-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {savedMsg && (
                  <motion.p className="text-emerald-400 text-sm flex items-center gap-2">
                    <Check size={16} /> {savedMsg}
                  </motion.p>
                )}
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Privacy Settings</h2>
                  <p className="text-stone-400 text-sm mb-6">Control who can see your profile and content.</p>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-stone-300 mb-2">Profile Visibility</label>
                      <div className="flex flex-col gap-2">
                        {(['public', 'friends', 'private'] as const).map(v => {
                          const icons = { public: Globe, friends: Users, private: Lock };
                          const Icon = icons[v];
                          const labels = { public: 'Public — Anyone can see your profile', friends: 'Friends Only — Only people you follow', private: 'Private — Hidden from everyone' };
                          return (
                            <button
                              key={v}
                              data-testid={`profile-vis-${v}`}
                              onClick={() => { updateSettings({ profileVisibility: v }); showSaved(); }}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                                settings.profileVisibility === v
                                  ? 'bg-stone-800 border-amber-500/50 text-white'
                                  : 'border-stone-700 text-stone-400 hover:bg-stone-800/50'
                              }`}
                            >
                              <Icon size={18} className={settings.profileVisibility === v ? 'text-amber-400' : 'text-stone-500'} />
                              <span className="text-sm">{labels[v]}</span>
                              {settings.profileVisibility === v && <Check size={16} className="text-amber-400 ml-auto" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-300 mb-2">Post Visibility</label>
                      <div className="flex flex-col gap-2">
                        {(['public', 'friends', 'private'] as const).map(v => {
                          const icons = { public: Globe, friends: Users, private: Lock };
                          const Icon = icons[v];
                          const labels = { public: 'Public — Anyone can see your posts', friends: 'Friends Only — Only your followers', private: 'Private — Only you' };
                          return (
                            <button
                              key={v}
                              data-testid={`post-vis-${v}`}
                              onClick={() => { updateSettings({ postVisibility: v }); showSaved(); }}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                                settings.postVisibility === v
                                  ? 'bg-stone-800 border-amber-500/50 text-white'
                                  : 'border-stone-700 text-stone-400 hover:bg-stone-800/50'
                              }`}
                            >
                              <Icon size={18} className={settings.postVisibility === v ? 'text-amber-400' : 'text-stone-500'} />
                              <span className="text-sm">{labels[v]}</span>
                              {settings.postVisibility === v && <Check size={16} className="text-amber-400 ml-auto" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                {savedMsg && (
                  <p className="text-emerald-400 text-sm flex items-center gap-2">
                    <Check size={16} /> {savedMsg}
                  </p>
                )}
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Notification Preferences</h2>
                  <p className="text-stone-400 text-sm mb-6">Choose how and when you want to be notified.</p>
                  <div className="space-y-4">
                    {[
                      { key: 'emailNotifications' as const, label: 'Email Notifications', desc: 'Receive updates, digests, and alerts via email' },
                      { key: 'pushNotifications' as const, label: 'Push Notifications', desc: 'Browser push notifications for real-time alerts' },
                      { key: 'inAppNotifications' as const, label: 'In-App Notifications', desc: 'Notification badge and in-app alerts' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-stone-800/50 rounded-2xl border border-stone-700">
                        <div>
                          <div className="font-medium text-white">{label}</div>
                          <div className="text-sm text-stone-400">{desc}</div>
                        </div>
                        <button
                          data-testid={`toggle-${key}`}
                          onClick={() => { updateSettings({ [key]: !settings[key] }); showSaved(); }}
                          className={`relative w-12 h-6 rounded-full transition-colors ${settings[key] ? 'bg-amber-500' : 'bg-stone-700'}`}
                          role="switch"
                          aria-checked={settings[key]}
                        >
                          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings[key] ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                {savedMsg && (
                  <p className="text-emerald-400 text-sm flex items-center gap-2">
                    <Check size={16} /> {savedMsg}
                  </p>
                )}
              </div>
            )}

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">API Keys</h2>
                  <p className="text-stone-400 text-sm mb-6">Configure your API keys for AI features. Keys are stored locally in your browser.</p>
                  <div className="space-y-4">
                    <div className="bg-stone-800/50 border border-stone-700 rounded-2xl p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                          <Key size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">Gemini API Key</h3>
                          <p className="text-xs text-stone-400">Used for AI Chat and Study Planner</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showGeminiKey ? 'text' : 'password'}
                            placeholder="AIza..."
                            value={settings.geminiApiKey}
                            onChange={e => updateSettings({ geminiApiKey: e.target.value })}
                            data-testid="gemini-api-key"
                            className="w-full bg-stone-900 border border-stone-700 rounded-xl pl-4 pr-12 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors font-mono text-sm"
                          />
                          <button onClick={() => setShowGeminiKey(!showGeminiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300">
                            {showGeminiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        <button onClick={showSaved} className="px-4 py-3 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl hover:bg-amber-500/30 transition-colors font-medium text-sm whitespace-nowrap">
                          Save Key
                        </button>
                      </div>
                    </div>
                    <div className="bg-stone-800/50 border border-stone-700 rounded-2xl p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <Key size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">OpenAI API Key</h3>
                          <p className="text-xs text-stone-400">Used for GPT-based features</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showOpenAIKey ? 'text' : 'password'}
                            placeholder="sk-..."
                            value={settings.openaiApiKey}
                            onChange={e => updateSettings({ openaiApiKey: e.target.value })}
                            data-testid="openai-api-key"
                            className="w-full bg-stone-900 border border-stone-700 rounded-xl pl-4 pr-12 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors font-mono text-sm"
                          />
                          <button onClick={() => setShowOpenAIKey(!showOpenAIKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300">
                            {showOpenAIKey ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        <button onClick={showSaved} className="px-4 py-3 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl hover:bg-amber-500/30 transition-colors font-medium text-sm whitespace-nowrap">
                          Save Key
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {savedMsg && (
                  <p className="text-emerald-400 text-sm flex items-center gap-2">
                    <Check size={16} /> {savedMsg}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
