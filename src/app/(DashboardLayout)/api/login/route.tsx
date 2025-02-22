

import { NextResponse } from 'next/server';
import connectionToDatabase from '@/utils/mongodb'
import User from '@/models/User'
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    await connectionToDatabase();

    const { email, password } = await request.json();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const isAdmin = await user.role == 'admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: '1h',
    });

    console.log(`token: ${token}`); // Check if this logs in terminal

    return new NextResponse(JSON.stringify({ token }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
