'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { UserCircle, Edit3, Camera, MapPin, Link as LinkIcon, Calendar, Gamepad2, MonitorPlay, Moon, Circle } from 'lucide-react';
import Image from 'next/image';

export default function Profile() {
  const [status, setStatus] = useState('online');
  const [isEditing, setIsEditing] = useState(false);

  const statuses = [
    { id: 'online', label: 'Online', icon: Circle, color: 'text-emerald-500', bg: 'bg-emerald-500' },
    { id: 'busy', label: 'Busy', icon: Circle, color: 'text-red-500', bg: 'bg-red-500' },
    { id: 'gaming', label: 'Gaming', icon: Gamepad2, color: 'text-amber-500', bg: 'bg-amber-500' },
    { id: 'watching', label: 'Watching', icon: MonitorPlay, color: 'text-indigo-500', bg: 'bg-indigo-500' },
    { id: 'away', label: 'Away', icon: Moon, color: 'text-stone-400', bg: 'bg-stone-400' },
  ];

  const currentStatus = statuses.find(s => s.id === status) || statuses[0];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 shadow-xl mb-8">
        {/* Cover Photo */}
        <div className="h-48 md:h-64 bg-gradient-to-r from-amber-500/20 to-orange-500/20 relative group">
          <Image 
            src="https://picsum.photos/seed/cover/1200/400" 
            alt="Cover" 
            fill 
            className="object-cover opacity-50"
            referrerPolicy="no-referrer"
          />
          <button className="absolute bottom-4 right-4 p-2 bg-stone-900/80 backdrop-blur-md text-white rounded-xl border border-stone-700 hover:bg-stone-800 transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-2 text-sm font-medium">
            <Camera size={16} />
            Edit Cover
          </button>
        </div>

        {/* Profile Info */}
        <div className="px-6 md:px-10 pb-10 relative">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 md:-mt-20 mb-6">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-stone-900 bg-stone-800 relative overflow-hidden">
                <Image 
                  src="https://picsum.photos/seed/you/200/200" 
                  alt="Profile" 
                  fill 
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <Camera size={24} />
              </button>
              <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-stone-900 ${currentStatus.bg}`} />
            </div>

            <div className="flex-1 pt-16 md:pt-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>Alex Chen</h1>
                  <p className="text-stone-400 font-medium">@alexc</p>
                </div>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-6 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-xl font-medium transition-colors border border-stone-700 flex items-center gap-2 w-fit"
                >
                  <Edit3 size={16} />
                  {isEditing ? 'Save Profile' : 'Edit Profile'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">About Me</h3>
                {isEditing ? (
                  <textarea 
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-4 text-stone-200 focus:outline-none focus:border-amber-500 transition-colors min-h-[120px] resize-none"
                    defaultValue="Just exploring the Shelter. Always down for a game of poker or discussing the latest in web tech!"
                  />
                ) : (
                  <p className="text-stone-300 leading-relaxed">
                    Just exploring the Shelter. Always down for a game of poker or discussing the latest in web tech!
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-3">Current Status</h3>
                <div className="flex flex-wrap gap-3">
                  {statuses.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setStatus(s.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                        status === s.id 
                          ? `bg-stone-800 border-${s.color.split('-')[1]}-500/50 text-white shadow-lg` 
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                      }`}
                    >
                      <s.icon size={16} className={status === s.id ? s.color : 'text-stone-500'} />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-stone-800/50 rounded-2xl p-5 border border-stone-700/50">
                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">Details</h3>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-stone-300">
                    <MapPin size={18} className="text-stone-500" />
                    <span>San Francisco, CA</span>
                  </li>
                  <li className="flex items-center gap-3 text-stone-300">
                    <LinkIcon size={18} className="text-stone-500" />
                    <a href="#" className="text-amber-400 hover:underline">github.com/alexc</a>
                  </li>
                  <li className="flex items-center gap-3 text-stone-300">
                    <Calendar size={18} className="text-stone-500" />
                    <span>Joined March 2024</span>
                  </li>
                </ul>
              </div>

              <div className="bg-stone-800/50 rounded-2xl p-5 border border-stone-700/50">
                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">Gaming Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">Games Played</span>
                    <span className="text-white font-bold">142</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">Win Rate</span>
                    <span className="text-emerald-400 font-bold">58%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">Favorite Game</span>
                    <span className="text-amber-400 font-medium">Texas Hold'em</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
