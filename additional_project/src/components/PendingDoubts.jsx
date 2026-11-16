'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Inbox, Clock, CheckCircle, Loader2, RefreshCw, Search, MessageSquare, Paperclip,
  AlertTriangle, PlayCircle, CheckSquare, Square, Hourglass, Reply
} from 'lucide-react';
import { timeAgo, hoursSince } from '@/lib/timeAgo';

const REFRESH_MS = 30000;
const SYSTEM_PREFIX = '[System Notice]';

const lastRealMessage = (doubt) =>
  [...(doubt.messages || [])].reverse().find(m => !m.text?.startsWith(SYSTEM_PREFIX));

async function fetchAllDoubts() {
  const res = await fetch('/api/doubts');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load doubts');
  return data;
}

// Teacher-only view: every open doubt from every student, in one place.
export default function PendingDoubts({ user, onOpenDoubt, onCountsChange }) {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('Open');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('oldest');
  const [rawSelected, setSelected] = useState(() => new Set());
  const [busyIds, setBusyIds] = useState(() => new Set());
  const [now, setNow] = useState(() => Date.now());

  const applyResult = useCallback((data, err) => {
    if (err) {
      setError(err.message);
    } else {
      setDoubts(data.doubts || []);
      setError('');
      setNow(Date.now());
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  const refresh = useCallback(() => {
    setRefreshing(true);
    fetchAllDoubts().then(d => applyResult(d), e => applyResult(null, e));
  }, [applyResult]);

  useEffect(() => {
    const run = () => fetchAllDoubts().then(d => applyResult(d), e => applyResult(null, e));
    run();
    const timer = setInterval(run, REFRESH_MS);
    return () => clearInterval(timer);
  }, [applyResult]);

  const counts = useMemo(() => {
    const c = { Pending: 0, 'In Progress': 0, Resolved: 0 };
    doubts.forEach(d => { if (d.status in c) c[d.status] += 1; });
    return c;
  }, [doubts]);

  useEffect(() => {
    if (!loading) onCountsChange?.(counts);
  }, [counts, loading, onCountsChange]);

  const openDoubts = useMemo(() => doubts.filter(d => d.status !== 'Resolved'), [doubts]);

  const oldestWaitHours = useMemo(() => {
    if (openDoubts.length === 0) return 0;
    return Math.max(...openDoubts.map(d => hoursSince(d.createdAt, now)));
  }, [openDoubts, now]);

  const subjects = useMemo(() => {
    const map = {};
    openDoubts.forEach(d => { map[d.subject] = (map[d.subject] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [openDoubts]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return doubts
      .filter(d => statusFilter === 'Open' ? d.status !== 'Resolved' : d.status === statusFilter)
      .filter(d => subjectFilter === 'All' || d.subject === subjectFilter)
      .filter(d => !q || [d.title, d.studentName, d.studentRoll, d.subject]
        .some(v => v?.toLowerCase().includes(q)))
      .sort((a, b) => {
        const diff = new Date(a.createdAt) - new Date(b.createdAt);
        return sortOrder === 'oldest' ? diff : -diff;
      });
  }, [doubts, statusFilter, subjectFilter, search, sortOrder]);

  // Only count selections that are still visible after filtering
  const selected = useMemo(() => {
    const ids = new Set(visible.map(d => d.id));
    return new Set([...rawSelected].filter(id => ids.has(id)));
  }, [rawSelected, visible]);

  const updateStatus = async (ids, status) => {
    setBusyIds(prev => new Set([...prev, ...ids]));
    try {
      const results = await Promise.all(ids.map(async (doubtId) => {
        const res = await fetch('/api/doubts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            doubtId,
            senderId: user?.id,
            senderName: user?.name,
            role: 'teacher',
            text: `${SYSTEM_PREFIX}: Doubt status updated to ${status}`,
            newStatus: status
          })
        });
        const data = await res.json();
        return data.success ? data.doubt : null;
      }));
      const updated = new Map(results.filter(Boolean).map(d => [d.id, d]));
      setDoubts(prev => prev.map(d => updated.get(d.id) || d));
      if (updated.size < ids.length) setError('Some doubts could not be updated. Please retry.');
      setSelected(new Set());
    } catch {
      setError('Could not update doubt status. Check your connection.');
    } finally {
      setBusyIds(prev => {
        const next = new Set(prev);
        ids.forEach(id => next.delete(id));
        return next;
      });
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allSelected = visible.length > 0 && visible.every(d => selected.has(d.id));
  const toggleSelectAll = () =>
    setSelected(allSelected ? new Set() : new Set(visible.map(d => d.id)));

  const stats = [
    { label: 'Pending', value: counts.Pending, icon: Hourglass, tone: 'text-amber-700 bg-amber-50 border-amber-200' },
    { label: 'In Progress', value: counts['In Progress'], icon: PlayCircle, tone: 'text-blue-700 bg-blue-50 border-blue-200' },
    { label: 'Resolved', value: counts.Resolved, icon: CheckCircle, tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    {
      label: 'Longest wait',
      value: openDoubts.length ? timeAgo(new Date(now - oldestWaitHours * 3600000), now).replace(' ago', '') : '—',
      icon: Clock,
      tone: oldestWaitHours > 48 ? 'text-rose-700 bg-rose-50 border-rose-200' : 'text-slate-700 bg-slate-50 border-slate-200'
    }
  ];

  return (
    <div className="space-y-5">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 border border-emerald-800/40 rounded-xl p-4 sm:p-5 text-white shadow-lg shadow-emerald-950/10 flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">Pending Doubts</h2>
            <p className="text-xs text-emerald-200/80 hidden sm:block font-medium">
              Every open student question in one place, oldest first
            </p>
          </div>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all border border-white/15 shrink-0 active:scale-95 disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 text-emerald-300 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`rounded-xl border p-3.5 flex items-center gap-3 stagger-${i + 1} ${s.tone}`}>
              <Icon className="w-5 h-5 shrink-0" />
              <div className="min-w-0">
                <div className="text-lg font-bold leading-tight tabular-nums truncate">{loading ? '…' : s.value}</div>
                <div className="text-[11px] font-semibold uppercase tracking-wider opacity-80">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, student name or roll no…"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
            {[
              { id: 'Open', label: `All open (${openDoubts.length})` },
              { id: 'Pending', label: `Pending (${counts.Pending})` },
              { id: 'In Progress', label: `In progress (${counts['In Progress']})` },
              { id: 'Resolved', label: 'Resolved' }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setStatusFilter(opt.id)}
                className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === opt.id ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-emerald-500"
          >
            <option value="oldest">Oldest first</option>
            <option value="newest">Newest first</option>
          </select>
        </div>

        {subjects.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {[['All', openDoubts.length], ...subjects].map(([subj, n]) => (
              <button
                key={subj}
                onClick={() => setSubjectFilter(subj)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap transition-colors ${
                  subjectFilter === subj
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'
                }`}
              >
                {subj} <span className="opacity-70">{n}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Bulk actions */}
      {visible.length > 0 && statusFilter !== 'Resolved' && (
        <div className="flex items-center justify-between gap-2 px-1">
          <button onClick={toggleSelectAll} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900">
            {allSelected ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4" />}
            {allSelected ? 'Clear selection' : `Select all ${visible.length}`}
          </button>
          {selected.size > 0 && (
            <div className="flex items-center gap-2 animate-fade-in">
              <span className="text-xs text-slate-500 font-medium">{selected.size} selected</span>
              <button
                onClick={() => updateStatus([...selected], 'In Progress')}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold"
              >
                Mark in progress
              </button>
              <button
                onClick={() => updateStatus([...selected], 'Resolved')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                Mark resolved
              </button>
            </div>
          )}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl py-14 text-center">
          <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-800">
            {statusFilter === 'Resolved' ? 'No resolved doubts match these filters' : 'All caught up!'}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {statusFilter === 'Resolved' ? 'Try another subject or search.' : 'No student is waiting for a reply right now.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {visible.map((doubt, index) => {
            const waitHours = hoursSince(doubt.createdAt, now);
            const last = lastRealMessage(doubt);
            const awaitingTeacher = doubt.status !== 'Resolved' && last?.role === 'student';
            const attachmentCount = (doubt.messages || []).reduce((n, m) => n + (m.attachments?.length || 0), 0);
            const isBusy = busyIds.has(doubt.id);
            const isSelected = selected.has(doubt.id);
            const overdue = doubt.status !== 'Resolved' && waitHours > 48;

            return (
              <div
                key={doubt.id}
                className={`bg-white border rounded-xl p-4 shadow-sm card-hover flex flex-col gap-3 stagger-${(index % 9) + 1} ${
                  isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {statusFilter !== 'Resolved' && (
                    <button onClick={() => toggleSelect(doubt.id)} className="mt-0.5 text-slate-400 hover:text-emerald-600" aria-label="Select doubt">
                      {isSelected ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4" />}
                    </button>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100 uppercase">
                        {doubt.subject}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                        doubt.status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : doubt.status === 'In Progress'
                          ? 'bg-blue-50 text-blue-700 border-blue-100'
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {doubt.status}
                      </span>
                      {awaitingTeacher && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                          Awaiting your reply
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 mt-2 line-clamp-1" title={doubt.title}>{doubt.title}</h3>
                    {last && (
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        <span className="font-semibold text-slate-700">{last.role === 'teacher' ? 'You' : last.senderName?.split(' ')[0]}:</span>{' '}
                        {last.text || (last.attachments?.length ? 'Sent an attachment' : '')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 font-medium border-t border-slate-100 pt-2.5">
                  <span className="truncate">
                    <span className="text-slate-700 font-semibold">{doubt.studentName}</span> · {doubt.studentRoll}
                  </span>
                  <span className="flex items-center gap-2.5 shrink-0">
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{doubt.messages?.length || 0}</span>
                    {attachmentCount > 0 && <span className="flex items-center gap-1"><Paperclip className="w-3 h-3" />{attachmentCount}</span>}
                    <span className={`flex items-center gap-1 ${overdue ? 'text-rose-600 font-bold' : waitHours > 24 ? 'text-amber-600 font-semibold' : ''}`}>
                      <Clock className="w-3 h-3" />{timeAgo(doubt.createdAt, now)}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenDoubt?.(doubt.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                  >
                    <Reply className="w-3.5 h-3.5" /> Reply
                  </button>
                  {doubt.status === 'Pending' && (
                    <button
                      disabled={isBusy}
                      onClick={() => updateStatus([doubt.id], 'In Progress')}
                      className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold disabled:opacity-50"
                    >
                      Start
                    </button>
                  )}
                  {doubt.status !== 'Resolved' && (
                    <button
                      disabled={isBusy}
                      onClick={() => updateStatus([doubt.id], 'Resolved')}
                      className="px-3 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1 disabled:opacity-50"
                    >
                      {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
