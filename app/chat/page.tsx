'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Mic, MicOff, Settings, Bot, Paperclip, MoreVertical, X, Loader2, CheckCheck, Check, ImageIcon, FileText, Square } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useGlobal } from '@/components/GlobalContext';

interface Message {
  id: number;
  text: string;
  sender: 'me' | 'user' | 'ai';
  time: string;
  isLoading?: boolean;
  read?: boolean;
  attachment?: { type: 'image' | 'file'; url: string; name: string };
}

const STORAGE_KEY = 'shelter_chat_messages';
const AI_STORAGE_KEY = 'shelter_ai_messages';

const INITIAL_MESSAGES: Message[] = [
  { id: 1, text: 'Hey, how are you doing?', sender: 'user', time: '10:00 AM', read: true },
  { id: 2, text: "I'm doing great! Just testing out this new chat system.", sender: 'me', time: '10:02 AM', read: true },
  { id: 3, text: 'Does it support AI integration?', sender: 'user', time: '10:05 AM', read: true },
  { id: 4, text: 'Yes, switch to the AI tab and configure your Gemini API key in Settings!', sender: 'me', time: '10:06 AM', read: true },
];

const AI_INITIAL: Message[] = [
  { id: 0, text: "Hi! I'm Shelter AI. Configure your Gemini API key in Settings to start chatting. I can help with studying, planning, coding, and more!", sender: 'ai', time: 'now' },
];

const AUTO_REPLIES = [
  "That's interesting! Tell me more 😊",
  "Haha nice! I was just thinking the same thing.",
  "Got it 👍",
  "Are you free later to hop on a call?",
  "Have you checked the new tools section?",
  "Sounds good!",
];

