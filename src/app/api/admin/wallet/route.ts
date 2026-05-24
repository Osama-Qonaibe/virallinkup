import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const transactions = await db.walletTransaction.findMany({
      where: userId ? { userId } : undefined,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { userId, amount, type, description } = await request.json();

    if (!userId || !amount || !type) {
      return NextResponse.json({ error: 'userId, amount, type are required' }, { status: 400 });
    }

    const parsedAmount = parseFloat(amount);

    const [transaction] = await db.$transaction([
      db.walletTransaction.create({
        data: { userId, amount: parsedAmount, type, description: description || '' },
      }),
      db.user.update({
        where: { id: userId },
        data: {
          walletBalance: type === 'CREDIT'
            ? { increment: parsedAmount }
            : { decrement: parsedAmount },
        },
      }),
    ]);

    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process wallet transaction' }, { status: 500 });
  }
}
