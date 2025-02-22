import { NextRequest, NextResponse } from 'next/server';
import Article from '@/models/Article';
import connectionToDatabase from '@/utils/mongodb'

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectionToDatabase();
        const article = await Article.findById(params.id).populate('author', 'name email');
        
        if (!article) {
            return NextResponse.json(
                { error: 'Article not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json(article);
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectionToDatabase();
        const data = await req.json();
        
        const article = await Article.findByIdAndUpdate(
            params.id,
            { ...data, lastUpdated: new Date() },
            { new: true }
        );
        
        if (!article) {
            return NextResponse.json(
                { error: 'Article not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json(article);
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}






























