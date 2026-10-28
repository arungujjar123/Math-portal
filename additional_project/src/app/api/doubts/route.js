import { NextResponse } from 'next/server';
import { ensureDatabaseSeeded } from '@/lib/dbInit';
import Doubt from '@/models/Doubt';

// Keep only well-formed attachments coming from /api/upload
function sanitizeAttachments(attachments) {
  if (!Array.isArray(attachments)) return [];
  return attachments
    .filter(a => a && typeof a.url === 'string' && typeof a.name === 'string')
    .slice(0, 5)
    .map(({ url, name, type, size }) => ({ url, name, type, size }));
}

export async function GET(request) {
  try {
    await ensureDatabaseSeeded();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');

    let query = {};
    if (studentId) {
      query.studentId = studentId;
    }
    if (status && status !== 'All') {
      query.status = { $regex: new RegExp(`^${status}$`, 'i') };
    }

    const doubts = await Doubt.find(query).sort({ updatedAt: -1 });
    return NextResponse.json({ doubts });
  } catch (error) {
    console.error('MongoDB Atlas Doubts GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch doubts from database' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await ensureDatabaseSeeded();

    const body = await request.json();
    const { studentId, studentName, studentRoll, studentAvatar, subject, title, initialMessage } = body;
    const attachments = sanitizeAttachments(body.attachments);

    if (!title || (!initialMessage && attachments.length === 0)) {
      return NextResponse.json({ error: 'Title and a question (text or photo) are required' }, { status: 400 });
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newDoubt = new Doubt({
      id: `doubt-${Date.now()}`,
      studentId: studentId || 'u2',
      studentName: studentName || 'Rahul Verma',
      studentRoll: studentRoll || 'UG2026-CSE-042',
      studentAvatar: studentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      subject: subject || 'General',
      title,
      status: 'Pending',
      messages: [
        {
          senderId: studentId || 'u2',
          senderName: studentName || 'Rahul Verma',
          role: 'student',
          text: initialMessage || '',
          attachments,
          timestamp: timeStr
        }
      ]
    });

    await newDoubt.save();

    return NextResponse.json({ success: true, doubt: newDoubt }, { status: 201 });
  } catch (error) {
    console.error('MongoDB Atlas Doubts POST Error:', error);
    return NextResponse.json({ error: 'Failed to create doubt thread in database' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await ensureDatabaseSeeded();

    const body = await request.json();
    const { doubtId, senderId, senderName, role, text, newStatus } = body;
    const attachments = sanitizeAttachments(body.attachments);

    if (!doubtId || (!text && attachments.length === 0)) {
      return NextResponse.json({ error: 'Doubt ID and a message (text or attachment) are required' }, { status: 400 });
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const messageObj = {
      senderId,
      senderName,
      role: role || 'teacher',
      text: text || '',
      attachments,
      timestamp: timeStr
    };

    const updateFields = {
      $push: { messages: messageObj }
    };
    if (newStatus) {
      updateFields.status = newStatus;
    }

    const updatedDoubt = await Doubt.findOneAndUpdate(
      { id: doubtId },
      updateFields,
      { new: true }
    );

    if (!updatedDoubt) {
      return NextResponse.json({ error: 'Doubt thread not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, doubt: updatedDoubt });
  } catch (error) {
    console.error('MongoDB Atlas Doubts PUT Error:', error);
    return NextResponse.json({ error: 'Failed to update doubt thread in database' }, { status: 500 });
  }
}
