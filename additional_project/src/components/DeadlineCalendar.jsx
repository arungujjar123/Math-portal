'use client';

import React, { useState, useEffect } from 'react';
import { CalendarClock, Clock, Flame, Plus, CheckCircle2, Search, Trash2, FileText, Award, Laptop, FolderKanban } from 'lucide-react';

const INITIAL_DEADLINES = [
  {
    id: 'd1',
    title: 'DBMS Assignment 2 - Indexing & Query Optimization',
    course: 'DBMS',
    category: 'assignment',
    dueDate: '2026-09-19T23:59:00',
    description: 'Submit B+ tree index calculation and SQL execution plan report on Moodle.',
    link: 'https://moodle.iiits.ac.in',
    isCompleted: false
  },
  {
    id: 'd2',
    title: 'RANAC Quiz 1 - Real Analysis & Calculus',
    course: 'RANAC',
    category: 'exam',
    dueDate: '2026-09-21T10:00:00',
    description: 'Closed-book quiz covering series convergence, Taylor expansion, and limits. Venue: G04.',
    link: '',
    isCompleted: false
  },
  {
    id: 'd3',
    title: 'OS Lab Evaluation 2 - Process Scheduling & Threads',
    course: 'OS',
    category: 'lab',
    dueDate: '2026-09-23T14:15:00',
    description: 'Implement Round Robin and SJF scheduling algorithms in C. Demo to TA in Lab 103.',
    link: '',
    isCompleted: false
  },
  {
    id: 'd4',
    title: 'ADSA Mid-Term Project Proposal',
    course: 'ADSA',
    category: 'project',
    dueDate: '2026-09-27T17:00:00',
    description: 'Submit 2-page project proposal on graph algorithms and network flow.',
    link: 'https://moodle.iiits.ac.in',
    isCompleted: false
  }
];

