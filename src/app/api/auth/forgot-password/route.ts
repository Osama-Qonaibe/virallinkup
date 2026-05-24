import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notifyPasswordReset } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (user) {
      // Send password reset notification + email (non-blocking)
      notifyPasswordReset(user.id, user.name || email, email).catch(() => {});
    }

    return NextResponse.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send reset link' }, { status: 500 });
  }
}
