'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Mic, Settings, User, Bot, Paperclip, MoreVertical } from 'lucide-react';
import Image from 'next/image';

const MOCK_MESSAGES = [
  { id: 1, text: 'Hey, how are you doing?', sender: 'user', time: '10:00 AM' },
  { id: 2, text: 'I\'m doing great! Just testing out this new chat system.', sender: 'me', time: '10:02 AM' },
  { id: 3, text: 'That sounds awesome. Does it support AI integration?', sender: 'user', time: '10:05 AM' },
  { id: 4, text: 'Yes, you can chat with the AI using your own API key!', sender: 'me', time: '10:06 AM' },
];

export default function Chat() {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'ai'>('users');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), text: input, sender: 'me', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setInput('');
  };

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row bg-[#0c0a09]">
      {/* Sidebar / Contact List */}
      <div className="w-full md:w-80 bg-stone-900 border-r border-stone-800 flex flex-col h-full">
        <div className="p-4 border-b border-stone-800">
          <h2 className="text-2xl font-bold tracking-tight mb-4 text-white" style={{ fontFamily: 'var(--font-display)' }}>Messages</h2>
          <div className="flex bg-stone-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'users' ? 'bg-stone-700 shadow-sm text-white' : 'text-stone-400 hover:text-stone-200'}`}
            >
              Friends
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'ai' ? 'bg-stone-700 shadow-sm text-white' : 'text-stone-400 hover:text-stone-200'}`}
            >
              AI Assistant
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {activeTab === 'users' ? (
            <div className="space-y-1">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-800 cursor-pointer border border-stone-700">
                <div className="relative">
                  <Image src="https://picsum.photos/seed/sarah/100/100" alt="Sarah" width={48} height={48} className="rounded-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-stone-800 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white truncate">Sarah Miller</h4>
                    <span className="text-xs text-stone-400">10:06 AM</span>
                  </div>
                  <p className="text-sm text-stone-400 truncate">Yes, you can chat with the AI...</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-800/50 cursor-pointer transition-colors">
                <div className="relative">
                  <Image src="https://picsum.photos/seed/alex/100/100" alt="Alex" width={48} height={48} className="rounded-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-stone-600 border-2 border-stone-900 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-stone-200 truncate">Alex Chen</h4>
                    <span className="text-xs text-stone-500">Yesterday</span>
                  </div>
                  <p className="text-sm text-stone-500 truncate">Let me know when you&apos;re free.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center">
              <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                <Bot size={32} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Shelter AI</h3>
              <p className="text-sm text-stone-400 mb-4">Chat with your personal AI assistant. Configure your API key in settings.</p>
              <button className="px-4 py-2 bg-stone-800 text-white rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors flex items-center justify-center gap-2 mx-auto border border-stone-700">
                <Settings size={16} />
                Configure API Key
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-[#0c0a09] relative">
        {/* Header */}
        <div className="h-16 bg-stone-900 border-b border-stone-800 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <Image src="https://picsum.photos/seed/sarah/100/100" alt="Sarah" width={40} height={40} className="rounded-full object-cover" referrerPolicy="no-referrer" />
            <div>
              <h3 className="font-bold text-white">Sarah Miller</h3>
              <p className="text-xs text-emerald-400 font-medium">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-stone-400">
            <button className="hover:text-white transition-colors"><MoreVertical size={20} /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[75%] ${msg.sender === 'me' ? 'flex-row-reverse' : 'flex-row'}`}>
                <Image
                  src={msg.sender === 'me' ? 'https://picsum.photos/seed/you/100/100' : 'https://picsum.photos/seed/sarah/100/100'}
                  alt={msg.sender}
                  width={32}
                  height={32}
                  className="rounded-full object-cover self-end shrink-0 border border-stone-700"
                  referrerPolicy="no-referrer"
                />
                <div className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`px-5 py-3 rounded-2xl ${msg.sender === 'me'
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-br-sm shadow-lg shadow-amber-900/20'
                        : 'bg-stone-800 border border-stone-700 text-stone-200 rounded-bl-sm shadow-sm'
                      }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-xs text-stone-500 mt-1 px-1">{msg.time}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-stone-900 border-t border-stone-800 shrink-0">
          <div className="max-w-4xl mx-auto flex items-end gap-2">
            <button className="p-3 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors shrink-0">
              <Paperclip size={20} />
            </button>
            <div className="flex-1 bg-stone-800 rounded-3xl flex items-center pr-2 border border-stone-700 focus-within:border-amber-500 focus-within:bg-stone-800 transition-colors">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-transparent px-5 py-3 outline-none text-white placeholder:text-stone-500"
              />
              <button className="p-2 text-stone-400 hover:text-amber-400 transition-colors shrink-0">
                <Mic size={20} />
              </button>
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-lg shadow-amber-500/20"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
