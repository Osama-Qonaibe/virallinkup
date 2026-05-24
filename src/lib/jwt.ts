import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'virallinkup-super-secret-key-change-in-production-2024';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function setTokenCookie(response: Response, token: string) {
  const isProduction = process.env.NODE_ENV === 'production';
  const headers = new Headers(response.headers);
  headers.append(
    'Set-Cookie',
    `token=${token}; Path=/; HttpOnly; Secure=${isProduction}; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`
  );
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function clearTokenCookie(): string {
  return 'token=; Path=/; HttpOnly; Max-Age=0';
}

export function getTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/token=([^;]+)/);
  return match ? match[1] : null;
}
