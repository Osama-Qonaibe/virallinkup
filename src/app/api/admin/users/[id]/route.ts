import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        walletBalance: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionExpiresAt: true,
        stripeCustomerId: true,
        referralCode: true,
        referredBy: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { orders: true, referralsMade: true } },
      },
    });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();

    const user = await db.user.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.role !== undefined && { role: body.role }),
        ...(body.walletBalance !== undefined && { walletBalance: parseFloat(body.walletBalance) }),
        ...(body.subscriptionPlan !== undefined && { subscriptionPlan: body.subscriptionPlan }),
        ...(body.subscriptionStatus !== undefined && { subscriptionStatus: body.subscriptionStatus }),
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    await db.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
