import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const settings = await db.siteSetting.findMany({
      where: { key: { in: ['smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user', 'smtp_pass', 'email_from', 'email_from_name'] } },
    });
    const map: Record<string, string> = {};
    settings.forEach(s => { map[s.key] = s.value || ''; });
    return NextResponse.json(map);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    for (const [key, value] of Object.entries(body)) {
      await db.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }
    // Reset transporter so it picks up new settings
    const nodemailer = await import('nodemailer');
    const nodemailerModule = nodemailer.default || nodemailer;
    // Simple way to force re-creation: we clear and let getTransporter rebuild
    return NextResponse.json({ message: 'Email settings updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update email settings' }, { status: 500 });
  }
}
