// IIIT Sri City, Chittoor - Classroom & Lab Registry and Occupancy Helper

import { SECTION_TIMETABLES, SECTIONS, TIME_SLOTS } from './timetableData';

export const ALL_ROOMS = [
  { id: 'G04', name: 'G04 Lecture Hall', type: 'hall', block: 'G-Block Ground Floor', capacity: 120 },
  { id: 'G05', name: 'G05 Lecture Hall', type: 'hall', block: 'G-Block Ground Floor', capacity: 120 },
  { id: 'G06', name: 'G06 Lecture Hall', type: 'hall', block: 'G-Block Ground Floor', capacity: 120 },
  { id: 'G07', name: 'G07 Lecture Hall', type: 'hall', block: 'G-Block Ground Floor', capacity: 120 },
  { id: 'G08', name: 'G08 Lecture Hall', type: 'hall', block: 'G-Block Ground Floor', capacity: 120 },
  { id: 'G09', name: 'G09 Lecture Hall', type: 'hall', block: 'G-Block Ground Floor', capacity: 120 },
  { id: 'B03', name: 'B03 Lecture Hall', type: 'hall', block: 'B-Block 1st Floor', capacity: 90 },
  { id: 'B04', name: 'B04 Lecture Hall', type: 'hall', block: 'B-Block 1st Floor', capacity: 90 },
  { id: 'B05', name: 'B05 Lecture Hall', type: 'hall', block: 'B-Block 1st Floor', capacity: 90 },
  { id: '108', name: 'Room 108', type: 'hall', block: 'Academic Block 1st Floor', capacity: 75 },
  { id: '109', name: 'Room 109', type: 'hall', block: 'Academic Block 1st Floor', capacity: 75 },
  { id: 'Lab 103', name: 'Lab 103 (Computer Lab)', type: 'lab', block: 'Academic Block 1st Floor', capacity: 100 },
  { id: 'Lab B05', name: 'Lab B05 (Language Lab)', type: 'lab', block: 'B-Block Ground Floor', capacity: 60 },
  { id: 'Lab 114/102', name: 'Lab 114/102 (Embedded Systems Lab)', type: 'lab', block: 'Hardware Wing 1st Floor', capacity: 80 },
  { id: 'Lab 111', name: 'Lab 111 (AI/ML Lab)', type: 'lab', block: 'Academic Block 1st Floor', capacity: 80 }
];

/**
 * Given a day (e.g. 'Wednesday') and a slotId (e.g. 5 or '5'),
 * calculates which rooms are occupied by scheduled section classes
 * and which rooms are 100% vacant and available for booking/study.
 */
export function getRoomOccupancy(day = 'Wednesday', slotId = 5) {
  const realSections = SECTIONS.filter(s => s.id !== 'ALL');
  
  // Map of roomId -> occupancy info
  const roomStatusMap = {};

  // Initialize all rooms as vacant
  ALL_ROOMS.forEach(room => {
    roomStatusMap[room.id] = {
      ...room,
      isVacant: true,
      occupiedBy: null
    };
  });

  // Scan all section timetables for the given day & slotId
  realSections.forEach(sec => {
    const slotObj = SECTION_TIMETABLES[sec.id]?.[day]?.[slotId];
    if (slotObj && !slotObj.isFree && slotObj.room) {
      const assignedRoom = slotObj.room.trim();
      
      // Match room ID exactly or fuzzily
      const matchedRoom = ALL_ROOMS.find(r => 
        assignedRoom.toLowerCase().includes(r.id.toLowerCase()) || 
        r.id.toLowerCase().includes(assignedRoom.toLowerCase())
      );

      const targetKey = matchedRoom ? matchedRoom.id : assignedRoom;

      if (!roomStatusMap[targetKey]) {
        roomStatusMap[targetKey] = {
          id: targetKey,
          name: `${targetKey} Room`,
          type: targetKey.toLowerCase().includes('lab') ? 'lab' : 'hall',
          block: 'Academic Block',
          capacity: 80,
          isVacant: false,
          occupiedBy: []
        };
      } else {
        if (!roomStatusMap[targetKey].occupiedBy) {
          roomStatusMap[targetKey].occupiedBy = [];
        }
      }

      roomStatusMap[targetKey].isVacant = false;
      if (Array.isArray(roomStatusMap[targetKey].occupiedBy)) {
        roomStatusMap[targetKey].occupiedBy.push({
          section: sec.id,
          course: slotObj.course,
          name: slotObj.name
        });
      } else {
        roomStatusMap[targetKey].occupiedBy = [{
          section: sec.id,
          course: slotObj.course,
          name: slotObj.name
        }];
      }
    }
  });

  const roomsList = Object.values(roomStatusMap);
  const vacantCount = roomsList.filter(r => r.isVacant).length;
  const occupiedCount = roomsList.length - vacantCount;

  return {
    day,
    slotId,
    vacantCount,
    occupiedCount,
    totalRooms: roomsList.length,
    rooms: roomsList
  };
}
