import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // CSRF Protection: Verify Origin on state-changing API mutations
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
    const isApiRoute =
      req.nextUrl.pathname.startsWith('/api/') &&
      !req.nextUrl.pathname.startsWith('/api/auth');

    if (isMutation && isApiRoute) {
      const origin = req.headers.get('origin');
      if (origin) {
        try {
          const originUrl = new URL(origin);
          const reqUrl = req.nextUrl;
          const isSameOrigin = originUrl.origin === reqUrl.origin;
          const isAllowedDev = [
            'localhost',
            '127.0.0.1',
            '10.0.0.194',
            '192.168.2.211',
          ].includes(originUrl.hostname);

          if (!isSameOrigin && !isAllowedDev) {
            return new NextResponse(
              JSON.stringify({ error: 'CSRF validation failed: cross-origin mutation forbidden' }),
              { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
          }
        } catch {
          return new NextResponse(
            JSON.stringify({ error: 'Invalid Origin header' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // If the user tries to access /admin but lacks admin access, redirect them to home
    const role = req.nextauth.token?.role as string;
    const canAccessAdmin = Boolean(req.nextauth.token?.canAccessAdmin);
    if (
      req.nextUrl.pathname.startsWith('/admin') &&
      !['SUPERADMIN', 'ADMIN'].includes(role) &&
      !canAccessAdmin
    ) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
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
