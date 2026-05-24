import nodemailer from 'nodemailer';
import { db } from './db';

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
}

async function getSmtpConfig(): Promise<SmtpConfig | null> {
  const settings = await db.siteSetting.findMany({
    where: { key: { in: ['smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user', 'smtp_pass', 'email_from', 'email_from_name'] } },
  });
  const map: Record<string, string> = {};
  settings.forEach(s => { map[s.key] = s.value || ''; });

  const host = map.smtp_host || process.env.SMTP_HOST || '';
  const user = map.smtp_user || process.env.SMTP_USER || '';
  const pass = map.smtp_pass || process.env.SMTP_PASS || '';

  if (!host || !user || !pass) return null;

  return {
    host,
    port: parseInt(map.smtp_port || process.env.SMTP_PORT || '587', 10),
    secure: (map.smtp_secure || process.env.SMTP_SECURE) === 'true',
    user,
    pass,
    fromName: map.email_from_name || process.env.EMAIL_FROM_NAME || 'ViralLinkUp',
    fromEmail: map.email_from || process.env.EMAIL_FROM || 'noreply@virallinkup.com',
  };
}

async function createTransporter(): Promise<nodemailer.Transporter | null> {
  const config = await getSmtpConfig();
  if (!config) {
    console.warn('[Email] SMTP not configured - emails will be logged only');
    return null;
  }
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
  });
}

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

function buildEmailHtml(contentHtml: string, lang: string = 'ar'): string {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const fontFamily = lang === 'ar' ? "'Cairo', 'Segoe UI', sans-serif" : "'Segoe UI', 'Cairo', sans-serif";
  const textAlign = lang === 'ar' ? 'right' : 'left';

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ViralLinkUp</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background-color:#0F0F1A;font-family:${fontFamily};min-height:100vh;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0F0F1A;min-height:100vh;">
    <tr>
      <td align="center" style="padding:30px 15px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td align="center" style="padding:30px 0 20px 0;border-bottom:2px solid rgba(246,26,90,0.3);">
              <img src="${getSiteUrl()}/logo.jpg" alt="ViralLinkUp" style="width:60px;height:60px;border-radius:12px;display:block;margin:0 auto;" />
              <h1 style="margin:12px 0 0 0;font-size:22px;font-weight:700;color:#F61A5A;">ViralLinkUp</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:35px 30px;text-align:${textAlign};">${contentHtml}</td>
          </tr>
          <tr>
            <td style="padding:25px 30px;border-top:2px solid rgba(246,26,90,0.3);background:rgba(26,26,46,0.8);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align:center;">
                    <p style="margin:0 0 8px 0;font-size:15px;font-weight:600;color:#E8E8F0;">${lang === 'ar' ? 'فريق الدعم' : 'Support Team'}</p>
                    <p style="margin:0 0 15px 0;font-size:13px;color:#F61A5A;">support@virallinkup.com</p>
                    <p style="margin:0;font-size:11px;color:#8888A0;">&copy; ${new Date().getFullYear()} ViralLinkUp. ${lang === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function replaceVariables(html: string, vars: Record<string, string>): string {
  let result = html;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return result;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  subjectEn?: string;
  htmlAr: string;
  htmlEn?: string;
  lang?: 'ar' | 'en';
  variables?: Record<string, string>;
  replyTo?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const { to, variables = {} } = options;
  const lang = options.lang || 'ar';

  const htmlContent = lang === 'en' && options.htmlEn
    ? replaceVariables(options.htmlEn, variables)
    : replaceVariables(options.htmlAr, variables);

  const subject = lang === 'en' && options.subjectEn
    ? replaceVariables(options.subjectEn, variables)
    : replaceVariables(options.subject, variables);

  const fullHtml = buildEmailHtml(htmlContent, lang);

  try {
    const transport = await createTransporter();
    if (transport) {
      const config = await getSmtpConfig();
      await transport.sendMail({
        from: `"${config?.fromName || 'ViralLinkUp'}" <${config?.fromEmail || 'noreply@virallinkup.com'}>`,
        to,
        subject,
        html: fullHtml,
        replyTo: options.replyTo,
      });
      console.log(`[Email] Sent to ${to}: ${subject}`);
      return true;
    }
  } catch (error) {
    console.error('[Email] Failed to send:', error);
  }

  console.log(`[Email - LOG ONLY] To: ${to}, Subject: ${subject}`);
  return false;
}

export async function sendEmailFromTemplate(
  templateKey: string,
  to: string,
  lang: 'ar' | 'en',
  variables: Record<string, string> = {},
): Promise<boolean> {
  const template = await db.emailTemplate.findUnique({ where: { key: templateKey } });
  if (!template || !template.isActive) {
    console.warn(`[Email] Template "${templateKey}" not found or inactive`);
    return false;
  }
  return sendEmail({
    to,
    subject: template.subject,
    subjectEn: template.subjectEn || undefined,
    htmlAr: template.bodyHtml,
    htmlEn: template.bodyHtmlEn || undefined,
    lang,
    variables,
  });
}

export async function testEmailConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const transport = await createTransporter();
    if (!transport) return { success: false, message: 'SMTP not configured' };
    await transport.verify();
    return { success: true, message: 'Connection successful' };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Connection failed';
    return { success: false, message: msg };
  }
}
