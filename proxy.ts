import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  // PUBLIC ROUTES
  const publicRoutes = [
    '/',
    '/about',
    '/contact',
    '/products',
    '/login',
    '/register',
    '/forgot-password',
  ];

  const isStaticFile = Boolean(
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp)$/)
  );

  const isPublicRoute =
    publicRoutes.includes(pathname) ||
    pathname.startsWith('/products/') ||
    pathname.startsWith('/_next') ||
    isStaticFile;

  // AUTH ROUTES
  const authRoutes = ['/login', '/register', '/forgot-password'];
  const isAuthRoute = authRoutes.includes(pathname);

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // PROTECTED ROUTES - Let client-side handle auth check since token is in localStorage
  // These pages will redirect to login if needed using useEffect
  
  // ADMIN ROUTES - Let client-side handle auth and admin check
  // Admin layout will redirect to login if not authenticated or not admin
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
