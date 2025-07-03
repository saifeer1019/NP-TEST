// app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Categories from '@/models/Categories';
import connectionToDatabase from '@/utils/mongodb';

export async function GET(req: NextRequest) {
  try {
    await connectionToDatabase();
    const categories = await Categories.find();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('GET /categories error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectionToDatabase();
    const body = await req.json();
    const newCategory = await Categories.create({ name: body.name });
    return NextResponse.json({ category: newCategory }, { status: 201 });
  } catch (error) {
    console.error('POST /categories error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
