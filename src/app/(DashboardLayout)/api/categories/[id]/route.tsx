// app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Categories from '@/models/Categories';
import connectionToDatabase from '@/utils/mongodb';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectionToDatabase();
    const body = await req.json();
    const updatedCategory = await Categories.findByIdAndUpdate(
      params.id,
      { name: body.name },
      { new: true }
    );
    if (!updatedCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ category: updatedCategory });
  } catch (error) {
    console.error('PUT /categories/:id error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectionToDatabase();
    const deletedCategory = await Categories.findByIdAndDelete(params.id);
    if (!deletedCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('DELETE /categories/:id error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
