import { NextRequest, NextResponse } from 'next/server';

const ADMIN_ROUTES = ['/api/admin'];
const AUTH_ROUTES = [
  '/api/user',
  '/api/orders',
  '/api/payments/history',
  '/api/payments/cancel-subscription',
  '/api/payments/create-checkout',
  '/api/wallet',
  '/api/referrals',
  '/api/auth/me',
  '/api/notifications',
];

const RATE_LIMITS: Record<string, { window: number; max: number }> = {
  '/api/auth/login':           { window: 15 * 60 * 1000, max: 10 },
  '/api/auth/register':        { window: 60 * 60 * 1000, max: 5  },
  '/api/auth/forgot-password': { window: 60 * 60 * 1000, max: 5  },
};

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, config: { window: number; max: number }): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + config.window });
    return true;
  }
  if (entry.count >= config.max) return false;
  entry.count++;
  return true;
}

function getToken(request: NextRequest): string | null {
  const cookie = request.cookies.get('token')?.value;
  if (cookie) return cookie;
  const auth = request.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

function decodeJwtRole(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    return payload?.role || null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  const rateLimitConfig = RATE_LIMITS[pathname];
  if (rateLimitConfig && request.method === 'POST') {
    const key = `${pathname}:${ip}`;
    if (!checkRateLimit(key, rateLimitConfig)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } },
      );
    }
  }

  const isAdminRoute = ADMIN_ROUTES.some(r => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r));

  if (isAdminRoute || isAuthRoute) {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (isAdminRoute) {
      const role = decodeJwtRole(token);
      if (role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
  }

  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/api/user/:path*',
    '/api/orders/:path*',
    '/api/payments/history',
    '/api/payments/cancel-subscription',
    '/api/payments/create-checkout',
    '/api/wallet/:path*',
    '/api/referrals/:path*',
    '/api/auth/me',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/notifications/:path*',
    '/api/(.*)',
  ],
};
