'use client';

import { useState } from 'react';
import { Users, UserPlus, MessageSquare, Settings, Maximize2, Mic, MicOff, Video, VideoOff, Copy, Check, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function GameRoom() {
  const [isCopied, setIsCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showChat, setShowChat] = useState(true);

  const handleCopyLink = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const players = [
    { id: 1, name: 'Alex Chen', avatar: 'https://picsum.photos/seed/you/100/100', isHost: true, isSpeaking: true },
    { id: 2, name: 'Sarah J.', avatar: 'https://picsum.photos/seed/sarah/100/100', isHost: false, isSpeaking: false },
    { id: 3, name: 'Mike T.', avatar: 'https://picsum.photos/seed/mike/100/100', isHost: false, isSpeaking: false },
    { id: 4, name: 'Waiting...', avatar: '', isPlaceholder: true },
  ];

  return (
    <div className="h-[100dvh] flex flex-col bg-[#0c0a09] text-stone-100 overflow-hidden">
      {/* Header */}
      <div className="h-16 border-b border-stone-800 bg-stone-900/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/games" className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="font-bold text-white flex items-center gap-2">
              Texas Hold'em
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[10px] uppercase tracking-wider">Ranked</span>
            </h1>
            <p className="text-xs text-stone-400">Room: #8A2B9C</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-sm font-medium transition-colors border border-stone-700"
          >
            {isCopied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            <span className="hidden sm:inline">{isCopied ? 'Copied!' : 'Invite Link'}</span>
          </button>
          <button className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Game Area */}
        <div className="flex-1 flex flex-col relative">
          {/* The actual game canvas/iframe would go here */}
          <div className="flex-1 bg-stone-950 relative flex items-center justify-center overflow-hidden">
            {/* Placeholder for Game Canvas */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/40 via-stone-950 to-stone-950 pointer-events-none" />
            
            <div className="text-center z-10">
              <div className="w-24 h-24 bg-stone-900 rounded-3xl border border-stone-800 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-500/10">
                <span className="text-4xl">🃏</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>Waiting for players...</h2>
              <p className="text-stone-400 mb-8 max-w-md mx-auto">The game will start automatically when the table is full, or the host can start it manually.</p>
              
              <button className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/20 text-lg">
                Start Game Now
              </button>
            </div>

            {/* Floating Player Avatars around the "table" */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className={`w-16 h-16 rounded-full border-4 ${players[1].isSpeaking ? 'border-amber-500' : 'border-stone-800'} overflow-hidden bg-stone-800 relative shadow-xl`}>
                <Image src={players[1].avatar} alt={players[1].name} fill className="object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="mt-2 bg-stone-900/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-medium border border-stone-700 text-white">
                {players[1].name}
              </div>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className={`w-16 h-16 rounded-full border-4 ${players[0].isSpeaking ? 'border-amber-500' : 'border-stone-800'} overflow-hidden bg-stone-800 relative shadow-xl`}>
                <Image src={players[0].avatar} alt={players[0].name} fill className="object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="mt-2 bg-stone-900/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-medium border border-stone-700 text-amber-400 flex items-center gap-1">
                {players[0].name} (You)
              </div>
            </div>

            <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className={`w-16 h-16 rounded-full border-4 ${players[2].isSpeaking ? 'border-amber-500' : 'border-stone-800'} overflow-hidden bg-stone-800 relative shadow-xl`}>
                <Image src={players[2].avatar} alt={players[2].name} fill className="object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="mt-2 bg-stone-900/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-medium border border-stone-700 text-white">
                {players[2].name}
              </div>
            </div>

            <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-center">
              <button className="w-16 h-16 rounded-full border-4 border-stone-800 border-dashed bg-stone-900/50 flex items-center justify-center text-stone-500 hover:text-amber-400 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all shadow-xl">
                <UserPlus size={24} />
              </button>
              <div className="mt-2 bg-stone-900/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-medium border border-stone-700 text-stone-400">
                Invite
              </div>
            </div>
          </div>

          {/* Game Controls Bar */}
          <div className="h-20 bg-stone-900/90 backdrop-blur-xl border-t border-stone-800 flex items-center justify-between px-6 shrink-0 z-10">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white border border-stone-700'}`}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button 
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${!isVideoOn ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white border border-stone-700'}`}
              >
                {!isVideoOn ? <VideoOff size={20} /> : <Video size={20} />}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowChat(!showChat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors border ${showChat ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-stone-800 text-stone-300 hover:bg-stone-700 border-stone-700'}`}
              >
                <MessageSquare size={18} />
                <span className="hidden sm:inline">Chat</span>
              </button>
              <button className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors">
                <Maximize2 size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Chat/Players */}
        {showChat && (
          <div className="w-80 border-l border-stone-800 bg-stone-900/95 backdrop-blur-xl flex flex-col shrink-0 z-20">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Users size={18} className="text-amber-400" />
                Players (3/4)
              </h3>
            </div>
            
            <div className="p-4 border-b border-stone-800 space-y-3">
              {players.map(p => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {p.isPlaceholder ? (
                      <div className="w-8 h-8 rounded-full border border-stone-700 border-dashed flex items-center justify-center text-stone-600 bg-stone-800/50">
                        <UserPlus size={14} />
                      </div>
                    ) : (
                      <div className="relative">
                        <Image src={p.avatar} alt={p.name} width={32} height={32} className="rounded-full border border-stone-700" referrerPolicy="no-referrer" />
                        {p.isSpeaking && <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-stone-900 animate-pulse" />}
                      </div>
                    )}
                    <span className={`text-sm font-medium ${p.isPlaceholder ? 'text-stone-500' : 'text-stone-200'}`}>{p.name}</span>
                  </div>
                  {p.isHost && <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">Host</span>}
                </div>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Chat Messages */}
              <div className="text-center text-xs text-stone-500 my-2">Game started</div>
              <div className="flex gap-3">
                <Image src={players[1].avatar} alt="Sarah" width={28} height={28} className="rounded-full self-start" referrerPolicy="no-referrer" />
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-stone-200">Sarah J.</span>
                    <span className="text-xs text-stone-500">10:42 AM</span>
                  </div>
                  <p className="text-sm text-stone-300 mt-0.5">Good luck everyone!</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-stone-800 bg-stone-900">
              <div className="bg-stone-800 rounded-xl flex items-center pr-2 border border-stone-700 focus-within:border-amber-500 transition-colors">
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  className="flex-1 bg-transparent px-4 py-2.5 outline-none text-sm text-white placeholder:text-stone-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
