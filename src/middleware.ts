import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public and protected routes
const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
const protectedPrefixes = ['/dashboard', '/checkout', '/orders', '/profile', '/seller'];

// The admin console is served only on the admin host(s). Public hosts return 404 for
// /admin, and admin hosts serve nothing else. localhost serves both for development.
const adminHosts = (process.env.ADMIN_HOSTS || 'admin.ubuntunow.rw')
  .split(',')
  .map((h) => h.trim().toLowerCase())
  .filter(Boolean);
const devHosts = ['localhost', '127.0.0.1'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const host = (request.headers.get('host') || '').split(':')[0].toLowerCase();
  const isAdminPath = pathname === '/admin' || pathname.startsWith('/admin/');
  if (adminHosts.includes(host)) {
    if (isAdminPath) return NextResponse.next();
    if (pathname === '/') return NextResponse.redirect(new URL('/admin', request.url));
    return NextResponse.rewrite(new URL('/404', request.url), { status: 404 });
  }
  if (isAdminPath && !devHosts.includes(host)) {
    return NextResponse.rewrite(new URL('/404', request.url), { status: 404 });
  }

  // Shop pages are ALWAYS public
  // e.g. /shop/amara-fashion, /shop/amara-fashion/product/silk-blouse
  if (pathname.startsWith('/shop')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('access_token')?.value;

  const isPublicRoute = publicRoutes.includes(pathname);
  const isProtectedRoute = protectedPrefixes.some(prefix => pathname.startsWith(prefix));

  if (!token) {
    // If the route requires authentication, redirect to login with a next parameter
    if (isProtectedRoute) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
  } else {
    // If the user has a token and tries to access login/register, send them to home/dashboard
    if (isPublicRoute && pathname !== '/') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except static assets, images, API routes, and Next internals
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)'],
};
