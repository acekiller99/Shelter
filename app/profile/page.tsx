'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Edit3, Camera, MapPin, Link as LinkIcon, Calendar, Gamepad2, MonitorPlay, Moon, Circle, X, Check, UserPlus, UserMinus, Users } from 'lucide-react';
import Image from 'next/image';
import { useGlobal } from '@/components/GlobalContext';

const OTHER_USERS = [
  { id: 'user-sarah', name: 'Sarah Miller', handle: '@sarahm', avatar: 'https://picsum.photos/seed/sarah/200/200', bio: 'Frontend dev & casual gamer.', status: 'online' },
  { id: 'user-alex2', name: 'Alex Chen', handle: '@alexc2', avatar: 'https://picsum.photos/seed/alex2/200/200', bio: 'Backend wizard.', status: 'gaming' },
  { id: 'user-david', name: 'David Kim', handle: '@davidk', avatar: 'https://picsum.photos/seed/david/200/200', bio: 'Always learning.', status: 'away' },
];

const MOCK_ACTIVITY = [
  { id: 1, content: 'Just discovered an amazing new open source tool!', timestamp: '2h ago', likes: 24, comments: 5 },
  { id: 2, content: 'Anyone up for a quick game of Poker tonight?', timestamp: '1 day ago', likes: 12, comments: 8 },
  { id: 3, content: 'The AI timetable planner is incredible.', timestamp: '3 days ago', likes: 56, comments: 14 },
];

