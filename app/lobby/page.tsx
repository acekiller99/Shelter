'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Mic, MicOff, MonitorUp, Video, VideoOff, Users, Settings, LogOut, MessageSquare, Minimize2 } from 'lucide-react';
import Image from 'next/image';
import { useGlobal } from '@/components/GlobalContext';
import { useRouter } from 'next/navigation';

const MOCK_PARTICIPANTS = [
  { id: 1, name: 'You', avatar: 'https://picsum.photos/seed/you/100/100', isMuted: false, isSpeaking: true },
  { id: 2, name: 'Sarah Miller', avatar: 'https://picsum.photos/seed/sarah/100/100', isMuted: true, isSpeaking: false },
  { id: 3, name: 'Alex Chen', avatar: 'https://picsum.photos/seed/alex/100/100', isMuted: false, isSpeaking: false },
  { id: 4, name: 'David Kim', avatar: 'https://picsum.photos/seed/david/100/100', isMuted: true, isSpeaking: false },
];

export default function VoiceLobby() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const { setIsLobbyMinimized } = useGlobal();
  const router = useRouter();

  const handleMinimize = () => {
    setIsLobbyMinimized(true);
    router.push('/');
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-[#0c0a09] text-stone-100 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="h-16 border-b border-stone-800 flex items-center justify-between px-6 shrink-0 bg-stone-900/80 backdrop-blur-xl z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Gaming Lounge</h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-stone-800/50 border border-stone-700 rounded-full text-sm font-medium text-emerald-400">
            <Users size={16} />
            <span>4 Online</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleMinimize} className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors" title="Minimize to PiP">
            <Minimize2 size={20} />
          </button>
          <button className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden z-10">
        {/* Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          {isScreenSharing ? (
            <div className="h-full flex flex-col gap-4">
              <div className="flex-1 bg-stone-900/80 backdrop-blur-sm rounded-3xl border border-stone-700 overflow-hidden relative flex items-center justify-center shadow-2xl">
                <div className="text-stone-500 flex flex-col items-center gap-4">
                  <MonitorUp size={48} className="text-amber-500/50" />
                  <p className="text-lg font-medium">You are sharing your screen</p>
                </div>
                <div className="absolute bottom-4 left-4 bg-stone-900/80 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-medium border border-stone-700">
                  Your Screen
                </div>
              </div>
              <div className="h-48 flex gap-4 overflow-x-auto pb-2">
                {MOCK_PARTICIPANTS.map((p) => (
                  <div key={p.id} className="w-48 shrink-0 bg-stone-900/80 backdrop-blur-sm rounded-2xl border border-stone-700 relative overflow-hidden flex items-center justify-center">
                    <Image src={p.avatar} alt={p.name} width={64} height={64} className="rounded-full border-2 border-stone-800" referrerPolicy="no-referrer" />
                    <div className="absolute bottom-2 left-2 bg-stone-900/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-medium truncate max-w-[calc(100%-1rem)] border border-stone-700">
                      {p.name}
                    </div>
                    {p.isMuted && (
                      <div className="absolute top-2 right-2 bg-red-500/80 backdrop-blur-md p-1.5 rounded-full text-white">
                        <MicOff size={14} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 h-full auto-rows-fr">
              {MOCK_PARTICIPANTS.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`bg-stone-900/80 backdrop-blur-sm rounded-3xl border ${p.isSpeaking ? 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'border-stone-800'} relative overflow-hidden flex items-center justify-center group transition-all`}
                >
                  <div className={`relative ${p.isSpeaking ? 'animate-pulse' : ''}`}>
                    <Image src={p.avatar} alt={p.name} width={120} height={120} className={`rounded-full object-cover border-4 ${p.isSpeaking ? 'border-amber-500' : 'border-stone-800'}`} referrerPolicy="no-referrer" />
                  </div>

                  <div className="absolute bottom-4 left-4 bg-stone-900/80 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 border border-stone-700">
                    {p.name}
                  </div>

                  <div className="absolute top-4 right-4 flex gap-2">
                    {p.isMuted ? (
                      <div className="bg-red-500/80 backdrop-blur-md p-2 rounded-full text-white">
                        <MicOff size={16} />
                      </div>
                    ) : (
                      <div className="bg-stone-900/80 backdrop-blur-md p-2 rounded-full text-emerald-400 border border-stone-700">
                        <Mic size={16} />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Side Chat */}
        <div className="hidden xl:flex w-80 border-l border-stone-800 flex-col bg-stone-900/50 backdrop-blur-md">
          <div className="p-4 border-b border-stone-800 font-medium flex items-center gap-2 text-white">
            <MessageSquare size={18} className="text-amber-400" />
            Lobby Chat
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="text-sm">
              <span className="font-bold text-emerald-400">Sarah:</span> Let&apos;s start the game!
            </div>
            <div className="text-sm">
              <span className="font-bold text-amber-400">Alex:</span> Give me a sec, getting a drink.
            </div>
          </div>
          <div className="p-4 border-t border-stone-800">
            <input type="text" placeholder="Type a message..." className="w-full bg-stone-800/50 border border-stone-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 text-white placeholder:text-stone-500 transition-colors" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="h-24 border-t border-stone-800 bg-stone-900/80 backdrop-blur-xl flex items-center justify-center gap-4 px-6 shrink-0 z-10">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white border border-stone-700'}`}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        <button
          onClick={() => setIsVideoOn(!isVideoOn)}
          className={`p-4 rounded-full transition-colors ${!isVideoOn ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white border border-stone-700'}`}
        >
          {!isVideoOn ? <VideoOff size={24} /> : <Video size={24} />}
        </button>

        <button
          onClick={() => setIsScreenSharing(!isScreenSharing)}
          className={`p-4 rounded-full transition-colors ${isScreenSharing ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white border border-stone-700'}`}
        >
          <MonitorUp size={24} />
        </button>

        <div className="w-px h-10 bg-stone-800 mx-2"></div>

        <button className="px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold transition-colors flex items-center gap-2 shadow-lg shadow-red-500/20">
          <LogOut size={20} />
          <span className="hidden sm:inline">Leave Lobby</span>
        </button>
      </div>
    </div>
  );
}
