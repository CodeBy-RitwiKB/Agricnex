import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve the Better Auth session token
  const sessionToken = request.cookies.get("better-auth.session_token") || 
                       request.cookies.get("__Secure-better-auth.session_token");

  const isLoggedIn = !!sessionToken;

  // 1. Routes that logged-in users CANNOT visit (redirect to dashboard)
  // This keeps the user secure and prevents going back to auth pages unless they sign out
  const authRoutes = ['/login', '/signup'];
  if (isLoggedIn && authRoutes.includes(pathname)) {
    const userRole = request.cookies.get("user-role")?.value || "customer";
    if (userRole === "merchant") {
      return NextResponse.redirect(new URL('/merchant', request.url));
    } else if (userRole === "admin") {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/user/dashboard', request.url));
  }

  // 2. Protected routes that anonymous users CANNOT visit (redirect to login)
  // Protects user dashboards, checkout flow, and profile configurations
  const protectedRoutePrefixes = ['/user', '/merchant', '/admin', '/profile', '/checkout'];
  const isProtectedPath = protectedRoutePrefixes.some(prefix => pathname.startsWith(prefix));

  if (!isLoggedIn && isProtectedPath && pathname !== '/admin/login') {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
