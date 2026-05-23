import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send reset link' }, { status: 500 });
  }
}
