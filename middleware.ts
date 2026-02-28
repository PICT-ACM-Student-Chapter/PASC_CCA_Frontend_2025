import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/signup', '/auth/reset-password', '/auth/change-password'];
const ROOT_PATH = '/';

function isPathStartingWith(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get('token')?.value;
  const role = req.cookies.get('role')?.value as 'student' | 'admin' | undefined;

  const isAdminRoute = pathname.startsWith('/admin');
  const isStudentRoute = pathname.startsWith('/student');
  const isAuthRoute = PUBLIC_AUTH_PATHS.some((p) => isPathStartingWith(pathname, p));
  const isRoot = pathname === ROOT_PATH;

  // 1) Protect /admin/* and /student/* – require a token
  if ((isAdminRoute || isStudentRoute) && !token) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2) Role-based restrictions
  if (isAdminRoute && role && role !== 'admin') {
    // Logged in but not an admin -> send to student area
    return NextResponse.redirect(new URL('/student/events', req.url));
  }

  if (isStudentRoute && role && role !== 'student') {
    // Logged in but not a student -> send to admin area
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }

  // 3) Prevent logged-in users from visiting auth pages or landing page
  if ((isAuthRoute || isRoot) && token && role) {
    const target = role === 'admin' ? '/admin/dashboard' : '/student/events';
    return NextResponse.redirect(new URL(target, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/student/:path*', '/auth/:path*', '/'],
};

