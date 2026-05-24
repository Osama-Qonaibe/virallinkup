import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notifyWalletWithdraw } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const { userId, amount } = await request.json();

    if (!userId || !amount) {
      return NextResponse.json({ error: 'User ID and amount are required' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || user.walletBalance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    await db.user.update({
      where: { id: userId },
      data: { walletBalance: { decrement: amount } },
    });

    const transaction = await db.walletTransaction.create({
      data: {
        userId,
        amount,
        type: 'DEBIT',
        description: 'Withdrawal request',
      },
    });

    // Send withdrawal notification (non-blocking)
    notifyWalletWithdraw(userId, amount).catch(() => {});

    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json({ error: 'Withdrawal failed' }, { status: 500 });
  }
}
