import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Payment intent ID is required' }, { status: 400 });
    }

    const payment = await db.paymentIntent.findUnique({
      where: { id: paymentIntentId },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment intent not found' }, { status: 404 });
    }

    if (payment.status === 'COMPLETED') {
      return NextResponse.json({ status: payment.status, message: 'Payment already completed' });
    }

    // Complete the payment
    await db.paymentIntent.update({
      where: { id: paymentIntentId },
      data: { status: 'COMPLETED' },
    });

    // Process based on type
    if (payment.type === 'DEPOSIT') {
      await db.user.update({
        where: { id: payment.userId },
        data: { walletBalance: { increment: payment.amount } },
      });
      await db.walletTransaction.create({
        data: {
          userId: payment.userId,
          amount: payment.amount,
          type: 'CREDIT',
          description: `Wallet deposit - $${payment.amount.toFixed(2)} (Demo)`,
        },
      });
    } else if (payment.type === 'SUBSCRIPTION') {
      const metadata = payment.metadata ? JSON.parse(payment.metadata) : {};
      const plan = metadata.plan || 'BASIC';
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      await db.user.update({
        where: { id: payment.userId },
        data: {
          subscriptionPlan: plan,
          subscriptionStatus: 'ACTIVE',
          subscriptionExpiresAt: expiresAt,
        },
      });
    } else if (payment.type === 'PURCHASE') {
      const metadata = payment.metadata ? JSON.parse(payment.metadata) : {};
      if (metadata.productId) {
        await db.order.create({
          data: {
            userId: payment.userId,
            productId: metadata.productId,
            amount: payment.amount,
            status: 'COMPLETED',
            transactionId: payment.stripePaymentId,
          },
        });
        await db.product.update({
          where: { id: metadata.productId },
          data: { downloads: { increment: 1 } },
        });
      }
    }

    // Fetch updated user for response
    const updatedUser = await db.user.findUnique({ where: { id: payment.userId } });

    return NextResponse.json({
      status: 'COMPLETED',
      walletBalance: updatedUser?.walletBalance || 0,
      subscriptionPlan: updatedUser?.subscriptionPlan || null,
      subscriptionStatus: updatedUser?.subscriptionStatus || null,
      subscriptionExpiresAt: updatedUser?.subscriptionExpiresAt || null,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
