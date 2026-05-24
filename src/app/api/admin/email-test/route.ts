import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, testEmailConnection } from '@/lib/email';
import { requireAdmin } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { to, subject, message } = await request.json();
    if (!to || !subject) {
      return NextResponse.json({ error: 'To and Subject are required' }, { status: 400 });
    }

    const testResult = await testEmailConnection();
    if (!testResult.success) {
      return NextResponse.json({ error: testResult.message }, { status: 400 });
    }

    await sendEmail({
      to,
      subject,
      htmlAr: message || `<p style="color:#E8E8F0;font-size:15px;">${subject}</p>`,
      variables: {},
    });

    return NextResponse.json({ success: true, message: 'Test email sent' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to send test email';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
