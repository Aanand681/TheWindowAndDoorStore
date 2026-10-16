import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // If the user tries to access /admin but their role isn't SUPERADMIN or ADMIN, redirect them to home
    if (
      req.nextUrl.pathname.startsWith('/admin') &&
      !['SUPERADMIN', 'ADMIN'].includes(req.nextauth.token?.role as string)
    ) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  },
  {
    pages: {
      signIn: '/login',
    },
    callbacks: {
      authorized: ({ token }) => !!token, // Strictly require valid session token
    },
  }
);

// Industry standard: Default-deny - protect all routes except public auth and static assets
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api/auth (NextAuth authentication endpoints, forgot-password, reset-password)
     * - _next/static (static asset files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (browser metadata)
     * - login (login page)
     * - forgot-password (password reset request page)
     * - reset-password (password reset submit page)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|login|forgot-password|reset-password).*)',
  ],
};
