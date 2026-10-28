'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SlideManager from '@/components/SlideManager';
import ChatSystem from '@/components/ChatSystem';
import Timetable from '@/components/Timetable';
import RoomFinder from '@/components/RoomFinder';
import AttendanceTracker from '@/components/AttendanceTracker';
import DeadlineCalendar from '@/components/DeadlineCalendar';
import Library from '@/components/Library';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timetable');

  useEffect(() => {
    const storedUser = localStorage.getItem('iiits_user');
    if (!storedUser) {
      router.push('/login');
    } else {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        router.push('/login');
      }
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('iiits_user');
    setUser(null);
    router.push('/login');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-500 text-sm font-medium">
        <div className="flex flex-col items-center space-y-4 opacity-80">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <span>Loading portal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      
      {/* Navigation Header */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-5">
        <div key={activeTab} className="tab-content-enter">
          {activeTab === 'timetable' && (
            <Timetable user={user} onNavigateToChat={() => setActiveTab('chat')} />
          )}

          {activeTab === 'rooms' && (
            <RoomFinder user={user} onNavigateToChat={() => setActiveTab('chat')} />
          )}

          {activeTab === 'attendance' && (
            <AttendanceTracker user={user} />
          )}

          {activeTab === 'deadlines' && (
            <DeadlineCalendar user={user} />
          )}

          {activeTab === 'slides' && (
            <SlideManager user={user} />
          )}

          {activeTab === 'chat' && (
            <ChatSystem user={user} />
          )}

          {activeTab === 'library' && (
            <Library user={user} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 mt-auto text-center text-xs text-slate-400 font-medium">
        <p>© 2026 Indian Institute of Information Technology Sri City, Chittoor • UG 2 Academic Portal</p>
      </footer>

    </div>
  );
}
