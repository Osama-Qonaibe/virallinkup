import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const [
      orders,
      totalSpent,
      referrals,
      walletBalance,
    ] = await Promise.all([
      db.order.count({ where: { userId } }),
      db.order.aggregate({
        where: { userId, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      db.referral.count({ where: { referrerId: userId } }),
      db.user.findUnique({ where: { id: userId }, select: { walletBalance: true, referralCode: true } }),
    ]);

    const recentOrders = await db.order.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const referralList = await db.referral.findMany({
      where: { referrerId: userId },
      include: { referred: { select: { name: true, email: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      totalPurchases: orders,
      totalSpent: totalSpent._sum.amount || 0,
      totalReferrals: referrals,
      walletBalance: walletBalance?.walletBalance || 0,
      referralCode: walletBalance?.referralCode || '',
      recentOrders,
      referralList,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
