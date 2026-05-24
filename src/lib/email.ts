import nodemailer from 'nodemailer';
import { db } from './db';

let transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter | null> {
  if (transporter) return transporter;

  const settings = await db.siteSetting.findMany({
    where: { key: { in: ['smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user', 'smtp_pass', 'email_from', 'email_from_name'] } },
  });
  const map: Record<string, string> = {};
  settings.forEach(s => { map[s.key] = s.value || ''; });

  const host = map.smtp_host || process.env.SMTP_HOST;
  const port = parseInt(map.smtp_port || process.env.SMTP_PORT || '587', 10);
  const secure = (map.smtp_secure || process.env.SMTP_SECURE) === 'true';
  const user = map.smtp_user || process.env.SMTP_USER;
  const pass = map.smtp_pass || process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('[Email] SMTP not configured - emails will be logged only');
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return transporter;
}

function getFromAddress(): string {
  const fromName = process.env.EMAIL_FROM_NAME || 'ViralLinkUp';
  const fromEmail = process.env.EMAIL_FROM || 'noreply@virallinkup.com';
  return `"${fromName}" <${fromEmail}>`;
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

          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding:30px 0 20px 0;border-bottom:2px solid rgba(246,26,90,0.3);">
              <img src="${getSiteUrl()}/logo.jpg" alt="ViralLinkUp" style="width:60px;height:60px;border-radius:12px;display:block;margin:0 auto;" />
              <h1 style="margin:12px 0 0 0;font-size:22px;font-weight:700;background:linear-gradient(135deg,#B01743,#F61A5A,#FF6B8A);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;color:#F61A5A;">
                ViralLinkUp
              </h1>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding:35px 30px;text-align:${textAlign};">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer / Signature -->
          <tr>
            <td style="padding:25px 30px;border-top:2px solid rgba(246,26,90,0.3);background:rgba(26,26,46,0.8);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align:center;">
                    <p style="margin:0 0 8px 0;font-size:15px;font-weight:600;color:#E8E8F0;">${lang === 'ar' ? 'فريق الدعم' : 'Support Team'}</p>
                    <p style="margin:0 0 15px 0;font-size:13px;color:#F61A5A;">support@virallinkup.com</p>
                    <div style="margin:0 0 15px 0;padding:0;">
                      <a href="${getSiteUrl()}/legal-page?slug=about" style="color:#B4CDD3;text-decoration:none;font-size:12px;margin:0 8px;">${lang === 'ar' ? 'من نحن' : 'About Us'}</a>
                      <a href="${getSiteUrl()}/legal-page?slug=privacy-policy" style="color:#B4CDD3;text-decoration:none;font-size:12px;margin:0 8px;">${lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</a>
                      <a href="${getSiteUrl()}/legal-page?slug=terms-conditions" style="color:#B4CDD3;text-decoration:none;font-size:12px;margin:0 8px;">${lang === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}</a>
                    </div>
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

  // Determine language
  const lang = options.lang || 'ar';

  // Use custom or default template
  const htmlContent = lang === 'en' && options.htmlEn
    ? replaceVariables(options.htmlEn, variables)
    : replaceVariables(options.htmlAr, variables);

  const subject = lang === 'en' && options.subjectEn
    ? replaceVariables(options.subjectEn, variables)
    : replaceVariables(options.subject, variables);

  const fullHtml = buildEmailHtml(htmlContent, lang);

  // Try to send via SMTP
  try {
    const transport = await getTransporter();
    if (transport) {
      await transport.sendMail({
        from: getFromAddress(),
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

  // Log email if SMTP not configured
  console.log(`[Email - LOG ONLY] To: ${to}, Subject: ${subject}, Lang: ${lang}`);
  console.log(`[Email - LOG ONLY] HTML length: ${fullHtml.length}`);
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

  const subject = lang === 'en' && template.subjectEn
    ? template.subjectEn
    : template.subject;

  const bodyHtml = lang === 'en' && template.bodyHtmlEn
    ? template.bodyHtmlEn
    : template.bodyHtml;

  return sendEmail({
    to,
    subject,
    subjectEn: template.subjectEn || undefined,
    htmlAr: template.bodyHtml,
    htmlEn: template.bodyHtmlEn || undefined,
    lang,
    variables,
  });
}

export async function testEmailConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const transport = await getTransporter();
    if (!transport) {
      return { success: false, message: 'SMTP not configured' };
    }
    await transport.verify();
    return { success: true, message: 'Connection successful' };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Connection failed';
    return { success: false, message: msg };
  }
}
