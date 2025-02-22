import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET!;
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET); // Encode secret for jose

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  console.log('Extracted Token:', token); // Debugging

  if (!token) {
    console.log('No token found. Redirecting...');
    return NextResponse.redirect(new URL('/authentication/login', request.url));
  }

  try {
    console.log('Verifying Token...');
    const { payload } = await jwtVerify(token, SECRET_KEY);
    console.log('Token Verified:', payload);

    return NextResponse.next();
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return NextResponse.redirect(new URL('/authentication/login', request.url));
  }
}

// Apply middleware to protected routes
export const config = {
  matcher: ['/admin/:path*', '/profile/:path*'],
};

