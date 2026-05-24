import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const { secretKey } = await request.json();

    if (!secretKey) {
      return NextResponse.json({ error: 'Secret key is required' }, { status: 400 });
    }

    try {
      const stripe = new Stripe(secretKey, { apiVersion: '2025-04-30.basil' });
      const balance = await stripe.balance.retrieve();
      return NextResponse.json({
        success: true,
        message: 'Connection successful',
        available: balance.available[0]?.amount,
        currency: balance.available[0]?.currency,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      console.error('Stripe connection test error:', message);
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
  } catch (error) {
    console.error('Test connection error:', error);
    return NextResponse.json({ error: 'Connection test failed' }, { status: 500 });
  }
}
