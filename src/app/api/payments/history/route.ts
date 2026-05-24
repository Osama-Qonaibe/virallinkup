import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const payments = await db.paymentIntent.findMany({
      where: { userId },
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
    console.error('Payment history error:', error);
    return NextResponse.json({ error: 'Failed to fetch payment history' }, { status: 500 });
  }
}
