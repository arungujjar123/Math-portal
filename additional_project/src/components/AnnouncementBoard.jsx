'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Megaphone, Plus, X, Pin, PinOff, Trash2, Loader2, Search, AlertTriangle, Bell, Send, RefreshCw
} from 'lucide-react';
import { timeAgo } from '@/lib/timeAgo';
import { SUBJECTS } from '@/lib/subjects';

const PRIORITY_STYLES = {
  urgent: { label: 'Urgent', badge: 'bg-rose-50 text-rose-700 border-rose-200', accent: 'border-l-rose-500' },
  important: { label: 'Important', badge: 'bg-amber-50 text-amber-700 border-amber-200', accent: 'border-l-amber-500' },
  normal: { label: 'Info', badge: 'bg-slate-50 text-slate-600 border-slate-200', accent: 'border-l-emerald-500' }
};

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

function Linkified({ text }) {
  return text.split(URL_REGEX).map((part, i) =>
    i % 2 === 1 ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline break-all">
        {part}
      </a>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

async function fetchAnnouncements() {
  const res = await fetch('/api/announcements');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load announcements');
  return data;
}

function AnnouncementCard({ item, isTeacher, isMine, isNew, now, onTogglePin, onDelete, busy }) {
  const [expanded, setExpanded] = useState(false);
  const style = PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.normal;
  const isLong = item.body.length > 280 || item.body.split('\n').length > 4;

  return (
    <article className={`bg-white border border-slate-200 border-l-4 ${style.accent} rounded-xl p-4 shadow-sm card-hover`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center flex-wrap gap-1.5 mb-1.5">
            {item.pinned && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Pin className="w-3 h-3" /> Pinned
              </span>
            )}
            {item.priority !== 'normal' && (
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${style.badge}`}>{style.label}</span>
            )}
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-200 uppercase">
              {item.subject}
            </span>
            {isNew && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white tracking-wider">NEW</span>
            )}
          </div>
          <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
        </div>

        {isTeacher && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onTogglePin(item)}
              disabled={busy}
              title={item.pinned ? 'Unpin' : 'Pin to top'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
            >
              {item.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
            </button>
            {isMine && (
              <button
                onClick={() => onDelete(item)}
                disabled={busy}
                title="Delete"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-50"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            )}
          </div>
        )}
      </div>

      <p className={`text-xs text-slate-700 mt-2 leading-relaxed whitespace-pre-wrap break-words ${!expanded && isLong ? 'line-clamp-4' : ''}`}>
        <Linkified text={item.body} />
      </p>
      {isLong && (
        <button onClick={() => setExpanded(e => !e)} className="text-[11px] font-semibold text-emerald-700 mt-1 hover:underline">
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}

      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
        <span className="truncate">
          <span className="font-semibold text-slate-700">{isMine ? 'You' : item.authorName}</span>
          {item.authorSubject ? ` · ${item.authorSubject}` : ''}
        </span>
        <time dateTime={item.createdAt} title={new Date(item.createdAt).toLocaleString()}>{timeAgo(item.createdAt, now)}</time>
      </div>
    </article>
  );
}

export default function AnnouncementBoard({ user, lastSeenAt, onSeen }) {
  const isTeacher = user?.role === 'teacher';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  // Snapshot so "NEW" tags stay visible for this visit even after we mark everything seen
  const [seenSnapshot] = useState(() => lastSeenAt || 0);

  const [showCompose, setShowCompose] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [subject, setSubject] = useState('General');
  const [priority, setPriority] = useState('normal');
  const [pinned, setPinned] = useState(false);
  const [posting, setPosting] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    try {
      const data = await fetchAnnouncements();
      setItems(data.announcements || []);
      setError('');
      setNow(Date.now());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchAnnouncements()
      .then(data => {
        if (cancelled) return;
        setItems(data.announcements || []);
        setNow(Date.now());
      })
      .catch(err => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!loading) onSeen?.(Date.now());
  }, [loading, items, onSeen]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter(a => subjectFilter === 'All' || a.subject === subjectFilter)
      .filter(a => !q || a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q));
  }, [items, subjectFilter, search]);

  const subjectOptions = useMemo(() => {
    const used = new Set(items.map(a => a.subject));
    return ['All', 'General', ...SUBJECTS.map(s => s.code)].filter(s => s === 'All' || used.has(s));
  }, [items]);

  const resetForm = () => {
    setTitle(''); setBody(''); setSubject('General'); setPriority('normal'); setPinned(false); setFormError('');
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setFormError('Title and message are both required.');
      return;
    }
    setPosting(true);
    setFormError('');
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId: user?.id, title, body, subject, priority, pinned })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post');
      await load({ silent: true });
      resetForm();
      setShowCompose(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setPosting(false);
    }
  };

  const handleTogglePin = async (item) => {
    setBusyId(item.id);
    try {
      const res = await fetch('/api/announcements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, authorId: user?.id, pinned: !item.pinned })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      await load({ silent: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title}"? Students will no longer see it.`)) return;
    setBusyId(item.id);
    try {
      const params = new URLSearchParams({ id: item.id, authorId: user?.id || '' });
      const res = await fetch(`/api/announcements?${params}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      setItems(prev => prev.filter(a => a.id !== item.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 border border-emerald-800/40 rounded-xl p-4 sm:p-5 text-white shadow-lg shadow-emerald-950/10 flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">Announcements</h2>
            <p className="text-xs text-emerald-200/80 hidden sm:block font-medium">
              {isTeacher ? 'Post notices for the whole UG2 batch or one course' : 'Notices from your professors'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => load({ silent: true })}
            disabled={refreshing}
            title="Refresh"
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all active:scale-95 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-300 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          {isTeacher && (
            <button
              onClick={() => { setShowCompose(s => !s); setFormError(''); }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all border border-white/15 active:scale-95"
            >
              {showCompose ? <X className="w-4 h-4 text-emerald-300" /> : <Plus className="w-4 h-4 text-emerald-300" />}
              <span>{showCompose ? 'Close' : 'New Announcement'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Compose (teacher) */}
      {isTeacher && showCompose && (
        <form onSubmit={handlePost} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3 animate-scale-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={150}
                placeholder="e.g. DBMS lab moved to Room 204 tomorrow"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Audience</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="General">General (all UG2)</option>
                {SUBJECTS.map(s => <option key={s.code} value={s.code}>{s.code} ({s.name})</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Message *</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={4000}
              rows={4}
              placeholder="Write the details. Links are clickable for students."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium resize-y"
            />
            <div className="text-right text-[10px] text-slate-400 font-medium">{body.length}/4000</div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
                {Object.entries(PRIORITY_STYLES).map(([key, s]) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setPriority(key)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      priority === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer select-none">
                <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="accent-emerald-600" />
                Pin to top
              </label>
            </div>
            <button
              type="submit"
              disabled={posting}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-60"
            >
              {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Post announcement
            </button>
          </div>

          {formError && <p className="text-xs font-semibold text-rose-600">{formError}</p>}
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search announcements…"
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
          />
        </div>
        {subjectOptions.length > 2 && (
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {subjectOptions.map(s => (
              <button
                key={s}
                onClick={() => setSubjectFilter(s)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap transition-colors ${
                  subjectFilter === s
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'
                }`}
              >
                {s}
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

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl py-14 text-center">
          <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-800">
            {items.length === 0 ? 'No announcements yet' : 'Nothing matches your search'}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {items.length === 0
              ? (isTeacher ? 'Post the first notice for your students.' : 'Notices from your professors will show up here.')
              : 'Try another course or keyword.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((item, index) => (
            <div key={item.id} className={`stagger-${(index % 9) + 1}`}>
              <AnnouncementCard
                item={item}
                isTeacher={isTeacher}
                isMine={item.authorId === user?.id}
                isNew={item.authorId !== user?.id && new Date(item.createdAt).getTime() > seenSnapshot}
                now={now}
                busy={busyId === item.id}
                onTogglePin={handleTogglePin}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
