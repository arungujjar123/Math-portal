'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Calendar, Clock, CheckCircle2, XCircle, Search, ArrowRight, DoorOpen, Sparkles, Check } from 'lucide-react';
import { TIME_SLOTS, DAYS } from '@/lib/timetableData';

export default function RoomFinder({ user, onNavigateToChat }) {
  const isTeacher = user?.role === 'teacher';
  const [day, setDay] = useState('Wednesday');
  const [slotId, setSlotId] = useState(5); // Default: 02:15 PM - 03:15 PM
  const [roomType, setRoomType] = useState('all'); // 'all', 'hall', 'lab'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'vacant', 'occupied'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  
  // Reservation modal state
  const [selectedReservationRoom, setSelectedReservationRoom] = useState(null);
  const [reservationNotice, setReservationNotice] = useState('');

  useEffect(() => {
    fetchRoomData();
  }, [day, slotId]);

  const fetchRoomData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rooms?day=${day}&slotId=${slotId}`);
      const resData = await res.json();
      if (resData.success) {
        setData(resData.data);
      }
    } catch (err) {
      console.error('Failed to fetch room occupancy data', err);
    } finally {
      setLoading(false);
    }
  };

  const currentSlotObj = TIME_SLOTS.find(s => s.id === Number(slotId) || s.id === slotId);

  // Filter rooms based on controls
  const filteredRooms = data?.rooms.filter(room => {
    const matchesType = roomType === 'all' || room.type === roomType;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'vacant' && room.isVacant) || 
      (statusFilter === 'occupied' && !room.isVacant);
    const matchesSearch = searchQuery === '' || 
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      room.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.block.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesStatus && matchesSearch;
  }) || [];

  const handleConfirmReservation = () => {
    if (!selectedReservationRoom) return;
    setReservationNotice(`Successfully reserved ${selectedReservationRoom.id} for ${day} (${currentSlotObj?.time})! Announcement posted.`);
    setSelectedReservationRoom(null);
    setTimeout(() => {
      if (onNavigateToChat) onNavigateToChat();
    }, 1200);
  };

  if (loading || !data) {
    return (
      <div className="space-y-5 py-8">
        <div className="h-20 bg-slate-200/60 rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-44 bg-slate-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      
      {/* Reservation Toast Alert */}
      {reservationNotice && (
        <div className="p-4 bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-between animate-slide-up">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5" />
            <span>{reservationNotice}</span>
          </div>
          <button onClick={() => setReservationNotice('')} className="text-white/80 hover:text-white text-xs font-mono">✕</button>
        </div>
      )}

      {/* Top Banner (Rich Glassmorphic Header) */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 border border-emerald-800/40 rounded-xl p-4 sm:p-5 text-white shadow-lg shadow-emerald-950/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Empty Classroom & Lab Finder
            </h2>
            <p className="text-xs text-emerald-200/80 hidden sm:block font-medium">Find vacant rooms for extra classes or self-study</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold">
          <span className="text-emerald-300">{data.vacantCount} Vacant</span> <span className="mx-2 opacity-50">•</span> <span className="text-rose-300">{data.occupiedCount} Occupied</span>
        </div>
      </div>

      {/* Interactive Controls Bar: Day, Time Slot, Filters */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs space-y-4">
        
        {/* Row 1: Day & Time Selectors */}
        <div className="flex flex-col md:flex-row gap-4 md:items-end border-b border-slate-100 pb-4">
          
          {/* Day Selector */}
          <div className="flex-1 space-y-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Select Day:</span>
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {DAYS.map(d => (
                <button
                  key={d}
                  onClick={() => setDay(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap active:scale-95 ${
                    day === d
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slot Picker */}
          <div className="w-full md:w-64 space-y-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Time Slot:</span>
            </label>
            <select
              value={slotId}
              onChange={(e) => setSlotId(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-900 font-semibold text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer shadow-xs"
            >
              {TIME_SLOTS.filter(s => s.type === 'class').map(ts => (
                <option key={ts.id} value={ts.id}>
                  Slot {ts.id}: {ts.time}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Row 2: Category Filters & Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Type Filters */}
            <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setRoomType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  roomType === 'all' ? 'bg-white text-emerald-700 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Types
              </button>
              <button
                onClick={() => setRoomType('hall')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  roomType === 'hall' ? 'bg-white text-emerald-700 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Halls
              </button>
              <button
                onClick={() => setRoomType('lab')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  roomType === 'lab' ? 'bg-white text-emerald-700 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Labs
              </button>
            </div>

            <div className="hidden lg:block w-px h-6 bg-slate-200"></div>

            {/* Status Filter */}
            <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'all' ? 'bg-white text-slate-800 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setStatusFilter('vacant')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  statusFilter === 'vacant' ? 'bg-emerald-50 text-emerald-700 shadow-xs border border-emerald-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Vacant
              </button>
              <button
                onClick={() => setStatusFilter('occupied')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  statusFilter === 'occupied' ? 'bg-rose-50 text-rose-700 shadow-xs border border-rose-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-rose-500"></div> Occupied
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full lg:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search room (e.g. G04, Lab 103)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-xs"
            />
          </div>

        </div>

      </div>

      {/* Grid of Rooms */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Showing {filteredRooms.length} Rooms for {day} ({currentSlotObj?.time})</span>
        </div>

        {filteredRooms.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 space-y-2 shadow-xs">
            <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="font-bold text-sm text-slate-700">No matching rooms found</h4>
            <p className="text-xs text-slate-400">Try changing your search query or status filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredRooms.map((room, index) => {
              const staggerClass = `stagger-${(index % 8) + 1}`;

              return (
                <div
                  key={room.id}
                  className={`p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between group shadow-xs card-hover ${staggerClass} ${
                    room.isVacant
                      ? 'bg-gradient-to-b from-white to-emerald-50/30 border-emerald-200'
                      : 'bg-white border-slate-200 opacity-90'
                  }`}
                >
                  <div className="space-y-3">
                    
                    {/* Header: Room Name & Status Pill */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                          <DoorOpen className={`w-4 h-4 ${room.isVacant ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span>{room.id}</span>
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">{room.block}</p>
                      </div>

                      {room.isVacant ? (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Vacant
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-slate-400" /> Occupied
                        </span>
                      )}
                    </div>

                    {/* Occupied Details or Vacant Info */}
                    {!room.isVacant && room.occupiedBy ? (
                      <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                        <div className="text-[11px] font-semibold text-slate-500 mb-1">Scheduled Class:</div>
                        {Array.isArray(room.occupiedBy) ? (
                          room.occupiedBy.map((occ, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-slate-800">{occ.course}</span>
                              <span className="px-1.5 py-0.5 rounded font-medium bg-slate-100 text-slate-600">{occ.section}</span>
                            </div>
                          ))
                        ) : (
                          <div className="font-semibold text-slate-800">{room.occupiedBy}</div>
                        )}
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-emerald-100/50 text-emerald-700 text-[11px] font-medium flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>Available for Extra Class</span>
                      </div>
                    )}

                    <div className="text-[11px] text-slate-500 font-medium pt-1">
                      Capacity: {room.capacity} Seats
                    </div>

                  </div>

                  {/* Footer Action Button */}
                  <div className="mt-4 pt-3 border-t border-slate-100/60">
                    {room.isVacant ? (
                      <button
                        onClick={() => setSelectedReservationRoom(room)}
                        className="w-full py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
                      >
                        <span>Reserve Room</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="text-[11px] text-slate-400 font-medium text-center py-1">
                        Class until {currentSlotObj?.time.split('-')[1]}
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reservation Confirmation Modal */}
      {selectedReservationRoom && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <DoorOpen className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">
                  Reserve {selectedReservationRoom.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReservationRoom(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p className="leading-relaxed font-medium">
                You are reserving <strong className="text-slate-900">{selectedReservationRoom.name}</strong> ({selectedReservationRoom.block}) for an extra class or doubt session.
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Day:</span>
                  <strong className="text-slate-900 font-semibold">{day}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Time Slot:</span>
                  <strong className="text-slate-900 font-semibold">{currentSlotObj?.time}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Capacity:</span>
                  <strong className="text-emerald-700 font-semibold">{selectedReservationRoom.capacity} Seats</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setSelectedReservationRoom(null)}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReservation}
                className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Announce</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
