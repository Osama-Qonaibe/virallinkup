import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const templates = await db.emailTemplate.findMany({
      orderBy: { key: 'asc' },
    });
    return NextResponse.json(templates);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch email templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { key, subject, subjectEn, bodyHtml, bodyHtmlEn, variables, isActive } = body;

    if (!key || !bodyHtml) {
      return NextResponse.json({ error: 'Key and bodyHtml are required' }, { status: 400 });
    }

    const template = await db.emailTemplate.create({
      data: {
        key,
        subject: subject || '',
        subjectEn: subjectEn || null,
        bodyHtml,
        bodyHtmlEn: bodyHtmlEn || null,
        variables: JSON.stringify(variables || []),
        isActive: isActive !== false,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error && error.message.includes('Unique') ? 'Template key already exists' : 'Failed to create template';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
