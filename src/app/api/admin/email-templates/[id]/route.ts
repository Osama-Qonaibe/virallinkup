import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const template = await db.emailTemplate.update({
      where: { id },
      data: {
        ...(body.subject !== undefined && { subject: body.subject }),
        ...(body.subjectEn !== undefined && { subjectEn: body.subjectEn }),
        ...(body.bodyHtml !== undefined && { bodyHtml: body.bodyHtml }),
        ...(body.bodyHtmlEn !== undefined && { bodyHtmlEn: body.bodyHtmlEn }),
        ...(body.variables !== undefined && { variables: JSON.stringify(body.variables) }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update template' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.emailTemplate.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 400 });
  }
}
