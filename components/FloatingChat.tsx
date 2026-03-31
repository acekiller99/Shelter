'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Minus } from 'lucide-react';
import { useGlobal } from './GlobalContext';
import Image from 'next/image';

export function FloatingChat() {
  const { isChatOpen, setIsChatOpen, chatUnreadCount, clearChatUnread, incrementChatUnread } = useGlobal();
  const [isMinimized, setIsMinimized] = useState(false);
  const isMinimizedRef = useRef(false);
  isMinimizedRef.current = isMinimized;
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hey! Ready for the raid later?', sender: 'Alex', isMe: false },
    { id: 2, text: 'Yeah, just finishing up some work.', sender: 'Me', isMe: true },
  ]);

  const AUTO_REPLIES = ['Sounds good!', 'Nice!', "I'll be there!", 'Let me know when you\'re ready.', '👍 Cool!'];

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(prev => [...prev, { id: Date.now(), text: userText, sender: 'Me', isMe: true }]);
    setInput('');
    setTimeout(() => {
      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      setMessages(prev => [...prev, { id: Date.now() + 1, text: reply, sender: 'Alex', isMe: false }]);
      if (isMinimizedRef.current) incrementChatUnread();
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1, height: isMinimized ? 'auto' : 400 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="w-80 bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="h-14 bg-stone-800 border-b border-stone-700 flex items-center justify-between px-4 shrink-0 cursor-pointer" onClick={() => { setIsMinimized(!isMinimized); if (isMinimized) clearChatUnread(); }}>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Image src="https://picsum.photos/seed/alex/100/100" alt="Alex" width={32} height={32} className="rounded-full" referrerPolicy="no-referrer" />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-stone-800"></div>
                </div>
                <span className="font-bold text-white text-sm">Alex Chen</span>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-700 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); if (isMinimized) clearChatUnread(); }}>
                  <Minus size={16} />
                </button>
                <button className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-700 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); setIsChatOpen(false); }}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-900/50">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${msg.isMe ? 'bg-amber-600 text-white rounded-br-sm' : 'bg-stone-800 text-stone-200 rounded-bl-sm border border-stone-700'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-stone-800 border-t border-stone-700 shrink-0">
                  <div className="flex items-center gap-2 bg-stone-900 rounded-xl pr-1 border border-stone-700 focus-within:border-amber-500 transition-colors">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Message..."
                      className="flex-1 bg-transparent px-3 py-2 text-sm text-white outline-none"
                    />
                    <button onClick={handleSend} className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-stone-800 rounded-lg transition-colors">
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!isChatOpen && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setIsChatOpen(true); clearChatUnread(); }}
          className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full shadow-lg shadow-amber-500/30 flex items-center justify-center text-white relative group"
        >
          <MessageSquare size={24} />
          {chatUnreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-stone-900 flex items-center justify-center text-[10px] font-bold">
              {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
            </div>
          )}
        </motion.button>
      )}
    </div>
  );
}
