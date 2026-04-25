import { NextRequest, NextResponse } from 'next/server';

// Routes the proxy acts on.
const protectedRoutePrefixes = ['/dashboard'];
const authRoutes = ['/login'];
const publicRoutes = ['/', '/unauthorized'];

const ADMIN_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3002';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicRoutes.includes(pathname)) return NextResponse.next();
  if (authRoutes.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const isProtected = protectedRoutePrefixes.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get('admin_access_token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const res = await fetch(`${ADMIN_API_BASE_URL}/admin/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};
