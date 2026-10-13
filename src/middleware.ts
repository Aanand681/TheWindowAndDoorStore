import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // If the user tries to access /admin but their role isn't SUPERADMIN or ADMIN, redirect them
    if (
      req.nextUrl.pathname.startsWith('/admin') &&
      !['SUPERADMIN', 'ADMIN'].includes(req.nextauth.token?.role as string)
    ) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Only logged-in users can access protected routes
    },
  }
);

// Define which routes this middleware should protect
export const config = {
  matcher: [
    '/',
    '/profile',
    '/admin/:path*'
  ],
};
