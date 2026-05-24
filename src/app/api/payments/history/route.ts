import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const authUser = getAuthUser(request);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const payments = await db.paymentIntent.findMany({
      where: { userId: authUser.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const formatted = payments.map(p => ({
      id: p.id,
      amount: p.amount,
      currency: p.currency,
      type: p.type,
      status: p.status,
      createdAt: p.createdAt,
      metadata: p.metadata ? JSON.parse(p.metadata) : null,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch payment history' }, { status: 500 });
  }
}
