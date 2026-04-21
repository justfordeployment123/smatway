import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/signin', '/signup', '/forgot-password', '/reset-password', '/api', '/_next', '/favicon.ico'];

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 1. Allow public paths and the landing page
    if (pathname === '/' || PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    // 2. Check for the access token in cookies
    const accessToken = req.cookies.get('access_token')?.value;

    if (!accessToken) {
        const url = new URL('/signin', req.url);
        return NextResponse.redirect(url);
    }

    // 3. Optional: Verify the token with the API
    try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3002';
        const res = await fetch(`${apiBase}/auth/me`, {
            headers: { Cookie: `access_token=${accessToken}` },
        });

        if (!res.ok) {
            return NextResponse.redirect(new URL('/signin', req.url));
        }

        return NextResponse.next();
    } catch (error) {
        // If the API is unreachable, we redirect to signin for safety
        return NextResponse.redirect(new URL('/signin', req.url));
    }
}

export const config = {
    // Match all request paths except for static files and images
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};