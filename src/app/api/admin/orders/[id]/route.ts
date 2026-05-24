import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();
    const order = await db.order.update({
      where: { id },
      data: {
        ...(body.status !== undefined && { status: body.status }),
      },
    });
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    await db.order.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
