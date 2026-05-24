import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();
    const testimonial = await db.testimonial.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.nameEn !== undefined && { nameEn: body.nameEn }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.contentEn !== undefined && { contentEn: body.contentEn }),
        ...(body.rating !== undefined && { rating: body.rating }),
        ...(body.avatarUrl !== undefined && { avatarUrl: body.avatarUrl }),
      },
    });
    return NextResponse.json(testimonial);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    await db.testimonial.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 });
  }
}
