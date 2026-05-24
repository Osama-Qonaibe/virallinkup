import { NextResponse } from 'next/server';
import { clearTokenCookie } from '@/lib/jwt';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });
    const headers = new Headers(response.headers);
    headers.append('Set-Cookie', clearTokenCookie());
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
