import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.stripeSubscriptionId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
    }

    // Check if Stripe keys are configured
    const secretKeySetting = await db.siteSetting.findUnique({ where: { key: 'stripe_secret_key' } });
    const hasStripeKeys = secretKeySetting?.value && secretKeySetting.value.length > 0;

    if (hasStripeKeys) {
      try {
        const stripe = new Stripe(secretKeySetting.value!, { apiVersion: '2025-04-30.basil' });
        await stripe.subscriptions.cancel(user.stripeSubscriptionId);
      } catch (err) {
        console.error('Stripe cancel error:', err);
      }
    }

    // Update user subscription status
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'CANCELLED',
        stripeSubscriptionId: null,
      },
    });

    return NextResponse.json({
      message: 'Subscription cancelled successfully',
      subscriptionStatus: updatedUser.subscriptionStatus,
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
  }
}
