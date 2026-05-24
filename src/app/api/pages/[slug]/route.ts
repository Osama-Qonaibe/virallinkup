import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const page = await db.page.findUnique({ where: { slug } });
    if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    return NextResponse.json(page);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { slug } = await params;
    const body = await request.json();
    const page = await db.page.upsert({
      where: { slug },
      update: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.titleEn !== undefined && { titleEn: body.titleEn }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.contentEn !== undefined && { contentEn: body.contentEn }),
      },
      create: {
        slug,
        title: body.title || slug,
        titleEn: body.titleEn || null,
        content: body.content || '',
        contentEn: body.contentEn || null,
        type: body.type || 'LEGAL',
      },
    });
    return NextResponse.json(page);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
  }
}