export default function Chat() {
  const { currentUser, settings } = useGlobal();

  const loadMessages = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    } catch { return INITIAL_MESSAGES; }
  };

  const loadAiMessages = () => {
    try {
      const saved = localStorage.getItem(AI_STORAGE_KEY);
      return saved ? JSON.parse(saved) : AI_INITIAL;
    } catch { return AI_INITIAL; }
  };

  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [aiMessages, setAiMessages] = useState<Message[]>(loadAiMessages);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'ai'>('users');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [attachmentPreview, setAttachmentPreview] = useState<{ url: string; name: string; type: 'image' | 'file' } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Persist messages
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(aiMessages));
  }, [aiMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    aiEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleSend = useCallback(() => {
    if (!input.trim() && !attachmentPreview) return;
    if (activeTab === 'users') {
      const msg: Message = {
        id: Date.now(),
        text: input,
        sender: 'me',
        time: now(),
        read: false,
        ...(attachmentPreview ? { attachment: attachmentPreview } : {}),
      };
      setMessages(prev => [...prev, msg]);
      setInput('');
      setAttachmentPreview(null);

      // Simulate typing indicator then auto-reply
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      setIsTyping(true);
      typingTimerRef.current = setTimeout(() => {
        setIsTyping(false);
        const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
        setMessages(prev => {
          const updated = prev.map(m => m.sender === 'me' ? { ...m, read: true } : m);
          return [...updated, { id: Date.now() + 1, text: reply, sender: 'user', time: now(), read: true }];
        });
      }, 1500 + Math.random() * 1000);
    } else {
      sendAiMessage(input);
      setInput('');
    }
  }, [input, activeTab, attachmentPreview]);

  const sendAiMessage = async (text: string) => {
    const userMsg: Message = { id: Date.now(), text, sender: 'me', time: now() };
    setAiMessages(prev => [...prev, userMsg]);
    setIsAiLoading(true);

    if (!settings.geminiApiKey) {
      setAiMessages(prev => [...prev, {
        id: Date.now() + 1, sender: 'ai', time: now(),
        text: 'No Gemini API key configured. Please add your key in Settings → Integrations.',
      }]);
      setIsAiLoading(false);
      return;
    }

    try {
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
      setAiMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', time: now(), text: reply }]);
    } catch (err) {
      setAiMessages(prev => [...prev, {
        id: Date.now() + 1, sender: 'ai', time: now(),
        text: err instanceof Error ? `Error: ${err.message}` : 'Something went wrong.',
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAttachmentPreview({ url: ev.target?.result as string, name: file.name, type: isImage ? 'image' : 'file' });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = e => audioChunksRef.current.push(e.data);
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const duration = recordingTime;
        setMessages(prev => [...prev, {
          id: Date.now(), text: `🎙️ Voice message (${duration}s)`, sender: 'me', time: now(), read: false,
          attachment: { type: 'file', url, name: `voice-${duration}s.webm` },
        }]);
        setRecordingTime(0);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      recordingTimerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch {
      alert('Microphone access denied or not available.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecording(false);
  };

  const currentMessages = activeTab === 'users' ? messages : aiMessages;

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row bg-[#0c0a09]">
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-stone-900 border-r border-stone-800 flex flex-col h-full shrink-0">
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
              {[
                { name: 'Sarah Miller', seed: 'sarah', lastMsg: messages.filter(m => m.sender === 'user').at(-1)?.text ?? 'Hey!', time: '10:06 AM', online: true },
                { name: 'Alex Chen', seed: 'alex', lastMsg: 'Let me know when you\'re free.', time: 'Yesterday', online: false },
                { name: 'David Kim', seed: 'david', lastMsg: 'GGs last night 🎮', time: 'Mon', online: false },
              ].map((contact, i) => (
                <div key={contact.seed}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${i === 0 ? 'bg-stone-800 border border-stone-700' : 'hover:bg-stone-800/50'}`}>
                  <div className="relative shrink-0">
                    <Image src={`https://picsum.photos/seed/${contact.seed}/100/100`} alt={contact.name} width={48} height={48} className="rounded-full object-cover" referrerPolicy="no-referrer" />
                    <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-stone-900 rounded-full ${contact.online ? 'bg-emerald-500' : 'bg-stone-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-semibold truncate ${i === 0 ? 'text-white' : 'text-stone-200'}`}>{contact.name}</h4>
                      <span className={`text-xs ${i === 0 ? 'text-stone-400' : 'text-stone-500'}`}>{contact.time}</span>
                    </div>
                    <p className={`text-sm truncate ${i === 0 ? 'text-stone-400' : 'text-stone-500'}`}>{contact.lastMsg}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center">
              <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                <Bot size={32} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Shelter AI</h3>
              <p className="text-sm text-stone-400 mb-4">
                {settings.geminiApiKey ? '✅ Gemini API key configured.' : 'Add your Gemini API key in Settings.'}
              </p>
              {!settings.geminiApiKey && (
                <Link href="/settings" className="px-4 py-2 bg-stone-800 text-white rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors flex items-center justify-center gap-2 border border-stone-700">
                  <Settings size={16} /> Configure API Key
                </Link>
              )}
              {aiMessages.length > 1 && (
                <button onClick={() => { setAiMessages(AI_INITIAL); localStorage.removeItem(AI_STORAGE_KEY); }}
                  className="mt-3 text-xs text-stone-500 hover:text-red-400 transition-colors">
                  Clear AI history
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-[#0c0a09] relative min-w-0">
        {/* Header */}
        <div className="h-16 bg-stone-900 border-b border-stone-800 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            {activeTab === 'users' ? (
              <>
                <div className="relative">
                  <Image src="https://picsum.photos/seed/sarah/100/100" alt="Sarah" width={40} height={40} className="rounded-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-stone-900" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Sarah Miller</h3>
                  <p className="text-xs text-emerald-400 font-medium">{isTyping ? 'typing...' : 'Online'}</p>
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
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
          <AnimatePresence initial={false}>
            {currentMessages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[80%] md:max-w-[70%] ${msg.sender === 'me' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Image
                    src={msg.sender === 'me' ? currentUser.avatar : msg.sender === 'ai' ? 'https://picsum.photos/seed/ai/100/100' : 'https://picsum.photos/seed/sarah/100/100'}
                    alt={msg.sender} width={32} height={32}
                    className="rounded-full object-cover self-end shrink-0 border border-stone-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                    {msg.attachment && (
                      <div className="mb-1 overflow-hidden rounded-2xl border border-stone-700 max-w-[260px]">
                        {msg.attachment.type === 'image' ? (
                          <img src={msg.attachment.url} alt={msg.attachment.name} className="w-full object-cover max-h-48" />
                        ) : (
                          <div className="flex items-center gap-2 px-4 py-3 bg-stone-800 text-sm text-stone-200">
                            <FileText size={16} className="text-amber-400 shrink-0" />
                            <span className="truncate">{msg.attachment.name}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {msg.text && (
                      <div className={`px-4 py-2.5 rounded-2xl ${
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
                    )}
                    <div className={`flex items-center gap-1 mt-1 ${msg.sender === 'me' ? 'flex-row-reverse' : ''}`}>
                      <span className="text-xs text-stone-500 px-1">{msg.time}</span>
                      {msg.sender === 'me' && (
                        msg.read
                          ? <CheckCheck size={12} className="text-amber-400" />
                          : <Check size={12} className="text-stone-500" />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && activeTab === 'users' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="flex justify-start">
                <div className="flex gap-2 items-end">
                  <Image src="https://picsum.photos/seed/sarah/100/100" alt="Sarah" width={32} height={32} className="rounded-full object-cover border border-stone-700" referrerPolicy="no-referrer" />
                  <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-stone-800 border border-stone-700 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:0ms]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:150ms]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI loading indicator */}
          {isAiLoading && activeTab === 'ai' && (
            <div className="flex justify-start">
              <div className="flex gap-2">
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

        {/* Attachment preview */}
        <AnimatePresence>
          {attachmentPreview && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="px-4 pb-2 bg-stone-900 border-t border-stone-800">
              <div className="relative inline-block mt-2">
                {attachmentPreview.type === 'image' ? (
                  <img src={attachmentPreview.url} alt="preview" className="h-20 rounded-xl object-cover border border-stone-700" />
                ) : (
                  <div className="flex items-center gap-2 px-4 py-3 bg-stone-800 rounded-xl text-sm text-stone-200 border border-stone-700">
                    <FileText size={16} className="text-amber-400" />
                    <span>{attachmentPreview.name}</span>
                  </div>
                )}
                <button onClick={() => setAttachmentPreview(null)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white">
                  <X size={12} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <div className="p-3 md:p-4 bg-stone-900 border-t border-stone-800 shrink-0">
          <div className="max-w-4xl mx-auto flex items-end gap-2">
            {/* Hidden file input */}
            <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.txt" className="hidden" onChange={handleFileSelect} />

            {activeTab === 'users' && !isRecording && (
              <button onClick={() => fileInputRef.current?.click()}
                className="p-2.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors shrink-0">
                <Paperclip size={20} />
              </button>
            )}

            {isRecording ? (
              <div className="flex-1 flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-3xl px-5 py-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-400 text-sm font-medium">Recording {recordingTime}s...</span>
                <button onClick={stopRecording} className="ml-auto p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600">
                  <Square size={14} fill="currentColor" />
                </button>
              </div>
            ) : (
              <div className="flex-1 bg-stone-800 rounded-3xl flex items-end border border-stone-700 focus-within:border-amber-500 transition-colors">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder={activeTab === 'ai' ? 'Ask Shelter AI...' : 'Type a message...'}
                  rows={1}
                  className="flex-1 bg-transparent px-4 py-3 outline-none text-white placeholder:text-stone-500 text-sm resize-none max-h-32 overflow-y-auto"
                  style={{ lineHeight: '1.5' }}
                />
                {activeTab === 'users' && (
                  <button onClick={startRecording}
                    className="p-2 m-1 text-stone-400 hover:text-amber-400 transition-colors shrink-0 rounded-full hover:bg-stone-700">
                    <Mic size={18} />
                  </button>
                )}
              </div>
            )}

            <button data-testid="chat-send" onClick={handleSend}
              aria-label="Send message"
              disabled={!input.trim() && !attachmentPreview}
              className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-lg shadow-amber-500/20">
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
