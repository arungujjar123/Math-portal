'use client';

import React from 'react';
import { BookOpen, MessageSquare, Calendar, LogOut, User, ShieldCheck, GraduationCap, Library as LibraryIcon, Building2, Percent, CalendarClock } from 'lucide-react';

export default function Navbar({ user, activeTab, setActiveTab, onLogout }) {
  const isTeacher = user?.role === 'teacher';

  const allNavItems = [
    { id: 'timetable', label: isTeacher ? 'Extra Class Finder' : 'UG2 Timetable', icon: Calendar, forTeacher: true, forStudent: true },
    { id: 'rooms', label: 'Room Finder', icon: Building2, forTeacher: true, forStudent: true },
    { id: 'attendance', label: 'Attendance (75%)', icon: Percent, forTeacher: false, forStudent: true }, // Student-only!
    { id: 'deadlines', label: isTeacher ? 'Post Deadlines' : 'Deadlines & Exams', icon: CalendarClock, forTeacher: true, forStudent: true },
    { id: 'slides', label: isTeacher ? 'Upload Slides' : 'Slides & Notes', icon: BookOpen, forTeacher: true, forStudent: true },
    { id: 'chat', label: isTeacher ? 'Student Doubts' : 'Doubt Chat', icon: MessageSquare, forTeacher: true, forStudent: true },
    { id: 'library', label: 'Library (OPAC)', icon: LibraryIcon, forTeacher: true, forStudent: true },
  ];

  const navItems = allNavItems.filter(item => isTeacher ? item.forTeacher : item.forStudent);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Row: Branding and User Info */}
        <div className="flex items-center justify-between h-14">
          {/* Left Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-sm shadow-emerald-600/20 group hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-4 h-4 transition-transform group-hover:rotate-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-sm tracking-tight text-slate-900">
                  IIIT Sri City Portal
                </h1>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">Academic Slides, Doubts & UG2 Free Slot Timetable</p>
            </div>
          </div>

          {/* User Info & Role Badge */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[11px] font-semibold text-slate-700 tracking-tight">{user?.name}</span>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span
                  className={`text-[11px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                    isTeacher
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {isTeacher ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                  {user?.role}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">{isTeacher ? user?.subject : user?.rollNo}</span>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 border border-slate-200 hover:border-rose-200 hover:scale-105 active:scale-95"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Row: Navigation Tabs */}
        <div className="pb-2">
          <nav className="flex items-center space-x-1 sm:space-x-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 select-none whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-emerald-700 shadow-sm scale-[1.02]'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/60 active:scale-95'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

      </div>
    </header>
  );
}