function UserRow({ user, followedUsers, onToggleFollow, compact }: {
  user: { id: string; name: string; handle: string; avatar: string; bio: string };
  followedUsers: Set<string>;
  onToggleFollow: (id: string) => void;
  compact?: boolean;
}) {
  const isFollowing = followedUsers.has(user.id);
  return (
    <div className={`flex items-center gap-3 ${compact ? '' : 'p-3 bg-stone-800/30 rounded-2xl border border-stone-700/30'}`}>
      <Image src={user.avatar} alt={user.name} width={40} height={40} className="rounded-full object-cover border border-stone-700 shrink-0" referrerPolicy="no-referrer" />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-white text-sm truncate">{user.name}</div>
        {!compact && <div className="text-xs text-stone-400 truncate">{user.bio}</div>}
      </div>
      <button
        onClick={() => onToggleFollow(user.id)}
        data-testid={`follow-${user.id}`}
        className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
          isFollowing
            ? 'bg-stone-700 text-stone-300 border-stone-600 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30'
            : 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30'
        }`}
      >
        {isFollowing ? <><UserMinus size={12} /> Unfollow</> : <><UserPlus size={12} /> Follow</>}
      </button>
    </div>
  );
}

export default function Profile() {
  const { currentUser, updateProfile, followedUsers, toggleFollow } = useGlobal();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...currentUser });
  const [activeSection, setActiveSection] = useState<'activity' | 'followers' | 'following'>('activity');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const statuses = [
    { id: 'online', label: 'Online', icon: Circle, color: 'text-emerald-500', bg: 'bg-emerald-500' },
    { id: 'busy', label: 'Busy', icon: Circle, color: 'text-red-500', bg: 'bg-red-500' },
    { id: 'gaming', label: 'Gaming', icon: Gamepad2, color: 'text-amber-500', bg: 'bg-amber-500' },
    { id: 'watching', label: 'Watching', icon: MonitorPlay, color: 'text-indigo-500', bg: 'bg-indigo-500' },
    { id: 'away', label: 'Away', icon: Moon, color: 'text-stone-400', bg: 'bg-stone-400' },
  ];

  const currentStatus = statuses.find(s => s.id === currentUser.status) || statuses[0];

  const handleImageUpload = (field: 'avatar' | 'cover', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setEditData(prev => ({ ...prev, [field]: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateProfile(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({ ...currentUser });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 shadow-xl mb-8">
        {/* Cover Photo */}
        <div className="h-48 md:h-64 bg-gradient-to-r from-amber-500/20 to-orange-500/20 relative group">
          <Image
            src={isEditing ? editData.cover : currentUser.cover}
            alt="Cover"
            fill
            className="object-cover opacity-50"
            referrerPolicy="no-referrer"
          />
          {isEditing && (
            <>
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload('cover', e.target.files[0])} />
              <button onClick={() => coverInputRef.current?.click()} className="absolute bottom-4 right-4 p-2 bg-stone-900/80 backdrop-blur-md text-white rounded-xl border border-stone-700 hover:bg-stone-800 transition-colors flex items-center gap-2 text-sm font-medium">
                <Camera size={16} /> Change Cover
              </button>
            </>
          )}
        </div>

        {/* Profile Info */}
        <div className="px-6 md:px-10 pb-10 relative">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 md:-mt-20 mb-6">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-stone-900 bg-stone-800 relative overflow-hidden">
                <Image
                  src={isEditing ? editData.avatar : currentUser.avatar}
                  alt="Profile"
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              {isEditing && (
                <>
                  <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload('avatar', e.target.files[0])} />
                  <button onClick={() => avatarInputRef.current?.click()} className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <Camera size={24} />
                  </button>
                </>
              )}
              <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-stone-900 ${currentStatus.bg}`} />
            </div>

            <div className="flex-1 pt-16 md:pt-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  {isEditing ? (
                    <input
                      value={editData.name}
                      onChange={e => setEditData(p => ({ ...p, name: e.target.value }))}
                      className="text-2xl font-bold bg-stone-800 text-white border border-stone-700 rounded-xl px-3 py-1 w-full mb-1 focus:outline-none focus:border-amber-500"
                    />
                  ) : (
                    <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>{currentUser.name}</h1>
                  )}
                  <p className="text-stone-400 font-medium">{currentUser.handle}</p>
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button onClick={handleSave} className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:opacity-90 flex items-center gap-2">
                        <Check size={16} /> Save
                      </button>
                      <button onClick={handleCancel} className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-xl font-medium border border-stone-700 flex items-center gap-2">
                        <X size={16} /> Cancel
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-xl font-medium transition-colors border border-stone-700 flex items-center gap-2">
                      <Edit3 size={16} /> Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Followers / Following counts */}
          <div className="flex gap-6 mb-6 border-b border-stone-800 pb-6">
            <button onClick={() => setActiveSection('followers')} className={`text-center transition-colors ${activeSection === 'followers' ? 'text-amber-400' : 'text-stone-400 hover:text-white'}`}>
              <div className="text-2xl font-bold text-white">{currentUser.followers}</div>
              <div className="text-sm">Followers</div>
            </button>
            <button onClick={() => setActiveSection('following')} className={`text-center transition-colors ${activeSection === 'following' ? 'text-amber-400' : 'text-stone-400 hover:text-white'}`}>
              <div className="text-2xl font-bold text-white">{currentUser.following}</div>
              <div className="text-sm">Following</div>
            </button>
            <button onClick={() => setActiveSection('activity')} className={`text-center transition-colors ${activeSection === 'activity' ? 'text-amber-400' : 'text-stone-400 hover:text-white'}`}>
              <div className="text-2xl font-bold text-white">{MOCK_ACTIVITY.length}</div>
              <div className="text-sm">Posts</div>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">About Me</h3>
                {isEditing ? (
                  <textarea
                    value={editData.bio}
                    onChange={e => setEditData(p => ({ ...p, bio: e.target.value }))}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-4 text-stone-200 focus:outline-none focus:border-amber-500 transition-colors min-h-[100px] resize-none"
                  />
                ) : (
                  <p className="text-stone-300 leading-relaxed">{currentUser.bio}</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-3">Current Status</h3>
                <div className="flex flex-wrap gap-3">
                  {statuses.map(s => (
                    <button
                      key={s.id}
                      onClick={() => updateProfile({ status: s.id })}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                        currentUser.status === s.id
                          ? `bg-stone-800 border-amber-500/50 text-white shadow-lg`
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                      }`}
                    >
                      <s.icon size={16} className={currentUser.status === s.id ? s.color : 'text-stone-500'} />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {activeSection === 'activity' && (
                  <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <h3 className="text-lg font-bold text-white mb-3">Recent Activity</h3>
                    <div className="space-y-3">
                      {MOCK_ACTIVITY.map(post => (
                        <div key={post.id} className="bg-stone-800/50 border border-stone-700/50 rounded-2xl p-4">
                          <p className="text-stone-300 mb-2">{post.content}</p>
                          <div className="flex items-center gap-4 text-sm text-stone-500">
                            <span>{post.timestamp}</span>
                            <span>❤️ {post.likes}</span>
                            <span>💬 {post.comments}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                {activeSection === 'followers' && (
                  <motion.div key="followers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <h3 className="text-lg font-bold text-white mb-3">Followers</h3>
                    <div className="space-y-3">
                      {OTHER_USERS.slice(0, 2).map(user => (
                        <UserRow key={user.id} user={user} followedUsers={followedUsers} onToggleFollow={toggleFollow} />
                      ))}
                    </div>
                  </motion.div>
                )}
                {activeSection === 'following' && (
                  <motion.div key="following" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <h3 className="text-lg font-bold text-white mb-3">Following</h3>
                    <div className="space-y-3">
                      {OTHER_USERS.map(user => (
                        <UserRow key={user.id} user={user} followedUsers={followedUsers} onToggleFollow={toggleFollow} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-6">
              <div className="bg-stone-800/50 rounded-2xl p-5 border border-stone-700/50">
                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">Details</h3>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-stone-300">
                    <MapPin size={18} className="text-stone-500 shrink-0" />
                    {isEditing ? (
                      <input value={editData.location} onChange={e => setEditData(p => ({ ...p, location: e.target.value }))} className="bg-stone-700 rounded-lg px-2 py-1 text-sm text-white min-w-0 flex-1 focus:outline-none" />
                    ) : <span>{currentUser.location}</span>}
                  </li>
                  <li className="flex items-center gap-3 text-stone-300">
                    <LinkIcon size={18} className="text-stone-500 shrink-0" />
                    {isEditing ? (
                      <input value={editData.website} onChange={e => setEditData(p => ({ ...p, website: e.target.value }))} className="bg-stone-700 rounded-lg px-2 py-1 text-sm text-white min-w-0 flex-1 focus:outline-none" />
                    ) : <a href={`https://${currentUser.website}`} className="text-amber-400 hover:underline truncate">{currentUser.website}</a>}
                  </li>
                  <li className="flex items-center gap-3 text-stone-300">
                    <Calendar size={18} className="text-stone-500" />
                    <span>Joined {currentUser.joinDate}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-stone-800/50 rounded-2xl p-5 border border-stone-700/50">
                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">Gaming Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">Games Played</span>
                    <span className="text-white font-bold">{currentUser.gamingStats.gamesPlayed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">Win Rate</span>
                    <span className="text-emerald-400 font-bold">{currentUser.gamingStats.winRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">Favorite Game</span>
                    <span className="text-amber-400 font-medium">{currentUser.gamingStats.favoriteGame}</span>
                  </div>
                </div>
              </div>

              <div className="bg-stone-800/50 rounded-2xl p-5 border border-stone-700/50">
                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Users size={16} /> Suggestions
                </h3>
                <div className="space-y-3">
                  {OTHER_USERS.slice(0, 2).map(user => (
                    <UserRow key={user.id} user={user} followedUsers={followedUsers} onToggleFollow={toggleFollow} compact />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
