import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    await db.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
