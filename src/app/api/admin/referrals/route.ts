import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const referrals = await db.referral.findMany({
      include: {
        referrer: { select: { name: true, email: true } },
        referred: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalCommission = referrals.reduce((sum, r) => sum + r.commission, 0);

    return NextResponse.json({ referrals, total: referrals.length, totalCommission });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch referrals' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, status, commission } = body;
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const referral = await db.referral.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(commission !== undefined && { commission: parseFloat(commission) }),
      },
    });
    return NextResponse.json(referral);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update referral' }, { status: 500 });
  }
}
