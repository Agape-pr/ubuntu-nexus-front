import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public and protected routes
const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
const protectedPrefixes = ['/dashboard', '/checkout', '/orders', '/profile', '/seller'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
