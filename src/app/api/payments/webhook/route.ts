import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import Stripe from 'stripe';

async function getStripeKeys() {
  const keys = await db.siteSetting.findMany({
    where: { key: { in: ['stripe_secret_key', 'stripe_webhook_secret'] } },
  });
  const map: Record<string, string> = {};
  keys.forEach(k => { map[k.key] = k.value || ''; });
  return map;
}

async function completePayment(paymentIntentId: string, stripePaymentId: string) {
  const payment = await db.paymentIntent.findUnique({ where: { id: paymentIntentId } });
  if (!payment) return;

  await db.paymentIntent.update({
    where: { id: paymentIntentId },
    data: { status: 'COMPLETED', stripePaymentId },
  });

  if (payment.type === 'DEPOSIT') {
    // Credit wallet balance
    await db.user.update({
      where: { id: payment.userId },
      data: { walletBalance: { increment: payment.amount } },
    });
    // Create wallet transaction
    await db.walletTransaction.create({
      data: {
        userId: payment.userId,
        amount: payment.amount,
        type: 'CREDIT',
        description: `Wallet deposit - $${payment.amount.toFixed(2)}`,
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
          transactionId: stripePaymentId,
        },
      });
      await db.product.update({
        where: { id: metadata.productId },
        data: { downloads: { increment: 1 } },
      });
    }
  }
}

async function failPayment(paymentIntentId: string, reason: string) {
  await db.paymentIntent.update({
    where: { id: paymentIntentId },
    data: { status: 'FAILED' },
  }).catch(() => {});
  console.error(`Payment ${paymentIntentId} failed: ${reason}`);
}

export async function POST(request: NextRequest) {
  try {
    const keys = await getStripeKeys();
    const isDemoMode = !keys.stripe_secret_key || !keys.stripe_webhook_secret;

    if (isDemoMode) {
      // Demo mode webhook handler
      const body = await request.json();
      const { event } = body;

      if (event === 'checkout.session.completed') {
        const { paymentIntentId, stripePaymentId } = body;
        if (paymentIntentId) {
          await completePayment(paymentIntentId, stripePaymentId || `demo_${Date.now()}`);
        }
      } else if (event === 'invoice.payment_failed') {
        const { paymentIntentId, reason } = body;
        if (paymentIntentId) {
          await failPayment(paymentIntentId, reason || 'Demo payment failed');
        }
      }
      return NextResponse.json({ received: true });
    }

    // Live mode: verify Stripe webhook signature
    const stripe = new Stripe(keys.stripe_secret_key, { apiVersion: '2025-04-30.basil' });
    const sig = request.headers.get('stripe-signature');

    if (!sig) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        await request.text(),
        sig,
        keys.stripe_webhook_secret,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Webhook signature verification failed';
      console.error('Webhook verification error:', message);
      return NextResponse.json({ error: message }, { status: 400 });
    }

    // Handle events
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentIntentId = session.metadata?.paymentIntentId;
      if (paymentIntentId) {
        await completePayment(paymentIntentId, session.id);
      }
    } else if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice;
      const paymentIntentId = invoice.metadata?.paymentIntentId;
      if (paymentIntentId) {
        await completePayment(paymentIntentId, invoice.id);
      }
      // Also update subscription status
      if (invoice.customer) {
        const user = await db.user.findFirst({ where: { stripeCustomerId: invoice.customer as string } });
        if (user) {
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + 1);
          await db.user.update({
            where: { id: user.id },
            data: { subscriptionStatus: 'ACTIVE', subscriptionExpiresAt: expiresAt },
          });
        }
      }
    } else if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice;
      const paymentIntentId = invoice.metadata?.paymentIntentId;
      if (paymentIntentId) {
        await failPayment(paymentIntentId, 'Invoice payment failed');
      }
      if (invoice.customer) {
        const user = await db.user.findFirst({ where: { stripeCustomerId: invoice.customer as string } });
        if (user) {
          await db.user.update({
            where: { id: user.id },
            data: { subscriptionStatus: 'PAST_DUE' },
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
