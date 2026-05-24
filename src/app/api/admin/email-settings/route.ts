import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const settings = await db.siteSetting.findMany({
      where: { key: { in: ['smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user', 'smtp_pass', 'email_from', 'email_from_name'] } },
    });
    const map: Record<string, string> = {};
    settings.forEach(s => { map[s.key] = s.value || ''; });
    return NextResponse.json(map);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch email settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    for (const [key, value] of Object.entries(body)) {
      await db.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }
    return NextResponse.json({ message: 'Email settings updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update email settings' }, { status: 500 });
  }
}
