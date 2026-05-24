import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const [
      totalRevenue,
      totalUsers,
      totalProducts,
      totalOrders,
      recentOrders,
    ] = await Promise.all([
      db.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      db.user.count(),
      db.product.count(),
      db.order.count(),
      db.order.findMany({
        include: { product: true, user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const monthlyRevenue = await db.order.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        },
      },
      _sum: { amount: true },
    });

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.amount || 0,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      totalUsers,
      totalProducts,
      totalOrders,
      recentOrders,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
