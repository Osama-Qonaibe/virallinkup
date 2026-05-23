import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const referrals = await db.referral.findMany({
      where: { referrerId: userId },
      include: { referred: { select: { name: true, email: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { referralCode: true, walletBalance: true },
    });

    return NextResponse.json({
      referralCode: user?.referralCode || '',
      walletBalance: user?.walletBalance || 0,
      referrals,
      totalReferrals: referrals.length,
      totalCommission: referrals.reduce((sum, r) => sum + r.commission, 0),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch referrals' }, { status: 500 });
  }
}
