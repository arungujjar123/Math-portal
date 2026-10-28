import { NextResponse } from 'next/server';
import { clearDatabaseForProduction, ensureDatabaseSeeded } from '@/lib/dbInit';

export async function GET() {
  try {
    await clearDatabaseForProduction();
    await ensureDatabaseSeeded();
    return NextResponse.json({
      success: true,
      message: 'MongoDB Atlas slides and doubts collections cleared. Portal is now 100% ready for real user uploads & live doubt threads!'
    });
  } catch (error) {
    console.error('Reset DB Error:', error);
    return NextResponse.json({ error: 'Failed to reset database' }, { status: 500 });
  }
}
