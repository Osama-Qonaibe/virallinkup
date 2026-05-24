import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/admin-auth';
import { notifyPayment, notifyWalletDeposit, notifySubscription, notifyPurchase } from '@/lib/notifications';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const demo = searchParams.get('demo');
    const paymentIntentId = searchParams.get('paymentIntentId');

    if (demo === 'true' && paymentIntentId) {
      return NextResponse.redirect(
        new URL(`/?payment=pending&id=${paymentIntentId}`, request.url),
      );
    }

    return NextResponse.redirect(new URL('/', request.url));
  } catch {
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export async function POST(request: NextRequest) {
  const authUser = getAuthUser(request);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Payment intent ID is required' }, { status: 400 });
    }

    const payment = await db.paymentIntent.findUnique({ where: { id: paymentIntentId } });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.userId !== authUser.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (payment.status === 'COMPLETED') {
      const user = await db.user.findUnique({ where: { id: authUser.userId } });
      return NextResponse.json({
        status: 'COMPLETED',
        walletBalance: user?.walletBalance || 0,
        subscriptionPlan: user?.subscriptionPlan || null,
        subscriptionStatus: user?.subscriptionStatus || null,
        subscriptionExpiresAt: user?.subscriptionExpiresAt || null,
      });
    }

    await db.paymentIntent.update({ where: { id: paymentIntentId }, data: { status: 'COMPLETED' } });

    if (payment.type === 'DEPOSIT') {
      await db.$transaction([
        db.user.update({
          where: { id: payment.userId },
          data: { walletBalance: { increment: payment.amount } },
        }),
        db.walletTransaction.create({
          data: {
            userId: payment.userId,
            amount: payment.amount,
            type: 'CREDIT',
            description: `Wallet deposit - $${payment.amount.toFixed(2)}`,
          },
        }),
      ]);
      notifyWalletDeposit(payment.userId, payment.amount).catch(() => {});
    } else if (payment.type === 'SUBSCRIPTION') {
      const metadata = payment.metadata ? JSON.parse(payment.metadata) : {};
      const plan = metadata.plan || 'BASIC';
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      await db.user.update({
        where: { id: payment.userId },
        data: { subscriptionPlan: plan, subscriptionStatus: 'ACTIVE', subscriptionExpiresAt: expiresAt },
      });
      notifySubscription(payment.userId, plan).catch(() => {});
    } else if (payment.type === 'PURCHASE') {
      const metadata = payment.metadata ? JSON.parse(payment.metadata) : {};
      if (metadata.productId) {
        const product = await db.product.findUnique({ where: { id: metadata.productId } });
        await db.$transaction([
          db.order.create({
            data: {
              userId: payment.userId,
              productId: metadata.productId,
              amount: payment.amount,
              status: 'COMPLETED',
              transactionId: payment.stripePaymentId,
            },
          }),
          db.product.update({
            where: { id: metadata.productId },
            data: { downloads: { increment: 1 } },
          }),
        ]);
        if (product) {
          notifyPurchase(payment.userId, product.title, product.titleEn || product.title, payment.amount).catch(() => {});
        }
      }
    }

    notifyPayment(payment.userId, payment.amount, payment.type).catch(() => {});

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
