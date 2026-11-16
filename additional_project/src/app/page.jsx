'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SlideManager from '@/components/SlideManager';
import ChatSystem from '@/components/ChatSystem';
import Timetable from '@/components/Timetable';
import RoomFinder from '@/components/RoomFinder';
import AttendanceTracker from '@/components/AttendanceTracker';
import DeadlineCalendar from '@/components/DeadlineCalendar';
import Library from '@/components/Library';
import PendingDoubts from '@/components/PendingDoubts';
import AnnouncementBoard from '@/components/AnnouncementBoard';

const SEEN_KEY = 'iiits_announcements_seen';
const BADGE_REFRESH_MS = 60000;

const readSeenAt = () => {
  try {
    return Number(localStorage.getItem(SEEN_KEY)) || 0;
  } catch {
    return 0;
  }
};

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timetable');
  const [chatDoubtId, setChatDoubtId] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [newAnnouncements, setNewAnnouncements] = useState(0);
  const [announcementsSeenAt, setAnnouncementsSeenAt] = useState(0);
  const isTeacher = user?.role === 'teacher';

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

  // Navbar badges: open doubts (teachers) and unread announcements (everyone)
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const refreshBadges = async () => {
      try {
        const seenAt = readSeenAt();
        const annRes = await fetch('/api/announcements');
        const annData = await annRes.json();
        if (!cancelled && annData.announcements) {
          setNewAnnouncements(annData.announcements.filter(a =>
            a.authorId !== user.id && new Date(a.createdAt).getTime() > seenAt
          ).length);
        }
        if (user.role === 'teacher') {
          const dRes = await fetch('/api/doubts?summary=1');
          const dData = await dRes.json();
          if (!cancelled && dData.counts) {
            setPendingCount(dData.counts.Pending + dData.counts['In Progress']);
          }
        }
      } catch {
        // badges are best-effort; the tabs themselves show errors
      }
    };

    refreshBadges();
    const timer = setInterval(refreshBadges, BADGE_REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [user]);

  const changeTab = (tab) => {
    if (tab === 'announcements') setAnnouncementsSeenAt(readSeenAt());
    if (tab !== 'chat') setChatDoubtId(null);
    setActiveTab(tab);
  };

  const markAnnouncementsSeen = useCallback((ts) => {
    try {
      localStorage.setItem(SEEN_KEY, String(ts));
    } catch {}
    setNewAnnouncements(0);
  }, []);

  const handlePendingCounts = useCallback((counts) => {
    setPendingCount(counts.Pending + counts['In Progress']);
  }, []);

  const openDoubtInChat = (doubtId) => {
    setChatDoubtId(doubtId);
    setActiveTab('chat');
  };

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
        setActiveTab={changeTab}
        onLogout={handleLogout}
        badges={{ pending: pendingCount, announcements: newAnnouncements }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-5">
        <div key={activeTab} className="tab-content-enter">
          {activeTab === 'timetable' && (
            <Timetable user={user} onNavigateToChat={() => changeTab('chat')} />
          )}

          {activeTab === 'rooms' && (
            <RoomFinder user={user} onNavigateToChat={() => changeTab('chat')} />
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

          {activeTab === 'pending' && isTeacher && (
            <PendingDoubts user={user} onOpenDoubt={openDoubtInChat} onCountsChange={handlePendingCounts} />
          )}

          {activeTab === 'announcements' && (
            <AnnouncementBoard user={user} lastSeenAt={announcementsSeenAt} onSeen={markAnnouncementsSeen} />
          )}

          {activeTab === 'chat' && (
            <ChatSystem key={chatDoubtId || 'chat'} user={user} initialDoubtId={chatDoubtId} />
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
