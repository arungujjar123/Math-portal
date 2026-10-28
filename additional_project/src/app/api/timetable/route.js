import { NextResponse } from 'next/server';
import { INSTITUTION_INFO, SECTIONS, TIME_SLOTS, DAYS, SECTION_TIMETABLES } from '@/lib/timetableData';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const selectedSection = searchParams.get('section') || 'ALL';
  const day = searchParams.get('day');

  let sectionKeys = Object.keys(SECTION_TIMETABLES);
  if (selectedSection !== 'ALL' && SECTION_TIMETABLES[selectedSection]) {
    sectionKeys = [selectedSection];
  }

  // Build combined or section-specific timetable structure
  const timetable = {};

  DAYS.forEach(d => {
    timetable[d] = {};

    TIME_SLOTS.forEach(ts => {
      if (ts.type === 'break') return;

      const slotId = ts.id;
      const sectionStatuses = [];
      const freeSections = [];
      const busySections = [];

      sectionKeys.forEach(secKey => {
        const secSlot = SECTION_TIMETABLES[secKey]?.[d]?.[slotId];
        if (secSlot) {
          if (secSlot.isFree) {
            freeSections.push(secKey);
          } else {
            busySections.push({
              section: secKey,
              course: secSlot.course,
              room: secSlot.room,
              name: secSlot.name
            });
          }
          sectionStatuses.push({
            section: secKey,
            ...secSlot
          });
        }
      });

      // If viewing a single section
      if (selectedSection !== 'ALL') {
        const singleSlot = SECTION_TIMETABLES[selectedSection]?.[d]?.[slotId] || { isFree: true, note: 'Free Slot' };
        timetable[d][slotId] = {
          isFree: singleSlot.isFree,
          course: singleSlot.course,
          room: singleSlot.room,
          name: singleSlot.name,
          note: singleSlot.isFree ? 'Free Slot' : `${singleSlot.course} (${singleSlot.room})`
        };
      } else {
        // If viewing ALL sections combined
        const isAllFree = freeSections.length === sectionKeys.length;
        timetable[d][slotId] = {
          isFree: isAllFree,
          freeSectionsCount: freeSections.length,
          totalSections: sectionKeys.length,
          freeSections: freeSections,
          busySections: busySections,
          items: busySections
        };
      }
    });
  });

  // Calculate section-specific or overall free slots list for teachers
  const freeSlotSummary = [];

  DAYS.forEach(d => {
    TIME_SLOTS.forEach(ts => {
      if (ts.type === 'break') return;
      const slotId = ts.id;

      if (selectedSection !== 'ALL') {
        const slot = SECTION_TIMETABLES[selectedSection]?.[d]?.[slotId];
        if (slot && slot.isFree) {
          freeSlotSummary.push({
            day: d,
            slotId: slotId,
            time: ts.time,
            section: selectedSection,
            note: `${selectedSection} Free`
          });
        }
      } else {
        // Find slots where at least 3 or all sections are free
        const freeInSlot = [];
        Object.keys(SECTION_TIMETABLES).forEach(secKey => {
          if (SECTION_TIMETABLES[secKey]?.[d]?.[slotId]?.isFree) {
            freeInSlot.push(secKey);
          }
        });

        if (freeInSlot.length > 0) {
          freeSlotSummary.push({
            day: d,
            slotId: slotId,
            time: ts.time,
            freeSections: freeInSlot,
            note: freeInSlot.length === 5 ? 'All 5 Sections Free!' : `${freeInSlot.length}/5 Sec Free (${freeInSlot.join(', ')})`
          });
        }
      }
    });
  });

  return NextResponse.json({
    institution: INSTITUTION_INFO,
    sections: SECTIONS,
    selectedSection,
    timeSlots: TIME_SLOTS,
    days: DAYS,
    timetable,
    freeSlotsCount: freeSlotSummary.length,
    freeSlotsList: freeSlotSummary
  });
}
