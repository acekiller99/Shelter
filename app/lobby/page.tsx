'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, MonitorUp, Video, VideoOff, Users, Settings, LogOut, MessageSquare, Minimize2, Link2, Check, UserPlus, Radio } from 'lucide-react';
import Image from 'next/image';
import { useGlobal } from '@/components/GlobalContext';
import { useRouter } from 'next/navigation';

interface Participant {
  id: number;
  name: string;
  avatar: string;
  isMuted: boolean;
  isSpeaking: boolean;
  status: 'online' | 'away';
}

const SEED_PARTICIPANTS: Participant[] = [
  { id: 1, name: 'You', avatar: 'https://picsum.photos/seed/you/100/100', isMuted: false, isSpeaking: false, status: 'online' },
  { id: 2, name: 'Sarah Miller', avatar: 'https://picsum.photos/seed/sarah/100/100', isMuted: false, isSpeaking: false, status: 'online' },
  { id: 3, name: 'Alex Chen', avatar: 'https://picsum.photos/seed/alex/100/100', isMuted: true, isSpeaking: false, status: 'online' },
  { id: 4, name: 'David Kim', avatar: 'https://picsum.photos/seed/david/100/100', isMuted: true, isSpeaking: false, status: 'away' },
];

const ROOM_CODE = '8A2B9C';

