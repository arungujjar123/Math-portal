import { NextResponse } from 'next/server';
import { ensureDatabaseSeeded } from '@/lib/dbInit';
import Announcement from '@/models/Announcement';
import User from '@/models/User';

const PRIORITIES = ['normal', 'important', 'urgent'];

// The portal has no server session yet, so the best we can do is confirm the
// given id belongs to a real teacher account before allowing writes.
async function findTeacher(authorId) {
  if (!authorId || typeof authorId !== 'string') return null;
  return User.findOne({ id: authorId, role: 'teacher' }).lean();
}

export async function GET(request) {
  try {
    await ensureDatabaseSeeded();
    const subject = request.nextUrl.searchParams.get('subject');

    const query = {};
    if (subject && subject !== 'All') query.subject = subject;

    const announcements = await Announcement.find(query)
      .sort({ pinned: -1, createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('Announcements GET Error:', error);
    return NextResponse.json({ error: 'Failed to load announcements' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await ensureDatabaseSeeded();
    const { authorId, title, body, subject, priority, pinned } = await request.json();

    const teacher = await findTeacher(authorId);
    if (!teacher) {
      return NextResponse.json({ error: 'Only teachers can post announcements' }, { status: 403 });
    }

    const cleanTitle = typeof title === 'string' ? title.trim() : '';
    const cleanBody = typeof body === 'string' ? body.trim() : '';
    if (!cleanTitle || !cleanBody) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }
    if (cleanTitle.length > 150 || cleanBody.length > 4000) {
      return NextResponse.json({ error: 'Title max 150 and message max 4000 characters' }, { status: 400 });
    }

    const announcement = await Announcement.create({
      id: `ann-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: cleanTitle,
      body: cleanBody,
      subject: typeof subject === 'string' && subject.trim() ? subject.trim() : 'General',
      priority: PRIORITIES.includes(priority) ? priority : 'normal',
      pinned: Boolean(pinned),
      authorId: teacher.id,
      authorName: teacher.name,
      authorSubject: teacher.subject
    });

    return NextResponse.json({ success: true, announcement }, { status: 201 });
  } catch (error) {
    console.error('Announcements POST Error:', error);
    return NextResponse.json({ error: 'Failed to post announcement' }, { status: 500 });
  }
}

// Pin / unpin. Any teacher may pin so important notices stay on top for everyone.
export async function PATCH(request) {
  try {
    await ensureDatabaseSeeded();
    const { id, authorId, pinned } = await request.json();

    const teacher = await findTeacher(authorId);
    if (!teacher) {
      return NextResponse.json({ error: 'Only teachers can pin announcements' }, { status: 403 });
    }

    const announcement = await Announcement.findOneAndUpdate(
      { id },
      { pinned: Boolean(pinned) },
      { new: true }
    );
    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, announcement });
  } catch (error) {
    console.error('Announcements PATCH Error:', error);
    return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 });
  }
}

// Only the teacher who posted an announcement can delete it.
export async function DELETE(request) {
  try {
    await ensureDatabaseSeeded();
    const params = request.nextUrl.searchParams;
    const id = params.get('id');
    const authorId = params.get('authorId');

    const teacher = await findTeacher(authorId);
    if (!teacher) {
      return NextResponse.json({ error: 'Only teachers can delete announcements' }, { status: 403 });
    }

    const deleted = await Announcement.findOneAndDelete({ id, authorId: teacher.id });
    if (!deleted) {
      return NextResponse.json({ error: 'Announcement not found or not yours' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Announcements DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
  }
}
