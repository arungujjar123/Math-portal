import { NextResponse } from 'next/server';
import { getRoomOccupancy, ALL_ROOMS } from '@/lib/roomData';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const day = searchParams.get('day') || 'Wednesday';
    const slotIdStr = searchParams.get('slotId') || '5';
    const slotId = isNaN(slotIdStr) ? slotIdStr : Number(slotIdStr);

    const occupancyData = getRoomOccupancy(day, slotId);

    return NextResponse.json({
      success: true,
      data: occupancyData,
      allRooms: ALL_ROOMS
    });
  } catch (error) {
    console.error('Error in /api/rooms:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to compute room occupancy' },
      { status: 500 }
    );
  }
}