export default function DeadlineCalendar({ user }) {
  const isTeacher = user?.role === 'teacher';
  const [deadlines, setDeadlines] = useState(INITIAL_DEADLINES);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [now, setNow] = useState(new Date());
  
  // Add deadline modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('DBMS');
  const [newCategory, setNewCategory] = useState('assignment');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('23:59');
  const [newDesc, setNewDesc] = useState('');

  // Update live ticking clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load / save persistence
  useEffect(() => {
    const saved = localStorage.getItem('iiits_deadlines_data');
    if (saved) {
      try {
        setDeadlines(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved deadlines data', e);
      }
    }
  }, []);

  const saveDeadlines = (updated) => {
    setDeadlines(updated);
    localStorage.setItem('iiits_deadlines_data', JSON.stringify(updated));
  };

  const handleToggleComplete = (id) => {
    const updated = deadlines.map(d => d.id === id ? { ...d, isCompleted: !d.isCompleted } : d);
    saveDeadlines(updated);
  };

  const handleDeleteDeadline = (id) => {
    const updated = deadlines.filter(d => d.id !== id);
    saveDeadlines(updated);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;

    const fullDueDateStr = `${newDate}T${newTime || '23:59'}:00`;

    const newItem = {
      id: `custom_${Date.now()}`,
      title: newTitle.trim(),
      course: newCourse,
      category: newCategory,
      dueDate: fullDueDateStr,
      description: newDesc.trim() || 'No additional instructions.',
      link: '',
      isCompleted: false
    };

    saveDeadlines([newItem, ...deadlines]);
    setShowAddModal(false);
    setNewTitle('');
    setNewDesc('');
  };

  // Helper to calculate time remaining
  const getTimeRemaining = (dueDateStr) => {
    const due = new Date(dueDateStr);
    const diff = due - now;

    if (diff <= 0) {
      return { isExpired: true, days: 0, hours: 0, minutes: 0, seconds: 0, totalHours: 0 };
    }

    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const totalHours = Math.floor(diff / (1000 * 60 * 60));

    return { isExpired: false, days, hours, minutes, seconds, totalHours };
  };

  // Filter deadlines
  const filteredDeadlines = deadlines.filter(d => {
    const matchesCategory = categoryFilter === 'all' || d.category === categoryFilter;
    const matchesSearch = searchQuery === '' ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Check if any deadline is urgent (< 48 hours)
  const urgentCount = deadlines.filter(d => {
    if (d.isCompleted) return false;
    const rem = getTimeRemaining(d.dueDate);
    return !rem.isExpired && rem.totalHours <= 48;
  }).length;

  return (
    <div className="space-y-5">
      
      {/* Top Banner (Rich Glassmorphic Header) */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 border border-emerald-800/40 p-4 sm:p-5 rounded-xl shadow-lg shadow-emerald-950/10 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Assignments & Exam Deadlines
            </h2>
            <p className="text-xs text-emerald-200/80 hidden sm:block font-medium">UG2 Monsoon 2026 Academic Countdown</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {urgentCount > 0 && (
            <span className="bg-rose-500/90 border border-rose-400/40 text-white text-xs font-semibold rounded-full px-3 py-1 flex items-center gap-1.5 shadow-sm">
              <Flame className="w-3.5 h-3.5" />
              {urgentCount} Urgent
            </span>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center space-x-1.5 transition-all border border-white/15 backdrop-blur-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{isTeacher ? 'Post Deadline' : 'Add Task'}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Category Filter Pills (Icon-based, Emoji Free) */}
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'assignment', label: 'Assignments', icon: FileText },
            { id: 'exam', label: 'Exams', icon: Award },
            { id: 'lab', label: 'Labs', icon: Laptop },
            { id: 'project', label: 'Projects', icon: FolderKanban }
          ].map(cat => {
            const Icon = cat.icon;
            const isActive = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search deadlines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
          />
        </div>

      </div>

      {/* Deadlines List / Countdown Cards */}
      <div className="space-y-4">
        {filteredDeadlines.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 space-y-2 shadow-xs">
            <CalendarClock className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="font-bold text-sm text-slate-700">No deadlines found</h4>
            <p className="text-xs text-slate-400">Try changing your search query or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDeadlines.map((item, index) => {
              const rem = getTimeRemaining(item.dueDate);
              const isUrgent = !rem.isExpired && rem.totalHours <= 48 && !item.isCompleted;
              const staggerClass = `stagger-${(index % 8) + 1}`;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border card-hover transition-all flex flex-col justify-between space-y-4 shadow-xs relative overflow-hidden ${staggerClass} ${
                    item.isCompleted
                      ? 'bg-slate-50/70 border-slate-200 opacity-75'
                      : isUrgent
                      ? 'bg-rose-50/20 border-rose-200'
                      : 'bg-white border-slate-200/90'
                  }`}
                >
                  
                  {/* Card Top */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {item.course}
                        </span>
                        <span className="text-[11px] uppercase font-semibold text-slate-500">
                          {item.category}
                        </span>
                      </div>

                      {item.isCompleted ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Done
                        </span>
                      ) : rem.isExpired ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200 text-slate-700 border border-slate-300">
                          Expired
                        </span>
                      ) : isUrgent ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1 animate-pulse">
                          <Flame className="w-3 h-3" /> Urgent
                        </span>
                      ) : null}
                    </div>

                    <h3 className={`font-bold text-sm leading-snug ${item.isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Countdown Timer Display (Dark Rich Card) */}
                  {!item.isCompleted && !rem.isExpired && (
                    <div className="bg-slate-900 text-white rounded-lg p-3 flex items-center justify-center gap-4 shadow-inner border border-slate-800">
                      <div className="flex flex-col items-center">
                        <span className="text-base font-bold text-emerald-400 font-mono leading-none">{rem.days}</span>
                        <span className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">Days</span>
                      </div>
                      <span className="text-slate-600 font-bold text-sm mb-2.5">:</span>
                      <div className="flex flex-col items-center">
                        <span className="text-base font-bold text-emerald-400 font-mono leading-none">{String(rem.hours).padStart(2, '0')}</span>
                        <span className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">Hrs</span>
                      </div>
                      <span className="text-slate-600 font-bold text-sm mb-2.5">:</span>
                      <div className="flex flex-col items-center">
                        <span className="text-base font-bold text-emerald-400 font-mono leading-none">{String(rem.minutes).padStart(2, '0')}</span>
                        <span className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">Min</span>
                      </div>
                      <span className="text-slate-600 font-bold text-sm mb-2.5">:</span>
                      <div className="flex flex-col items-center">
                        <span className="text-base font-bold text-amber-400 font-mono leading-none">{String(rem.seconds).padStart(2, '0')}</span>
                        <span className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">Sec</span>
                      </div>
                    </div>
                  )}

                  {/* Card Bottom Controls */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                    <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Due: {new Date(item.dueDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleComplete(item.id)}
                        className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                          item.isCompleted
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        }`}
                      >
                        {item.isCompleted ? 'Mark Pending' : 'Mark Done'}
                      </button>

                      <button
                        onClick={() => handleDeleteDeadline(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        title="Delete Deadline"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Post New Deadline Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">
                  {isTeacher ? 'Post New Course Deadline' : 'Add Task'}
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-semibold">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DBMS Assignment 3"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Course</label>
                  <select
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
                  >
                    {['DBMS', 'RANAC', 'OS', 'ADSA', 'OOP', 'PC', 'ECE', 'General'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
                  >
                    <option value="assignment">Assignment</option>
                    <option value="exam">Exam / Quiz</option>
                    <option value="lab">Lab Evaluation</option>
                    <option value="project">Project</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Due Time</label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Instructions..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
                >
                  Post Deadline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
