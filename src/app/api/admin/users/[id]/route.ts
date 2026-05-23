import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const user = await db.user.update({
      where: { id },
      data: {
        name: body.name,
        role: body.role,
        walletBalance: body.walletBalance !== undefined ? parseFloat(body.walletBalance) : undefined,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
