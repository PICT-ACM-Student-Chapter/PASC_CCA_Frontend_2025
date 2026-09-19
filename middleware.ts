import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/reset-password', '/auth/change-password'];
const ROOT_PATH = '/';

function getAdminSecret(): string | undefined {
  return process.env.ADMIN_SECRET_ROUTE?.trim().replace(/^["']|["']$/g, '');
}

function isPathStartingWith(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ADMIN_SECRET = getAdminSecret();

  const token = req.cookies.get('token')?.value;
  const role = req.cookies.get('role')?.value as 'student' | 'admin' | undefined;

  // ── Block /auth/signup entirely ──────────────────────────────────────────
  // Signup is disabled; only DB-level registration is allowed.
  if (isPathStartingWith(pathname, '/auth/signup')) {
    return NextResponse.rewrite(new URL('/not-found', req.url));
  }

  // ── Block direct /admin access ───────────────────────────────────────────
  // /admin/* is only reachable through the secret route redirect.
  // However, once the admin is authenticated and the redirect has already
  // happened, we DO allow /admin/* through so sub-pages work normally.
  // Unauthenticated access to /admin/* (other than via secret route) → 404.
  const isAdminRoute = pathname.startsWith('/admin');
  const isStudentRoute = pathname.startsWith('/student');
  const isAuthRoute = PUBLIC_AUTH_PATHS.some((p) => isPathStartingWith(pathname, p));
  const isRoot = pathname === ROOT_PATH;

  // Secret route segment: /<ADMIN_SECRET>
  const isSecretAdminRoute = ADMIN_SECRET && (
    pathname === `/${ADMIN_SECRET}` || pathname.startsWith(`/${ADMIN_SECRET}/`)
  );

  // Require token for protected routes
  if ((isAdminRoute || isStudentRoute) && !token) {
    // For /admin routes reached without token, return 404 (not a redirect to login)
    if (isAdminRoute) {
      return NextResponse.rewrite(new URL('/not-found', req.url));
    }
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based restrictions
  if (isAdminRoute && role && role !== 'admin') {
    return NextResponse.redirect(new URL('/student/events', req.url));
  }

  if (isStudentRoute && role && role !== 'student') {
    // Admin is logged in and hits /student — send to admin area
    if (ADMIN_SECRET) {
      return NextResponse.redirect(new URL(`/${ADMIN_SECRET}`, req.url));
    }
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }

  // Prevent logged-in users from visiting auth pages or the landing page
  if ((isAuthRoute || isRoot) && token && role) {
    if (role === 'admin') {
      // Redirect admin to their secret route so the flow stays consistent
      if (ADMIN_SECRET) {
        return NextResponse.redirect(new URL(`/${ADMIN_SECRET}`, req.url));
      }
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
    return NextResponse.redirect(new URL('/student/events', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/student/:path*',
    '/auth/:path*',
    '/',
    '/:adminSecret*',
  ],
};

