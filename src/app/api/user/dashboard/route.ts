import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const userId = user.userId;

    const [
      ordersCount,
      totalSpent,
      referralsCount,
      userData,
      recentOrders,
      referralList,
      walletTransactions,
    ] = await Promise.all([
      db.order.count({ where: { userId } }),
      db.order.aggregate({
        where: { userId, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      db.referral.count({ where: { referrerId: userId } }),
      db.user.findUnique({
        where: { id: userId },
        select: {
          walletBalance: true,
          referralCode: true,
          subscriptionPlan: true,
          subscriptionStatus: true,
          subscriptionExpiresAt: true,
        },
      }),
      db.order.findMany({
        where: { userId },
        include: { product: { select: { id: true, title: true, titleEn: true, thumbnailUrl: true, price: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      db.referral.findMany({
        where: { referrerId: userId },
        include: { referred: { select: { name: true, email: true, createdAt: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      db.walletTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      totalPurchases: ordersCount,
      totalSpent: totalSpent._sum.amount || 0,
      totalReferrals: referralsCount,
      walletBalance: userData?.walletBalance || 0,
      referralCode: userData?.referralCode || '',
      subscriptionPlan: userData?.subscriptionPlan || null,
      subscriptionStatus: userData?.subscriptionStatus || null,
      subscriptionExpiresAt: userData?.subscriptionExpiresAt || null,
      recentOrders,
      referralList,
      walletTransactions,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
