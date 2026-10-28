import { NextResponse } from 'next/server';
import { ensureDatabaseSeeded } from '@/lib/dbInit';
import User from '@/models/User';

export async function POST(request) {
  try {
    await ensureDatabaseSeeded();

    const body = await request.json();
    const { email, password, role } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and Password are required' }, { status: 400 });
    }

    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email.trim()}$`, 'i') },
      password: password.trim()
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password. Please verify your institutional credentials.' },
        { status: 401 }
      );
    }

    if (role && user.role !== role) {
      return NextResponse.json(
        { error: `Account exists as ${user.role.toUpperCase()}, not ${role.toUpperCase()}` },
        { status: 403 }
      );
    }

    const userObj = user.toObject();
    delete userObj.password;

    return NextResponse.json({
      success: true,
      user: userObj
    });
  } catch (error) {
    console.error('MongoDB Atlas Auth Login Error:', error);
    return NextResponse.json(
      { error: 'Database Authentication Error' },
      { status: 500 }
    );
  }
}
