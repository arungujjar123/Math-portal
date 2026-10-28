import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { name, email, password, role, department, subject, rollNo, batch } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, Institutional Email, Password, and Role are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already registered in MongoDB Atlas
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this institutional email already exists. Please Sign In.' },
        { status: 400 }
      );
    }

    // Create new real user record
    const newUser = new User({
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      password: password.trim(),
      role,
      department: department ? department.trim() : (role === 'teacher' ? 'Computer Science & Engineering' : ''),
      subject: subject ? subject.trim() : (role === 'teacher' ? 'DBMS & Systems' : ''),
      rollNo: rollNo ? rollNo.trim() : (role === 'student' ? 'UG2026-CSE-001' : ''),
      batch: batch ? batch.trim() : 'UG 2 (Monsoon 2026)'
    });

    await newUser.save();

    const userObj = newUser.toObject();
    delete userObj.password;

    return NextResponse.json(
      { success: true, message: 'Account created successfully! Please Sign In.', user: userObj },
      { status: 201 }
    );
  } catch (error) {
    console.error('MongoDB Atlas Signup Error:', error);
    return NextResponse.json(
      { error: 'Failed to create user account in database' },
      { status: 500 }
    );
  }
}
