// app/api/articles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Article from '@/models/Article';
import connectionToDatabase from '@/utils/mongodb'

export async function GET(req: NextRequest) {
    try {
        await connectionToDatabase();
        
        // Get query parameters
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const category = url.searchParams.get('category');
        const isFeatured = url.searchParams.get('isFeatured');
        const startDate = url.searchParams.get('startDate');
        const endDate = url.searchParams.get('endDate');
        
        // Build query
        const query: any = {};
        
        if (category) {
            query.category = category;
        }
        
        if (isFeatured === 'true') {
            query.isFeatured = true;
        }
        
        if (startDate || endDate) {
            query.publishDate = {};
            if (startDate) {
                query.publishDate.$gte = new Date(startDate);
            }
            if (endDate) {
                query.publishDate.$lte = new Date(endDate);
            }
        }
        
        // Calculate skip value for pagination
        const skip = (page - 1) * limit;
        
        // Get total count for pagination
        const total = await Article.countDocuments(query);
        
        // Get articles
        const articles = await Article.find(query)
            .populate('author', 'name email')
            .sort({ publishDate: -1 })
            .skip(skip)
            .limit(limit);
        
        return NextResponse.json({
            articles,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
        
    } catch (error) {
        console.error('Error fetching articles:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}




export async function POST(req: NextRequest) {
  try {
      await connectionToDatabase();
      const data = await req.json();
      
      const article = new Article(data);
      await article.save();
      
      return NextResponse.json(article);
  } catch (error) {
      console.error('Error creating article:', error);
      return NextResponse.json(
          { error: 'Internal Server Error' },
          { status: 500 }
      );
  }
}