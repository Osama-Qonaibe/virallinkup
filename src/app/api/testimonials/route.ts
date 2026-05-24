import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  try {
    const testimonials = await db.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(testimonials);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const testimonial = await db.testimonial.create({
      data: {
        name: body.name,
        nameEn: body.nameEn || null,
        content: body.content,
        contentEn: body.contentEn || null,
        rating: body.rating || 5,
        avatarUrl: body.avatarUrl || null,
      },
    });
    return NextResponse.json(testimonial);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
  }
}
