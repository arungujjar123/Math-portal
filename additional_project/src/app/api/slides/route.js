import { NextResponse } from 'next/server';
import { ensureDatabaseSeeded } from '@/lib/dbInit';
import Slide from '@/models/Slide';

export async function GET(request) {
  try {
    await ensureDatabaseSeeded();

    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');

    let query = {};
    if (subject && subject !== 'All') {
      query.subject = { $regex: new RegExp(`^${subject}$`, 'i') };
    }

    const slides = await Slide.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ slides });
  } catch (error) {
    console.error('MongoDB Atlas Slides GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch slides from database' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await ensureDatabaseSeeded();

    const body = await request.json();
    const { title, subject, description, teacherName, fileType, fileSize, fileUrl } = body;

    if (!title || !subject) {
      return NextResponse.json({ error: 'Title and Subject are required fields' }, { status: 400 });
    }

    const newSlide = new Slide({
      id: `slide-${Date.now()}`,
      title,
      subject,
      uploadedBy: teacherName || 'Dr. Ananya Sharma',
      uploadDate: new Date().toISOString().split('T')[0],
      fileSize: fileSize || '3.5 MB',
      fileType: fileType || 'pdf',
      description: description || 'Official course slide deck published to IIIT Sri City portal.',
      fileUrl: fileUrl || 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf',
      downloads: 0
    });

    await newSlide.save();

    return NextResponse.json({ success: true, slide: newSlide }, { status: 201 });
  } catch (error) {
    console.error('MongoDB Atlas Slide POST Error:', error);
    return NextResponse.json({ error: 'Failed to publish slide to database' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await ensureDatabaseSeeded();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Slide ID is required' }, { status: 400 });
    }

    await Slide.deleteOne({ id });

    return NextResponse.json({ success: true, message: 'Slide deleted from MongoDB Atlas database' });
  } catch (error) {
    console.error('MongoDB Atlas Slide DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete slide from database' }, { status: 500 });
  }
}
