import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import Stripe from 'stripe';

const PLANS: Record<string, number> = {
  BASIC: 9.99,
  PRO: 24.99,
  PREMIUM: 49.99,
};

async function getStripeKeys() {
  const keys = await db.siteSetting.findMany({
    where: { key: { in: ['stripe_secret_key', 'stripe_publishable_key', 'stripe_webhook_secret', 'stripe_mode', 'payment_currency'] } },
  });
  const map: Record<string, string> = {};
  keys.forEach(k => { map[k.key] = k.value || ''; });
  return map;
}

export async function POST(request: NextRequest) {
  try {
    const { type, amount, plan, productId, userId } = await request.json();

    if (!userId || !type) {
      return NextResponse.json({ error: 'User ID and payment type are required' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const keys = await getStripeKeys();
    const isDemoMode = !keys.stripe_secret_key || !keys.stripe_publishable_key;
    const currency = keys.payment_currency || 'usd';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

    let paymentAmount = amount || 0;
    let metadata: Record<string, string> = {};

    if (type === 'subscription' && plan) {
      paymentAmount = PLANS[plan] || 0;
      metadata.plan = plan;
    } else if (type === 'deposit') {
      if (!paymentAmount || paymentAmount <= 0) {
        return NextResponse.json({ error: 'Valid amount is required for deposit' }, { status: 400 });
      }
    } else if (type === 'purchase' && productId) {
      const product = await db.product.findUnique({ where: { id: productId } });
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      paymentAmount = product.price;
      metadata.productId = productId;
    }

    if (paymentAmount <= 0) {
      return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 });
    }

    const amountInCents = Math.round(paymentAmount * 100);
    const simulatedPaymentId = `demo_pi_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    const paymentIntent = await db.paymentIntent.create({
      data: {
        userId,
        stripePaymentId: isDemoMode ? simulatedPaymentId : 'pending_stripe_' + Date.now(),
        amount: paymentAmount,
        currency,
        type: type.toUpperCase(),
        status: 'PENDING',
        metadata: JSON.stringify(metadata),
      },
    });

    if (isDemoMode) {
      return NextResponse.json({
        sessionId: paymentIntent.id,
        paymentIntentId: paymentIntent.id,
        url: `/api/payments/verify?demo=true&paymentIntentId=${paymentIntent.id}`,
        demoMode: true,
      });
    }

    const stripe = new Stripe(keys.stripe_secret_key, { apiVersion: '2025-04-30.basil' });

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await db.user.update({ where: { id: userId }, data: { stripeCustomerId: customerId } });
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode: type === 'subscription' ? 'subscription' : 'payment',
      line_items: type === 'subscription' && plan
        ? [{
            price_data: {
              currency,
              unit_amount: amountInCents,
              recurring: { interval: 'month' },
              product_data: {
                name: `${plan} Plan - ViralLinkUp`,
                description: `${plan} subscription plan`,
              },
            },
            quantity: 1,
          }]
        : [{
            price_data: {
              currency,
              unit_amount: amountInCents,
              product_data: {
                name: type === 'deposit' ? 'Wallet Deposit - ViralLinkUp' : 'Product Purchase - ViralLinkUp',
                description: type === 'deposit' ? `Deposit $${paymentAmount.toFixed(2)} to wallet` : `Purchase product`,
              },
            },
            quantity: 1,
          }],
      metadata: {
        paymentIntentId: paymentIntent.id,
        type: type,
        userId: userId,
        ...(plan ? { plan } : {}),
        ...(productId ? { productId } : {}),
      },
      success_url: `${siteUrl}/?payment=success&sessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/?payment=cancelled`,
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    await db.paymentIntent.update({
      where: { id: paymentIntent.id },
      data: { stripePaymentId: session.id },
    });

    return NextResponse.json({
      sessionId: session.id,
      paymentIntentId: paymentIntent.id,
      url: session.url,
      demoMode: false,
    });
  } catch (error: unknown) {
    console.error('Checkout error:', error);
    const message = error instanceof Error ? error.message : 'Checkout creation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
