import { NextRequest, NextResponse } from "next/server";

// Define protected routes that require admin role
const adminRoutes = ["/dashboard"];
const authRoutes = ["/login"];
const publicRoutes = ["/", "/unauthorized"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow auth routes (login, signup, etc.)
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for admin role on protected routes
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    // In a real application, you would:
    // 1. Check session/auth token
    // 2. Verify admin role
    // 3. Redirect to unauthorized if not admin

    // For now, we'll just allow it to pass through
    // In production, implement actual role checking:
    // const token = request.cookies.get("auth-token")?.value;
    // if (!token || !isAdminRole(token)) {
    //   return NextResponse.redirect(new URL("/unauthorized", request.url));
    // }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
