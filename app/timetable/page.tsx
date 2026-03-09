'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Clock, Plus, Sparkles, CheckCircle2, Circle, ChevronLeft, ChevronRight, Lock, Globe, MoreVertical } from 'lucide-react';

const MOCK_EVENTS = [
  { id: 1, title: 'Learn Python Basics', time: '10:00 AM - 12:00 PM', type: 'target', status: 'completed', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 2, title: 'Team Meeting', time: '1:00 PM - 2:00 PM', type: 'event', status: 'pending', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 3, title: 'Complete Python Exercises', time: '3:00 PM - 5:00 PM', type: 'target', status: 'pending', color: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30' },
];

export default function Timetable() {
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [view, setView] = useState<'day' | 'month'>('day');
  const [isPublic, setIsPublic] = useState(false);

  const toggleStatus = (id: number) => {
    setEvents(events.map(ev => ev.id === id ? { ...ev, status: ev.status === 'completed' ? 'pending' : 'completed' } : ev));
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-display)' }}>Timetable & Targets</h1>
          <p className="text-slate-400 mt-1">Plan your day and achieve your goals with AI</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsPublic(!isPublic)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${isPublic ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'}`}
          >
            {isPublic ? <Globe size={16} /> : <Lock size={16} />}
            {isPublic ? 'Public' : 'Private'}
          </button>
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button 
              onClick={() => setView('day')}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${view === 'day' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Day
            </button>
            <button 
              onClick={() => setView('month')}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${view === 'month' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Month
            </button>
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/20">
            <Plus size={16} />
            <span className="hidden sm:inline">New Event</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar View */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-6 shadow-lg border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <CalendarIcon size={24} className="text-cyan-400" />
              {view === 'day' ? 'Today\'s Schedule' : 'October 2023'}
            </h2>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
                <ChevronLeft size={20} />
              </button>
              <button className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          {view === 'day' ? (
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
              {events.map((event, i) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-slate-800 text-slate-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <Clock size={16} />
                  </div>
                  <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border shadow-sm ${event.color} ${event.status === 'completed' ? 'opacity-60' : ''}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold">{event.title}</span>
                      {event.type === 'target' && (
                        <button onClick={() => toggleStatus(event.id)} className="hover:scale-110 transition-transform">
                          {event.status === 'completed' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </button>
                      )}
                    </div>
                    <div className="text-sm opacity-80">{event.time}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-slate-500 py-2">{day}</div>
              ))}
              {Array.from({ length: 31 }).map((_, i) => (
                <div key={i} className={`aspect-square rounded-xl border border-slate-800 flex flex-col items-center justify-center text-sm relative ${i === 23 ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 font-bold' : 'text-slate-300 hover:bg-slate-800 cursor-pointer transition-colors'}`}>
                  <span>{i + 1}</span>
                  {i === 23 && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1"></div>}
                  {i === 24 && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1"></div>}
                  {i === 26 && <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 mt-1"></div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Targets */}
        <div className="bg-slate-900 rounded-3xl p-6 shadow-lg border border-slate-800 h-fit">
          <div className="flex items-center gap-2 mb-6 text-fuchsia-400">
            <Sparkles size={24} />
            <h2 className="text-xl font-bold text-white">AI Study Plan</h2>
          </div>
          
          <div className="bg-fuchsia-500/10 rounded-2xl p-5 mb-6 border border-fuchsia-500/20">
            <h3 className="font-bold text-fuchsia-400 mb-2">Goal: Learn Python</h3>
            <p className="text-sm text-slate-300 mb-4">You requested a 7-day plan to learn Python basics. Here are your tasks for today.</p>
            <div className="w-full bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
              <div className="bg-gradient-to-r from-fuchsia-500 to-purple-600 h-2 rounded-full" style={{ width: '33%' }}></div>
            </div>
            <div className="text-xs text-fuchsia-400 font-medium text-right">Day 1 of 7 (33%)</div>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/50 flex items-start gap-3">
              <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-300 text-sm line-through">Read Chapter 1: Variables</h4>
                <p className="text-xs text-slate-500 mt-1">Completed at 11:30 AM</p>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 flex items-start gap-3">
              <Circle size={20} className="text-fuchsia-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white text-sm">Complete Exercise 1</h4>
                <p className="text-xs text-slate-400 mt-1">Write a script to calculate area.</p>
                <button className="mt-3 text-xs font-bold bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-fuchsia-500/20">Start Exercise</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
