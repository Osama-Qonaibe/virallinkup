import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const authUser = getAuthUser(request);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const userId = authUser.userId;

    const [referrals, user] = await Promise.all([
      db.referral.findMany({
        where: { referrerId: userId },
        include: { referred: { select: { name: true, email: true, createdAt: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      db.user.findUnique({
        where: { id: userId },
        select: { referralCode: true, walletBalance: true },
      }),
    ]);

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
