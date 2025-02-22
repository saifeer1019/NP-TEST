import { NextResponse } from 'next/server';
import connectionToDatabase from '@/utils/mongodb'
import User from '@/models/User'

export async function POST(request: Request) {
  await connectionToDatabase();

  const { email, password } = await request.json();

  try {
    const user = await User.create({ email, password });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }
}