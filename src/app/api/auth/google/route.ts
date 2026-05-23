import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, name, referralCode: refCode } = await request.json();

    let referralCode = email?.split('@')[0] + Math.random().toString(36).substring(2, 7);

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role,
        referralCode: existingUser.referralCode,
        walletBalance: existingUser.walletBalance,
      });
    }

    const user = await db.user.create({
      data: {
        email: email || `google_${Date.now()}@virallinkup.com`,
        name: name || 'Google User',
        role: 'USER',
        referralCode,
        referredBy: refCode || null,
      },
    });

    if (refCode) {
      await db.referral.create({
        data: {
          referrerId: refCode,
          referredId: user.id,
          commission: 5,
          status: 'PENDING',
        },
      });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      referralCode: user.referralCode,
      walletBalance: user.walletBalance,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Google auth failed' }, { status: 500 });
  }
}
