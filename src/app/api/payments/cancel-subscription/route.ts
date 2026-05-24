import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import Stripe from 'stripe';
import { getAuthUser } from '@/lib/admin-auth';
import { notifySubscriptionCancel } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  const authUser = getAuthUser(request);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await db.user.findUnique({ where: { id: authUser.userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (!user.stripeSubscriptionId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
    }

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

    const updatedUser = await db.user.update({
      where: { id: authUser.userId },
      data: { subscriptionStatus: 'CANCELLED', stripeSubscriptionId: null },
    });

    if (user.subscriptionPlan) {
      notifySubscriptionCancel(authUser.userId, user.subscriptionPlan).catch(() => {});
    }

    return NextResponse.json({
      message: 'Subscription cancelled successfully',
      subscriptionStatus: updatedUser.subscriptionStatus,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
  }
}