export default function VoiceLobby() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>(SEED_PARTICIPANTS);
  const [lobbyChat, setLobbyChat] = useState([
    { id: 1, user: 'Sarah', color: 'text-emerald-400', text: "Let's start the game!" },
    { id: 2, user: 'Alex', color: 'text-amber-400', text: 'Give me a sec, getting a drink.' },
    { id: 3, user: 'David', color: 'text-blue-400', text: 'GGs everyone 🎮' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [copied, setCopied] = useState(false);
  const { setIsLobbyMinimized } = useGlobal();
  const router = useRouter();
  const [isPTT, setIsPTT] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const speakTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Simulate random participant speaking activity
  useEffect(() => {
    if (isPTT) return; // PTT mode overrides simulation for "You"
    const cycle = () => {
      setParticipants(prev => prev.map((p, i) => ({
        ...p,
        isSpeaking: i === 0 ? !isMuted : (i > 0 && !p.isMuted && Math.random() < 0.25),
      })));
      speakTimerRef.current = setTimeout(cycle, 2000 + Math.random() * 2000);
    };
    speakTimerRef.current = setTimeout(cycle, 1500);
    return () => { if (speakTimerRef.current) clearTimeout(speakTimerRef.current); };
  }, [isMuted]);

  // Update "You" mute state in participants list
  useEffect(() => {
    setParticipants(prev => prev.map(p => p.id === 1 ? { ...p, isMuted, isSpeaking: isMuted ? false : p.isSpeaking } : p));
  }, [isMuted]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lobbyChat]);

  const handleMinimize = () => {
    setIsLobbyMinimized(true);
    router.push('/');
  };

  // Spacebar PTT
  useEffect(() => {
    if (!isPTT) {
      setIsPushing(false);
      setParticipants(prev => prev.map(p => p.id === 1 ? { ...p, isSpeaking: isMuted ? false : p.isSpeaking } : p));
      return;
    }
    const onDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !isMuted) {
        e.preventDefault();
        setIsPushing(true);
        setParticipants(prev => prev.map(p => p.id === 1 ? { ...p, isSpeaking: true } : p));
      }
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsPushing(false);
        setParticipants(prev => prev.map(p => p.id === 1 ? { ...p, isSpeaking: false } : p));
      }
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); };
  }, [isPTT, isMuted]);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
      setIsScreenSharing(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = stream;
      setIsScreenSharing(true);
      stream.getVideoTracks()[0].onended = () => { screenStreamRef.current = null; setIsScreenSharing(false); };
    } catch {
      // Permission denied or unsupported — fall back to simulation
      setIsScreenSharing(true);
    }
  }, [isScreenSharing]);

  const startPTTPush = useCallback(() => {
    if (isMuted) return;
    setIsPushing(true);
    setParticipants(prev => prev.map(p => p.id === 1 ? { ...p, isSpeaking: true } : p));
  }, [isMuted]);

  const stopPTTPush = useCallback(() => {
    setIsPushing(false);
    setParticipants(prev => prev.map(p => p.id === 1 ? { ...p, isSpeaking: false } : p));
  }, []);

  const copyInvite = () => {
    navigator.clipboard.writeText(`${window.location.origin}/lobby?room=${ROOM_CODE}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setLobbyChat(prev => [...prev, { id: Date.now(), user: 'You', color: 'text-orange-400', text: chatInput }]);
    setChatInput('');
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-[#0c0a09] text-stone-100 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="h-16 border-b border-stone-800 flex items-center justify-between px-4 md:px-6 shrink-0 bg-stone-900/80 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3 md:gap-4">
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Gaming Lounge</h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-stone-800/50 border border-stone-700 rounded-full text-sm font-medium text-emerald-400">
            <Users size={16} />
            <span>{participants.length} Online</span>
          </div>
          <span className="hidden md:inline text-xs text-stone-500 font-mono bg-stone-800 px-2 py-1 rounded-lg border border-stone-700">#{ROOM_CODE}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyInvite}
            className="flex items-center gap-2 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-sm font-medium transition-colors border border-stone-700">
            {copied ? <Check size={14} className="text-emerald-400" /> : <Link2 size={14} />}
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Invite'}</span>
          </button>
          <button onClick={handleMinimize} className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors" title="Minimize">
            <Minimize2 size={20} />
          </button>
          <button className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden z-10">
        {/* Participant grid */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          {isScreenSharing ? (
            <div className="h-full flex flex-col gap-4">
              <div className="flex-1 bg-stone-900/80 rounded-3xl border border-stone-700 flex items-center justify-center shadow-2xl">
                <div className="text-stone-500 flex flex-col items-center gap-4">
                  <MonitorUp size={48} className="text-amber-500/50" />
                  <p className="text-lg font-medium">You are sharing your screen</p>
                </div>
              </div>
              <div className="h-40 flex gap-3 overflow-x-auto pb-1">
                {participants.map(p => (
                  <ParticipantTile key={p.id} participant={p} mini />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {participants.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}>
                  <ParticipantTile participant={p} />
                </motion.div>
              ))}
              {/* Empty slot with invite */}
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: participants.length * 0.08 }}
                className="min-h-[200px] bg-stone-900/40 rounded-3xl border border-dashed border-stone-700 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group"
                onClick={copyInvite}>
                <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center group-hover:bg-amber-500/10 transition-colors border border-stone-700">
                  <UserPlus size={20} className="text-stone-500 group-hover:text-amber-400 transition-colors" />
                </div>
                <p className="text-sm text-stone-500 group-hover:text-stone-300 transition-colors">Invite a friend</p>
              </motion.div>
            </div>
          )}
        </div>

        {/* Side Chat */}
        <div className="hidden xl:flex w-80 border-l border-stone-800 flex-col bg-stone-900/50 backdrop-blur-md">
          <div className="p-4 border-b border-stone-800 font-medium flex items-center gap-2 text-white">
            <MessageSquare size={18} className="text-amber-400" />
            Lobby Chat
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {lobbyChat.map(msg => (
              <div key={msg.id} className="text-sm">
                <span className={`font-bold ${msg.color}`}>{msg.user}: </span>
                <span className="text-stone-300">{msg.text}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="p-3 border-t border-stone-800">
            <div className="flex gap-2">
              <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                type="text" placeholder="Type a message..."
                className="flex-1 bg-stone-800/50 border border-stone-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500 text-white placeholder:text-stone-500 transition-colors" />
              <button onClick={sendChat} disabled={!chatInput.trim()}
                className="p-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50">
                <MessageSquare size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="h-20 md:h-24 border-t border-stone-800 bg-stone-900/80 backdrop-blur-xl flex items-center justify-center gap-3 md:gap-4 px-4 md:px-6 shrink-0 z-10">
        <ControlBtn active={!isMuted} onClick={() => setIsMuted(!isMuted)} danger={isMuted} aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}>
          {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
        </ControlBtn>
        <ControlBtn active={isVideoOn} onClick={() => setIsVideoOn(!isVideoOn)} danger={!isVideoOn} aria-label={isVideoOn ? 'Turn off camera' : 'Turn on camera'}>
          {!isVideoOn ? <VideoOff size={22} /> : <Video size={22} />}
        </ControlBtn>
        <ControlBtn active={isScreenSharing} onClick={toggleScreenShare} highlight={isScreenSharing} aria-label={isScreenSharing ? 'Stop sharing screen' : 'Share screen'} aria-pressed={isScreenSharing}>
          <MonitorUp size={22} />
        </ControlBtn>
        <ControlBtn active={isPTT} onClick={() => setIsPTT(!isPTT)} highlight={isPTT} aria-label={isPTT ? 'Disable push-to-talk' : 'Enable push-to-talk'} aria-pressed={isPTT}>
          <Radio size={22} />
        </ControlBtn>
        {isPTT && (
          <button
            onMouseDown={startPTTPush}
            onMouseUp={stopPTTPush}
            onTouchStart={startPTTPush}
            onTouchEnd={stopPTTPush}
            aria-label={isPushing ? 'Release to stop talking' : 'Hold to talk (push-to-talk)'}
            aria-pressed={isPushing}
            className={`px-3 md:px-4 py-3 md:py-4 rounded-full font-bold transition-all border text-xs md:text-sm select-none ${
              isPushing
                ? 'bg-amber-500 text-white border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-95'
                : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
            }`}>
            {isPushing ? '🎙️ Talking' : '🎙️ Hold'}
          </button>
        )}
        <div className="w-px h-10 bg-stone-800 mx-1" />
        <button onClick={handleMinimize}
          className="px-4 md:px-6 py-3 md:py-4 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold transition-colors flex items-center gap-2 shadow-lg shadow-red-500/20 text-sm md:text-base">
          <LogOut size={18} />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>
    </div>
  );
}

function ParticipantTile({ participant: p, mini = false }: { participant: Participant; mini?: boolean }) {
  return (
    <div className={`${mini ? 'w-36 h-36' : 'min-h-[180px] md:min-h-[220px]'} bg-stone-900/80 backdrop-blur-sm rounded-2xl md:rounded-3xl border ${
      p.isSpeaking ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)]' : 'border-stone-800'
    } relative overflow-hidden flex flex-col items-center justify-center gap-3 transition-all duration-300`}>
      <div className={`relative ${p.isSpeaking ? 'scale-105' : ''} transition-transform duration-300`}>
        {p.isSpeaking && (
          <div className="absolute inset-0 rounded-full border-2 border-amber-500 animate-ping opacity-50" />
        )}
        <Image src={p.avatar} alt={p.name} width={mini ? 56 : 80} height={mini ? 56 : 80}
          className={`rounded-full object-cover border-4 ${p.isSpeaking ? 'border-amber-500' : 'border-stone-700'} relative z-10`}
          referrerPolicy="no-referrer" />
        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-stone-900 z-20 ${p.status === 'online' ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
      </div>
      {!mini && <p className="text-sm font-semibold text-white px-2 truncate max-w-full text-center">{p.name}</p>}
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        {p.isMuted && (
          <div className="bg-red-500/80 backdrop-blur-md p-1.5 rounded-full">
            <MicOff size={12} />
          </div>
        )}
        {p.isSpeaking && !p.isMuted && (
          <div className="bg-amber-500/80 backdrop-blur-md p-1.5 rounded-full">
            <Mic size={12} />
          </div>
        )}
      </div>
      {mini && (
        <div className="absolute bottom-1 left-1 right-1 bg-stone-900/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-medium truncate text-center border border-stone-700">
          {p.name}
        </div>
      )}
    </div>
  );
}

function ControlBtn({ children, onClick, active, danger, highlight, 'aria-label': ariaLabel, 'aria-pressed': ariaPressed }: {
  children: React.ReactNode; onClick: () => void; active?: boolean; danger?: boolean; highlight?: boolean;
  'aria-label'?: string; 'aria-pressed'?: boolean;
}) {
  return (
    <button onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      className={`p-3 md:p-4 rounded-full transition-all font-medium ${
        highlight ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
        : danger ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
        : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white border border-stone-700'
      }`}>
      {children}
    </button>
  );
}

