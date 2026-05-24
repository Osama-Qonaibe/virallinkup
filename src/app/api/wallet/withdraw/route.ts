import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/admin-auth';
import { notifyWalletWithdraw } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  const authUser = getAuthUser(request);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    const parsedAmount = parseFloat(amount);
    const user = await db.user.findUnique({ where: { id: authUser.userId } });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.walletBalance < parsedAmount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    const [transaction] = await db.$transaction([
      db.walletTransaction.create({
        data: {
          userId: authUser.userId,
          amount: parsedAmount,
          type: 'DEBIT',
          description: 'Withdrawal request',
        },
      }),
      db.user.update({
        where: { id: authUser.userId },
        data: { walletBalance: { decrement: parsedAmount } },
      }),
    ]);

    notifyWalletWithdraw(authUser.userId, parsedAmount).catch(() => {});

    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json({ error: 'Withdrawal failed' }, { status: 500 });
  }
}
