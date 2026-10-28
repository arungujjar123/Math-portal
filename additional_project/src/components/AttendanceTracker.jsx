'use client';

import React, { useState, useEffect } from 'react';
import { Percent, CheckCircle2, AlertTriangle, XCircle, Plus, Minus, RotateCcw, AlertCircle } from 'lucide-react';

const INITIAL_COURSES = [
  { id: 'ranac', name: 'Real Analysis, Numerical Analysis & Calculus (RANAC)', code: 'RANAC', total: 24, attended: 20 },
  { id: 'dbms', name: 'Database Management Systems (DBMS)', code: 'DBMS', total: 22, attended: 18 },
  { id: 'os', name: 'Operating System (OS)', code: 'OS', total: 20, attended: 14 },
  { id: 'adsa', name: 'Advanced Data Structure & Algorithms (ADSA)', code: 'ADSA', total: 26, attended: 21 },
  { id: 'oop', name: 'Object Oriented Programming (OOP)', code: 'OOP', total: 22, attended: 17 },
  { id: 'pc', name: 'Professional Communication (PC)', code: 'PC', total: 16, attended: 13 }
];

export default function AttendanceTracker({ user }) {
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [targetPercentage, setTargetPercentage] = useState(75);

  useEffect(() => {
    const saved = localStorage.getItem('iiits_attendance_data');
    if (saved) {
      try {
        setCourses(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved attendance data', e);
      }
    }
  }, []);

  const saveAttendance = (updatedCourses) => {
    setCourses(updatedCourses);
    localStorage.setItem('iiits_attendance_data', JSON.stringify(updatedCourses));
  };

  const handleMarkPresent = (courseId) => {
    const updated = courses.map(c => {
      if (c.id === courseId) {
        return { ...c, total: c.total + 1, attended: c.attended + 1 };
      }
      return c;
    });
    saveAttendance(updated);
  };

  const handleMarkAbsent = (courseId) => {
    const updated = courses.map(c => {
      if (c.id === courseId) {
        return { ...c, total: c.total + 1 };
      }
      return c;
    });
    saveAttendance(updated);
  };

  const handleResetCourse = (courseId) => {
    const updated = courses.map(c => {
      if (c.id === courseId) {
        const initial = INITIAL_COURSES.find(ic => ic.id === courseId);
        return initial ? { ...initial } : { ...c, total: 0, attended: 0 };
      }
      return c;
    });
    saveAttendance(updated);
  };

  // Overall Statistics
  const totalClasses = courses.reduce((acc, c) => acc + c.total, 0);
  const totalAttended = courses.reduce((acc, c) => acc + c.attended, 0);
  const overallPercentage = totalClasses > 0 ? ((totalAttended / totalClasses) * 100).toFixed(1) : 0;

  const lowAttendanceCount = courses.filter(c => {
    const pct = c.total > 0 ? (c.attended / c.total) * 100 : 100;
    return pct < targetPercentage;
  }).length;

  return (
    <div className="space-y-5">
      
      {/* Rich Glassmorphic Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 border border-emerald-800/40 rounded-xl p-4 sm:p-5 text-white shadow-lg shadow-emerald-950/10 flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Attendance Tracker
            </h2>
            <p className="text-xs text-emerald-200/80 hidden sm:block font-medium">UG2 Academic Criteria & Bunk Calculator</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2 rounded-lg text-right">
          <div className="text-base sm:text-lg font-bold text-white leading-tight">{overallPercentage}%</div>
          <div className="text-[11px] text-emerald-200 font-medium">{totalAttended}/{totalClasses} Classes Attended</div>
        </div>
      </div>

      {/* Alert Banner if any course is below 75% */}
      {lowAttendanceCount > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200/80 text-amber-900 flex items-center gap-3 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <div className="text-xs font-semibold">
            Warning: {lowAttendanceCount} Subject(s) currently short of the mandatory {targetPercentage}% attendance criteria.
          </div>
        </div>
      )}

      {/* Main Course Attendance Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between font-bold text-sm text-slate-800">
          <span>Course Breakdown</span>
          <div className="flex items-center space-x-3 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Safe (&ge;75%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span>Critical (&lt;75%)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course, index) => {
            const pct = course.total > 0 ? ((course.attended / course.total) * 100).toFixed(1) : '100.0';
            const numericPct = Number(pct);
            const isLow = numericPct < targetPercentage;

            // Bunk & Recovery Calculator Math
            let bunkStatus = { type: 'safe', text: '' };
            if (numericPct >= targetPercentage) {
              const safeBunks = Math.floor((4 * course.attended - 3 * course.total) / 3);
              if (safeBunks > 0) {
                bunkStatus = { type: 'safe', text: `You can safely bunk next ${safeBunks} class(es) while staying above 75%.` };
              } else {
                bunkStatus = { type: 'warning', text: `At 75% threshold. Attendance required for next class.` };
              }
            } else {
              const requiredClasses = Math.max(1, (3 * course.total) - (4 * course.attended));
              bunkStatus = { type: 'critical', text: `Must attend next ${requiredClasses} consecutive class(es) to reach 75%.` };
            }

            return (
              <div
                key={course.id}
                className={`stagger-${(index % 6) + 1} p-4 rounded-xl border border-slate-200/90 transition-all duration-300 flex flex-col justify-between space-y-4 bg-white shadow-xs hover:shadow-md card-hover`}
              >
                
                {/* Course Header */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/80">
                      {course.code}
                    </span>
                    {isLow ? (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-rose-500" /> SHORT ({pct}%)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> SAFE ({pct}%)
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-1">
                    {course.name}
                  </h3>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isLow ? 'bg-gradient-to-r from-rose-500 to-red-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        }`}
                        style={{ width: `${Math.min(100, numericPct)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                      <span>Attended: {course.attended} / {course.total}</span>
                      <span>Missed: {course.total - course.attended}</span>
                    </div>
                  </div>
                </div>

                {/* Bunk Advice Box (No Emoji, Clean Icons) */}
                <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 border ${
                  bunkStatus.type === 'safe'
                    ? 'bg-emerald-50/60 border-emerald-100 text-emerald-900'
                    : bunkStatus.type === 'warning'
                    ? 'bg-amber-50/60 border-amber-100 text-amber-900'
                    : 'bg-rose-50/60 border-rose-100 text-rose-900'
                }`}>
                  {bunkStatus.type === 'safe' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  {bunkStatus.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
                  {bunkStatus.type === 'critical' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                  <span className="leading-snug">{bunkStatus.text}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center space-x-2 flex-1">
                    <button
                      onClick={() => handleMarkPresent(course.id)}
                      className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center space-x-1 shadow-sm active:scale-95 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Present</span>
                    </button>
                    <button
                      onClick={() => handleMarkAbsent(course.id)}
                      className="flex-1 py-2 px-3 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center justify-center space-x-1 active:scale-95 transition-all"
                    >
                      <Minus className="w-3.5 h-3.5" />
                      <span>Absent</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleResetCourse(course.id)}
                    title="Reset to default"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
