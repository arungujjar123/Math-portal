'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Sparkles, Filter, Search, CheckCircle2, ArrowRight, Users, Layers, Bookmark, AlertCircle, CheckCircle, XCircle, UserCheck, ChevronDown, ChevronUp, Coffee } from 'lucide-react';
import { SECTION_TIMETABLES, SECTIONS } from '../lib/timetableData';

export default function Timetable({ user, onNavigateToChat }) {
  const isTeacher = user?.role === 'teacher';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [activeDay, setActiveDay] = useState('All');
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive Teacher Extra Class Finder State
  const [teacherDay, setTeacherDay] = useState('Wednesday');
  const [teacherSlotId, setTeacherSlotId] = useState(5); // Default: 02:15 PM - 03:15 PM
  const [showChecker, setShowChecker] = useState(true);

  useEffect(() => {
    fetchTimetable();
  }, [selectedSection]);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/timetable?section=${selectedSection}`);
      const resData = await res.json();
      setData(resData);
    } catch (err) {
      console.error('Failed to fetch timetable', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="space-y-5 py-8">
        <div className="h-24 bg-slate-200/60 rounded-xl animate-pulse"></div>
        <div className="h-96 bg-slate-100 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  const { institution, sections, timeSlots, days, timetable, freeSlotsCount, freeSlotsList } = data;
  const filteredDays = activeDay === 'All' ? days : [activeDay];

  // Helper to compute live status for all 5 sections for the selected teacher day/slot
  const targetTimeSlot = timeSlots.find(s => s.id === Number(teacherSlotId) || s.id === teacherSlotId);
  const realSections = SECTIONS.filter(s => s.id !== 'ALL');

  const sectionStatuses = realSections.map(sec => {
    const secSchedule = SECTION_TIMETABLES[sec.id]?.[teacherDay]?.[teacherSlotId];
    return {
      id: sec.id,
      name: sec.name,
      isFree: secSchedule ? secSchedule.isFree : true,
      course: secSchedule?.course,
      room: secSchedule?.room,
      nameLong: secSchedule?.name
    };
  });

  const freeCount = sectionStatuses.filter(s => s.isFree).length;

  return (
    <div className="space-y-5">
      
      {/* Top Banner (Rich Header) */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 border border-emerald-800/40 rounded-xl p-4 sm:p-5 text-white shadow-lg shadow-emerald-950/10 flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              {institution.name}
            </h2>
            <p className="text-xs text-emerald-200/80 hidden sm:block font-medium">{institution.batch} ({institution.session}) Timetable</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-2 rounded-lg flex items-center gap-2 text-white shrink-0">
          <Sparkles className="w-4 h-4 text-emerald-300" />
          <span className="text-xs sm:text-sm font-semibold">{freeSlotsCount} Free Slots</span>
        </div>
      </div>

      {/* Teacher Extra Class Checker */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-4">
        <div 
          className="flex items-center justify-between cursor-pointer group"
          onClick={() => setShowChecker(!showChecker)}
        >
          <div className="flex items-center gap-2 text-slate-800">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-semibold">Teacher Extra Class Checker</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
              {freeCount} of 5 Free
            </span>
            {showChecker ? <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />}
          </div>
        </div>

        {showChecker && (
          <div className="flex flex-col gap-4 animate-fade-in tab-content-enter">
            {/* Interactive Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto scrollbar-none">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex gap-1.5 shrink-0">
                  {days.map(d => (
                    <button
                      key={d}
                      onClick={() => setTeacherDay(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        teacherDay === d
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={teacherSlotId}
                  onChange={(e) => setTeacherSlotId(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-full"
                >
                  {timeSlots.filter(s => s.type === 'class').map(ts => (
                    <option key={ts.id} value={ts.id}>
                      {ts.time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3" key={`${teacherDay}-${teacherSlotId}`}>
              {sectionStatuses.map((sec, index) => (
                <div
                  key={sec.id}
                  className={`p-3 rounded-lg border transition-all duration-300 card-hover flex flex-col justify-between stagger-${index + 1} ${
                    sec.isFree
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-800">{sec.id}</span>
                      {sec.isFree ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Free
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200 text-slate-700 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Busy
                        </span>
                      )}
                    </div>

                    {!sec.isFree && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <strong className="text-slate-700 font-semibold truncate">{sec.course}</strong>
                          <span className="text-[11px] text-slate-500 shrink-0 ml-2 bg-white px-1 border border-slate-100 rounded">
                            {sec.room}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200">
                    {sec.isFree ? (
                      <button
                        onClick={() => {
                          if (onNavigateToChat) onNavigateToChat();
                        }}
                        className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center justify-center space-x-1 shadow-sm transition-colors"
                      >
                        <span>Book Class</span>
                      </button>
                    ) : (
                      <div className="text-[11px] text-slate-500 text-center py-1.5">
                        Occupied
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section Selection Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Select Section:
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          {sections.map(sec => {
            const isActive = selectedSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setSelectedSection(sec.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                {sec.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Free Slots Quick List */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Available Free Slots
            </h3>
          </div>
        </div>
        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-none">
          {freeSlotsList.slice(0, 9).map((fs, i) => (
            <div
              key={i}
              className="min-w-[180px] bg-emerald-50/50 border border-emerald-100 hover:border-emerald-200 p-3 rounded-lg flex flex-col gap-2 transition-all card-hover shrink-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{fs.day}</span>
                <span className="text-[11px] px-1.5 py-0.5 rounded font-medium bg-white border border-emerald-100 text-emerald-700">
                  {fs.note}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">{fs.time}</p>
              <button
                onClick={() => {
                  if (onNavigateToChat) onNavigateToChat();
                }}
                className="mt-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center justify-center space-x-1 transition-colors"
              >
                <span>Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto">
          {['All', ...days].map(d => (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                activeDay === d
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-emerald-50'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowFreeOnly(!showFreeOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              showFreeOnly
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-emerald-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Free Only</span>
          </button>
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>
      </div>

      {/* Table Grid */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
              <th className="py-3 px-4 w-44 border-r border-slate-200">Time Slot</th>
              {filteredDays.map(d => (
                <th key={d} className="py-3 px-4 text-center border-r border-slate-200 last:border-r-0">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs bg-white">
            {timeSlots.map((ts) => {
              if (ts.type === 'break') {
                return (
                  <tr key={ts.id} className="bg-slate-50/50 text-slate-700 border-y border-slate-200">
                    <td className="py-2 px-4 border-r border-slate-200 font-semibold">
                      {ts.time}
                    </td>
                    <td colSpan={filteredDays.length} className="py-2 px-4 text-center tracking-wider text-xs font-semibold">
                      <Coffee className="w-3.5 h-3.5 text-amber-600 inline mr-1.5" />
                      {ts.label}
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={ts.id} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="py-2.5 px-4 font-semibold text-slate-700 bg-white border-r border-slate-200 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{ts.time}</span>
                    </div>
                  </td>
                  {filteredDays.map(d => {
                    const slotData = timetable[d]?.[ts.id];
                    const isFree = slotData?.isFree;

                    if (showFreeOnly && !isFree) {
                      return (
                        <td key={d} className="py-2.5 px-3 border-r border-slate-200 last:border-r-0 text-center text-slate-300">
                          -
                        </td>
                      );
                    }

                    if (isFree) {
                      return (
                        <td key={d} className="py-2 px-3 border-r border-slate-200 last:border-r-0 align-top">
                          <div className="flex flex-col items-center gap-1.5 p-1.5">
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                              Free Slot
                            </span>
                            <button
                              onClick={() => {
                                if (onNavigateToChat) onNavigateToChat();
                              }}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium transition-colors"
                            >
                              {isTeacher ? 'Schedule' : 'Ask Doubt'}
                            </button>
                          </div>
                        </td>
                      );
                    }

                    if (selectedSection !== 'ALL') {
                      const matchesSearch = searchQuery === '' || 
                        (slotData?.course && slotData.course.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (slotData?.name && slotData.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (slotData?.room && slotData.room.toLowerCase().includes(searchQuery.toLowerCase()));

                      return (
                        <td
                          key={d}
                          className={`py-2 px-3 border-r border-slate-200 last:border-r-0 align-top ${
                            !matchesSearch ? 'opacity-30' : ''
                          }`}
                        >
                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex flex-col gap-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-semibold text-[11px] text-slate-800 break-words">{slotData?.course}</span>
                              <span className="px-1.5 py-0.5 rounded bg-white text-slate-600 text-[10px] border border-slate-200 shrink-0">
                                {slotData?.room}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 line-clamp-2">
                              {slotData?.name}
                            </div>
                          </div>
                        </td>
                      );
                    } else {
                      const items = slotData?.items || [];
                      const matchesSearch = searchQuery === '' || items.some(it => 
                        it.course.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        it.room.toLowerCase().includes(searchQuery.toLowerCase())
                      );

                      return (
                        <td
                          key={d}
                          className={`py-1.5 px-2 border-r border-slate-200 last:border-r-0 align-top ${
                            !matchesSearch ? 'opacity-30' : ''
                          }`}
                        >
                          <div className="flex flex-col gap-1">
                            {items.map((it, idx) => (
                              <div
                                key={idx}
                                className="p-1.5 rounded flex items-center justify-between text-[11px] bg-slate-50 border border-slate-100"
                              >
                                <div className="flex items-center gap-1.5 overflow-hidden">
                                  <span className="text-[10px] px-1 py-0.5 rounded bg-white border border-slate-200 text-slate-600 shrink-0">{it.section}</span>
                                  <span className="font-semibold text-slate-700 truncate">{it.course}</span>
                                </div>
                                <span className="px-1 py-0.5 rounded bg-white text-slate-500 text-[10px] border border-slate-200 shrink-0 ml-1">
                                  {it.room}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                      );
                    }
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
