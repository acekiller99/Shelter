'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Mic, Settings, Bot, Paperclip, MoreVertical, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useGlobal } from '@/components/GlobalContext';

interface Message {
  id: number;
  text: string;
  sender: 'me' | 'user' | 'ai';
  time: string;
  isLoading?: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  { id: 1, text: 'Hey, how are you doing?', sender: 'user', time: '10:00 AM' },
  { id: 2, text: "I'm doing great! Just testing out this new chat system.", sender: 'me', time: '10:02 AM' },
  { id: 3, text: 'Does it support AI integration?', sender: 'user', time: '10:05 AM' },
  { id: 4, text: 'Yes, switch to the AI tab and configure your Gemini API key in Settings!', sender: 'me', time: '10:06 AM' },
];

const AI_INITIAL: Message[] = [
  { id: 0, text: "Hi! I'm Shelter AI. Configure your Gemini API key in Settings to start chatting. I can help with studying, planning, coding, and more!", sender: 'ai', time: 'now' },
];

export default function Chat() {
  const { currentUser, settings } = useGlobal();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [aiMessages, setAiMessages] = useState<Message[]>(AI_INITIAL);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'ai'>('users');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    aiEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  const handleSend = () => {
    if (!input.trim()) return;
    if (activeTab === 'users') {
      setMessages(prev => [...prev, { id: Date.now(), text: input, sender: 'me', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } else {
      sendAiMessage(input);
    }
    setInput('');
  };

  const sendAiMessage = async (text: string) => {
    const userMsg: Message = { id: Date.now(), text, sender: 'me', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setAiMessages(prev => [...prev, userMsg]);
    setIsAiLoading(true);

    if (!settings.geminiApiKey) {
      setAiMessages(prev => [...prev, {
        id: Date.now() + 1, sender: 'ai', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'No Gemini API key configured. Please add your key in Settings → Integrations.',
      }]);
      setIsAiLoading(false);
      return;
    }

    try {
      // Build history for context
      const history = aiMessages.slice(-10).map(m => ({
        role: m.sender === 'me' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${settings.geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [...history, { role: 'user', parts: [{ text }] }],
          generationConfig: { maxOutputTokens: 1024 },
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.';

      setAiMessages(prev => [...prev, {
        id: Date.now() + 1, sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: reply,
      }]);
    } catch (err) {
      setAiMessages(prev => [...prev, {
        id: Date.now() + 1, sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: err instanceof Error ? `Error: ${err.message}` : 'Something went wrong. Check your API key.',
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const currentMessages = activeTab === 'users' ? messages : aiMessages;

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row bg-[#0c0a09]">
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-stone-900 border-r border-stone-800 flex flex-col h-full">
        <div className="p-4 border-b border-stone-800">
          <h2 className="text-2xl font-bold tracking-tight mb-4 text-white" style={{ fontFamily: 'var(--font-display)' }}>Messages</h2>
          <div className="flex bg-stone-800 p-1 rounded-xl">
            {(['users', 'ai'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab ? 'bg-stone-700 shadow-sm text-white' : 'text-stone-400 hover:text-stone-200'}`}>
                {tab === 'users' ? 'Friends' : 'AI Assistant'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {activeTab === 'users' ? (
            <div className="space-y-1">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-800 cursor-pointer border border-stone-700">
                <div className="relative">
                  <Image src="https://picsum.photos/seed/sarah/100/100" alt="Sarah" width={48} height={48} className="rounded-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-stone-800 rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white truncate">Sarah Miller</h4>
                    <span className="text-xs text-stone-400">10:06 AM</span>
                  </div>
                  <p className="text-sm text-stone-400 truncate">Chat with the AI using your key!</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-800/50 cursor-pointer transition-colors">
                <div className="relative">
                  <Image src="https://picsum.photos/seed/alex/100/100" alt="Alex" width={48} height={48} className="rounded-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-stone-600 border-2 border-stone-900 rounded-full" />
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
              <p className="text-sm text-stone-400 mb-4">
                {settings.geminiApiKey
                  ? '✅ Gemini API key configured. Start chatting!'
                  : 'Add your Gemini API key in Settings to enable AI chat.'}
              </p>
              {!settings.geminiApiKey && (
                <Link href="/settings" className="px-4 py-2 bg-stone-800 text-white rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors flex items-center justify-center gap-2 border border-stone-700">
                  <Settings size={16} /> Configure API Key
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-[#0c0a09] relative">
        {/* Header */}
        <div className="h-16 bg-stone-900 border-b border-stone-800 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            {activeTab === 'users' ? (
              <>
                <Image src="https://picsum.photos/seed/sarah/100/100" alt="Sarah" width={40} height={40} className="rounded-full object-cover" referrerPolicy="no-referrer" />
                <div>
                  <h3 className="font-bold text-white">Sarah Miller</h3>
                  <p className="text-xs text-emerald-400 font-medium">Online</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20">
                  <Bot size={20} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Shelter AI</h3>
                  <p className="text-xs text-stone-400">{settings.geminiApiKey ? 'Gemini 2.0 Flash' : 'No API key'}</p>
                </div>
              </>
            )}
          </div>
          <button className="hover:text-white transition-colors text-stone-400"><MoreVertical size={20} /></button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence initial={false}>
            {currentMessages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[75%] ${msg.sender === 'me' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Image
                    src={msg.sender === 'me' ? currentUser.avatar : msg.sender === 'ai' ? 'https://picsum.photos/seed/ai/100/100' : 'https://picsum.photos/seed/sarah/100/100'}
                    alt={msg.sender}
                    width={32} height={32}
                    className="rounded-full object-cover self-end shrink-0 border border-stone-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-5 py-3 rounded-2xl ${
                      msg.sender === 'me'
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-br-sm shadow-lg shadow-amber-900/20'
                        : msg.sender === 'ai'
                        ? 'bg-gradient-to-r from-fuchsia-900/50 to-purple-900/50 border border-fuchsia-500/20 text-stone-200 rounded-bl-sm'
                        : 'bg-stone-800 border border-stone-700 text-stone-200 rounded-bl-sm shadow-sm'
                    }`}>
                      {msg.isLoading
                        ? <Loader2 size={16} className="animate-spin" />
                        : <span className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</span>}
                    </div>
                    <span className="text-xs text-stone-500 mt-1 px-1">{msg.time}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isAiLoading && activeTab === 'ai' && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[75%]">
                <div className="w-8 h-8 rounded-full bg-fuchsia-500/20 flex items-center justify-center border border-fuchsia-500/20 shrink-0">
                  <Bot size={16} className="text-fuchsia-400" />
                </div>
                <div className="px-5 py-3 rounded-2xl bg-fuchsia-900/30 border border-fuchsia-500/20 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-fuchsia-400" />
                  <span className="text-stone-400 text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={activeTab === 'users' ? messagesEndRef : aiEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-stone-900 border-t border-stone-800 shrink-0">
          <div className="max-w-4xl mx-auto flex items-end gap-2">
            <button className="p-3 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors shrink-0">
              <Paperclip size={20} />
            </button>
            <div className="flex-1 bg-stone-800 rounded-3xl flex items-center pr-2 border border-stone-700 focus-within:border-amber-500 transition-colors">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={activeTab === 'ai' ? 'Ask Shelter AI...' : 'Type a message...'}
                className="flex-1 bg-transparent px-5 py-3 outline-none text-white placeholder:text-stone-500"
              />
              <button className="p-2 text-stone-400 hover:text-amber-400 transition-colors shrink-0">
                <Mic size={20} />
              </button>
            </div>
            <button data-testid="chat-send" onClick={handleSend} disabled={!input.trim()}
              className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-lg shadow-amber-500/20">
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
