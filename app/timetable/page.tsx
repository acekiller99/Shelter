'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Clock, Plus, Sparkles, CheckCircle2, Circle, ChevronLeft, ChevronRight, Lock, Globe, X, Check, Pencil, Trash2, Loader2, GripVertical } from 'lucide-react';
import { useGlobal } from '@/components/GlobalContext';

interface CalendarEvent {
  id: number;
  title: string;
  time: string;
  type: 'target' | 'event';
  status: 'pending' | 'completed';
  color: string;
  isPublic?: boolean;
  notes?: string;
  date?: string; // YYYY-MM-DD
}

const COLORS = [
  { id: 'emerald', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 'blue', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 'fuchsia', cls: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30' },
  { id: 'amber', cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 'cyan', cls: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
];

function formatDate(d: Date) {
  return d.toISOString().split('T')[0];
}

function formatMonthYear(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

const INITIAL_EVENTS: CalendarEvent[] = [
  { id: 1, title: 'Learn Python Basics', time: '10:00 AM - 12:00 PM', type: 'target', status: 'completed', color: COLORS[0].cls, date: formatDate(new Date()) },
  { id: 2, title: 'Team Meeting', time: '1:00 PM - 2:00 PM', type: 'event', status: 'pending', color: COLORS[1].cls, date: formatDate(new Date()) },
  { id: 3, title: 'Complete Python Exercises', time: '3:00 PM - 5:00 PM', type: 'target', status: 'pending', color: COLORS[2].cls, date: formatDate(new Date()) },
];

const EMPTY_FORM = { title: '', time: '', type: 'event' as const, color: 0, notes: '', isPublic: false };

export default function Timetable() {
  const { settings } = useGlobal();
  const today = new Date();
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [view, setView] = useState<'day' | 'month'>('day');
  const [isPublic, setIsPublic] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPlanText, setAiPlanText] = useState('');
  const [aiError, setAiError] = useState('');
  const [draggedId, setDraggedId] = useState<number | null>(null);

  const selectedDateStr = formatDate(currentDate);
  const todayEvents = events.filter(e => e.date === selectedDateStr);

  const navigate = (dir: 1 | -1) => {
    const next = new Date(currentDate);
    if (view === 'day') next.setDate(next.getDate() + dir);
    else next.setMonth(next.getMonth() + dir);
    setCurrentDate(next);
  };

  const goToToday = () => setCurrentDate(new Date());

  const toggleStatus = (id: number) => {
    setEvents(events.map(ev => ev.id === id ? { ...ev, status: ev.status === 'completed' ? 'pending' : 'completed' } : ev));
  };

  const openAdd = (date?: string) => {
    setEditingEvent(null);
    setForm({ ...EMPTY_FORM, ...(date ? {} : {}) });
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (ev: CalendarEvent) => {
    setEditingEvent(ev);
    setForm({ title: ev.title, time: ev.time, type: ev.type as 'event', color: COLORS.findIndex(c => c.cls === ev.color), notes: ev.notes || '', isPublic: ev.isPublic || false });
    setFormError('');
    setShowModal(true);
  };

  const deleteEvent = (id: number) => setEvents(prev => prev.filter(e => e.id !== id));

  const handleDragStart = (id: number) => setDraggedId(id);
  const handleDragOver = (e: React.DragEvent, overId: number) => {
    e.preventDefault();
    if (draggedId === null || draggedId === overId) return;
    setEvents(prev => {
      const arr = [...prev];
      const fromIdx = arr.findIndex(e => e.id === draggedId);
      const toIdx = arr.findIndex(e => e.id === overId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return arr;
    });
  };
  const handleDragEnd = () => setDraggedId(null);

  const generateAiPlan = async () => {
    if (!settings.geminiApiKey) {
      setAiError('No Gemini API key set. Add one in Settings.');
      return;
    }
    setAiLoading(true);
    setAiError('');
    setAiPlanText('');
    const eventList = todayEvents.length > 0
      ? todayEvents.map(e => `- ${e.title} (${e.time})`).join('\n')
      : 'No events scheduled yet';
    const prompt = `I have the following tasks/events for today:\n${eventList}\n\nCreate a concise, actionable study plan. Give 3-5 bullet points with specific tips for tackling these tasks efficiently today. Be brief and practical.`;
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${settings.geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'API error');
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI.';
      setAiPlanText(text);
    } catch (err: any) {
      setAiError(err.message || 'Failed to generate plan.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.time.trim()) { setFormError('Title and time are required.'); return; }
    const colorCls = COLORS[form.color]?.cls || COLORS[0].cls;
    if (editingEvent) {
      setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...e, title: form.title, time: form.time, type: form.type, color: colorCls, notes: form.notes, isPublic: form.isPublic } : e));
    } else {
      setEvents(prev => [...prev, { id: Date.now(), title: form.title, time: form.time, type: form.type, status: 'pending', color: colorCls, notes: form.notes, isPublic: form.isPublic, date: selectedDateStr }]);
    }
    setShowModal(false);
  };

  const getDaysInMonth = (d: Date) => {
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate);

  const eventsOnDay = (day: number) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.filter(e => e.date === formatDate(d));
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-display)' }}>Timetable & Targets</h1>
          <p className="text-stone-400 mt-1">Plan your day and achieve your goals with AI</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsPublic(!isPublic)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${isPublic ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'}`}
          >
            {isPublic ? <Globe size={16} /> : <Lock size={16} />}
            {isPublic ? 'Public' : 'Private'}
          </button>
          <div className="flex bg-stone-800 p-1 rounded-xl border border-stone-700">
            {(['day', 'month'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors capitalize ${view === v ? 'bg-stone-700 text-white shadow-sm' : 'text-stone-400 hover:text-stone-200'}`}>
                {v}
              </button>
            ))}
          </div>
          <button onClick={() => openAdd()} className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/20">
            <Plus size={16} /> <span className="hidden sm:inline">New Event</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Calendar View */}
        <div className="lg:col-span-2 bg-stone-900 rounded-3xl p-6 shadow-lg border border-stone-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <CalendarIcon size={24} className="text-cyan-400" />
                {view === 'day'
                  ? currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                  : formatMonthYear(currentDate)}
              </h2>
              {view === 'day' && formatDate(currentDate) !== formatDate(today) && (
                <button onClick={goToToday} className="text-xs text-amber-400 hover:underline mt-1">Go to Today</button>
              )}
            </div>
            <div className="flex gap-2">
              <button data-testid="timetable-prev" onClick={() => navigate(-1)} className="p-2 hover:bg-stone-800 rounded-full transition-colors text-stone-400 hover:text-white"><ChevronLeft size={20} /></button>
              <button data-testid="timetable-next" onClick={() => navigate(1)} className="p-2 hover:bg-stone-800 rounded-full transition-colors text-stone-400 hover:text-white"><ChevronRight size={20} /></button>
            </div>
          </div>

          {view === 'day' ? (
            <div className="space-y-4">
              {todayEvents.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon size={40} className="mx-auto text-stone-600 mb-3" />
                  <p className="text-stone-400">No events for this day.</p>
                  <button onClick={() => openAdd()} className="mt-3 text-cyan-400 hover:underline text-sm">+ Add Event</button>
                </div>
              ) : (
                todayEvents.map((event, i) => (
                  <motion.div key={event.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    draggable
                    onDragStart={() => handleDragStart(event.id)}
                    onDragOver={(e) => handleDragOver(e, event.id)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center justify-between gap-3 p-4 rounded-2xl border ${event.color} ${event.status === 'completed' ? 'opacity-60' : ''} ${draggedId === event.id ? 'opacity-40 scale-95' : ''} cursor-grab active:cursor-grabbing transition-all`}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <GripVertical size={14} className="shrink-0 opacity-30" />
                      {event.type === 'target' ? (
                        <button onClick={() => toggleStatus(event.id)} className="hover:scale-110 transition-transform shrink-0">
                          {event.status === 'completed' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </button>
                      ) : <Clock size={20} className="shrink-0" />}
                      <div className="min-w-0">
                        <div className={`font-bold text-sm ${event.status === 'completed' ? 'line-through opacity-70' : ''}`}>{event.title}</div>
                        <div className="text-xs opacity-70">{event.time}</div>
                        {event.notes && <div className="text-xs opacity-60 mt-1 truncate">{event.notes}</div>}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button data-testid={`event-edit-${event.id}`} onClick={() => openEdit(event)} className="p-1.5 hover:bg-black/20 rounded-lg transition-colors"><Pencil size={14} /></button>
                      <button data-testid={`event-delete-${event.id}`} onClick={() => deleteEvent(event.id)} className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          ) : (
            <div>
              <div className="overflow-x-auto">
              <div className="grid grid-cols-7 gap-1 mb-2 min-w-[280px]">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="text-center text-xs font-medium text-stone-500 py-2">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 min-w-[280px]">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  const isToday = formatDate(d) === formatDate(today);
                  const isSelected = formatDate(d) === formatDate(currentDate);
                  const dayEvs = eventsOnDay(day);
                  return (
                    <button key={day} onClick={() => { setCurrentDate(d); setView('day'); }}
                      className={`aspect-square rounded-xl border flex flex-col items-center justify-center text-sm relative transition-colors ${
                        isSelected ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 font-bold'
                        : isToday ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 font-bold'
                        : 'text-stone-300 border-stone-800 hover:bg-stone-800 cursor-pointer'
                      }`}>
                      <span>{day}</span>
                      {dayEvs.length > 0 && (
                        <div className="flex gap-0.5 mt-0.5">
                          {dayEvs.slice(0, 3).map((_, idx) => (
                            <div key={idx} className="w-1 h-1 rounded-full bg-current opacity-70" />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Study Plan Panel */}
        <div className="bg-stone-900 rounded-3xl p-6 shadow-lg border border-stone-800 h-fit">
          <div className="flex items-center gap-2 mb-6 text-fuchsia-400">
            <Sparkles size={24} />
            <h2 className="text-xl font-bold text-white">AI Study Plan</h2>
          </div>

          <div className="bg-fuchsia-500/10 rounded-2xl p-5 mb-6 border border-fuchsia-500/20">
            <h3 className="font-bold text-fuchsia-400 mb-2">Goal: Learn Python</h3>
            <p className="text-sm text-stone-300 mb-4">AI-generated 7-day plan. Complete tasks to track progress.</p>
            <div className="w-full bg-stone-800 rounded-full h-2 mb-2 overflow-hidden">
              <div className="bg-gradient-to-r from-fuchsia-500 to-purple-600 h-2 rounded-full transition-all" style={{ width: `${Math.round((events.filter(e => e.status === 'completed').length / Math.max(events.length, 1)) * 100)}%` }} />
            </div>
            <div className="text-xs text-fuchsia-400 font-medium text-right">
              {events.filter(e => e.status === 'completed').length}/{events.length} completed
            </div>
          </div>

          <div className="space-y-3">
            {todayEvents.map(ev => (
              <div key={ev.id} className={`p-4 rounded-xl border border-stone-700 bg-stone-800/50 flex items-start gap-3 ${ev.status === 'completed' ? 'opacity-60' : ''}`}>
                {ev.status === 'completed'
                  ? <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                  : <Circle size={20} className="text-stone-400 shrink-0 mt-0.5" />}
                <div>
                  <h4 className={`font-semibold text-sm ${ev.status === 'completed' ? 'text-stone-400 line-through' : 'text-white'}`}>{ev.title}</h4>
                  <p className="text-xs text-stone-500 mt-1">{ev.time}</p>
                  {ev.notes && <p className="text-xs text-stone-400 mt-1">{ev.notes}</p>}
                </div>
              </div>
            ))}
            {todayEvents.length === 0 && (
              <p className="text-stone-500 text-sm text-center py-4">No targets for today. Add one!</p>
            )}
          </div>

          <button
            onClick={generateAiPlan}
            disabled={aiLoading}
            className="mt-6 w-full py-3 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {aiLoading ? 'Generating...' : 'Generate AI Plan'}
          </button>

          {aiError && (
            <p className="mt-3 text-xs text-red-400 bg-red-500/10 rounded-xl p-3 border border-red-500/20">{aiError}</p>
          )}

          {aiPlanText && (
            <div className="mt-4 bg-fuchsia-500/5 rounded-2xl p-4 border border-fuchsia-500/20">
              <p className="text-xs font-bold text-fuchsia-400 mb-2 flex items-center gap-1"><Sparkles size={12} /> AI Suggestions</p>
              <div className="text-sm text-stone-300 whitespace-pre-wrap leading-relaxed">{aiPlanText}</div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-stone-900 rounded-3xl border border-stone-700 p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">{editingEvent ? 'Edit Event' : 'New Event'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-400 mb-1">Title *</label>
                  <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Event or task title"
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 transition-colors text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-400 mb-1">Time *</label>
                  <input value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} placeholder="e.g. 10:00 AM - 12:00 PM"
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 transition-colors text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-stone-400 mb-1">Type</label>
                    <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as 'event' }))}
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500 text-sm">
                      <option value="event">Event</option>
                      <option value="target">Target / Task</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-400 mb-1">Color</label>
                    <div className="flex gap-2 pt-1">
                      {COLORS.map((c, idx) => (
                        <button key={idx} onClick={() => setForm(p => ({ ...p, color: idx }))}
                          className={`w-7 h-7 rounded-full border-2 transition-all ${c.cls.split(' ')[0]} ${form.color === idx ? 'border-white scale-110' : 'border-transparent'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-400 mb-1">Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes or practical questions..."
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 transition-colors text-sm resize-none min-h-[70px]" />
                </div>
                <div className="flex items-center justify-between p-3 bg-stone-800/50 rounded-xl border border-stone-700">
                  <span className="text-sm text-stone-300">Make this event public</span>
                  <button onClick={() => setForm(p => ({ ...p, isPublic: !p.isPublic }))}
                    className={`relative w-10 h-5 rounded-full transition-colors ${form.isPublic ? 'bg-cyan-500' : 'bg-stone-600'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isPublic ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                {formError && <p className="text-red-400 text-sm">{formError}</p>}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-stone-800 text-stone-300 border border-stone-700 rounded-xl font-medium hover:bg-stone-700 transition-colors">Cancel</button>
                <button onClick={handleSubmit} className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                  <Check size={16} /> {editingEvent ? 'Save' : 'Create'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
