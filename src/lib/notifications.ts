import { db } from './db';
import { sendEmailFromTemplate } from './email';

export type NotificationType =
  | 'PURCHASE'
  | 'DOWNLOAD'
  | 'PAYMENT'
  | 'WALLET_DEPOSIT'
  | 'WALLET_WITHDRAW'
  | 'REFERRAL'
  | 'SUBSCRIPTION'
  | 'SUBSCRIPTION_CANCEL'
  | 'PASSWORD_RESET'
  | 'WELCOME'
  | 'ORDER_STATUS'
  | 'INFO'
  | 'SYSTEM';

export interface CreateNotificationOptions {
  userId: string;
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  type: NotificationType;
  link?: string;
  sendEmail?: boolean;
  emailTemplateKey?: string;
  emailVariables?: Record<string, string>;
  emailLang?: 'ar' | 'en';
}

export async function createNotification(options: CreateNotificationOptions) {
  const {
    userId, titleAr, titleEn, messageAr, messageEn,
    type, link, sendEmail = false,
    emailTemplateKey, emailVariables = {}, emailLang = 'ar',
  } = options;

  // Create notification in database
  const notification = await db.notification.create({
    data: {
      userId,
      title: titleAr,
      titleEn,
      message: messageAr,
      messageEn,
      type,
      link: link || null,
    },
  });

  // Send email if requested
  if (sendEmail) {
    const user = await db.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (user?.email) {
      if (emailTemplateKey) {
        await sendEmailFromTemplate(emailTemplateKey, user.email, emailLang, emailVariables).catch(() => {});
      }
    }
  }

  return notification;
}

// Shorthand notification creators for common actions

export async function notifyPurchase(userId: string, productName: string, productNameEn: string, amount: number, lang: string = 'ar') {
  return createNotification({
    userId,
    titleAr: 'تم شراء منتج جديد',
    titleEn: 'New Product Purchased',
    messageAr: `تم شراء "${productName}" بنجاح بمبلغ $${amount.toFixed(2)}`,
    messageEn: `"${productNameEn}" purchased successfully for $${amount.toFixed(2)}`,
    type: 'PURCHASE',
    link: 'user-purchases',
    sendEmail: true,
    emailTemplateKey: 'purchase_confirmation',
    emailVariables: { productName, productNameEn, amount: amount.toFixed(2) },
    emailLang: lang === 'ar' ? 'ar' : 'en',
  });
}

export async function notifyPayment(userId: string, amount: number, paymentType: string, lang: string = 'ar') {
  const typeLabel = lang === 'ar'
    ? (paymentType === 'DEPOSIT' ? 'إيداع في المحفظة' : paymentType === 'SUBSCRIPTION' ? 'اشتراك' : 'شراء')
    : (paymentType === 'DEPOSIT' ? 'Wallet Deposit' : paymentType === 'SUBSCRIPTION' ? 'Subscription' : 'Purchase');

  return createNotification({
    userId,
    titleAr: 'تمت عملية الدفع بنجاح',
    titleEn: 'Payment Successful',
    messageAr: `تمت عملية ${typeLabel} بنجاح بمبلغ $${amount.toFixed(2)}`,
    messageEn: `${typeLabel} completed successfully for $${amount.toFixed(2)}`,
    type: 'PAYMENT',
    link: 'user-wallet',
    sendEmail: true,
    emailTemplateKey: 'payment_confirmation',
    emailVariables: { amount: amount.toFixed(2), paymentType: typeLabel },
    emailLang: lang === 'ar' ? 'ar' : 'en',
  });
}

export async function notifyWalletDeposit(userId: string, amount: number, lang: string = 'ar') {
  return createNotification({
    userId,
    titleAr: 'إيداع في المحفظة',
    titleEn: 'Wallet Deposit',
    messageAr: `تم إيداع $${amount.toFixed(2)} في محفظتك بنجاح`,
    messageEn: `$${amount.toFixed(2)} deposited to your wallet successfully`,
    type: 'WALLET_DEPOSIT',
    link: 'user-wallet',
    sendEmail: true,
    emailTemplateKey: 'wallet_deposit',
    emailVariables: { amount: amount.toFixed(2) },
    emailLang: lang === 'ar' ? 'ar' : 'en',
  });
}

export async function notifyWalletWithdraw(userId: string, amount: number, lang: string = 'ar') {
  return createNotification({
    userId,
    titleAr: 'طلب سحب من المحفظة',
    titleEn: 'Withdrawal Request',
    messageAr: `تم تقديم طلب سحب بمبلغ $${amount.toFixed(2)} وسيتم مراجعته`,
    messageEn: `Withdrawal request for $${amount.toFixed(2)} submitted and pending review`,
    type: 'WALLET_WITHDRAW',
    link: 'user-wallet',
    sendEmail: true,
    emailTemplateKey: 'wallet_withdrawal',
    emailVariables: { amount: amount.toFixed(2) },
    emailLang: lang === 'ar' ? 'ar' : 'en',
  });
}

export async function notifyReferral(userId: string, referredName: string, commission: number, lang: string = 'ar') {
  return createNotification({
    userId,
    titleAr: 'إحالة جديدة',
    titleEn: 'New Referral',
    messageAr: `لقد انضم ${referredName} عبر رابط الإحالة الخاص بك! عمولة: $${commission.toFixed(2)}`,
    messageEn: `${referredName} joined via your referral link! Commission: $${commission.toFixed(2)}`,
    type: 'REFERRAL',
    link: 'user-referrals',
    sendEmail: true,
    emailTemplateKey: 'referral_commission',
    emailVariables: { referredName, commission: commission.toFixed(2) },
    emailLang: lang === 'ar' ? 'ar' : 'en',
  });
}

export async function notifySubscription(userId: string, plan: string, lang: string = 'ar') {
  const planLabel = lang === 'ar'
    ? { BASIC: 'أساسي', PRO: 'احترافي', PREMIUM: 'مميز' }[plan] || plan
    : plan;

  return createNotification({
    userId,
    titleAr: 'تم تفعيل الاشتراك',
    titleEn: 'Subscription Activated',
    messageAr: `تم تفعيل اشتراك الخطة "${planLabel}" بنجاح`,
    messageEn: `"${planLabel}" subscription plan activated successfully`,
    type: 'SUBSCRIPTION',
    link: 'user-dashboard',
    sendEmail: true,
    emailTemplateKey: 'subscription_activated',
    emailVariables: { plan: planLabel },
    emailLang: lang === 'ar' ? 'ar' : 'en',
  });
}

export async function notifyWelcome(userId: string, name: string, lang: string = 'ar') {
  return createNotification({
    userId,
    titleAr: 'مرحباً بك في فيرال لينك أب',
    titleEn: 'Welcome to ViralLinkUp',
    messageAr: `مرحباً ${name}! يسعدنا انضمامك إلى منصة فيرال لينك أب. استكشف أفضل المنتجات الرقمية.`,
    messageEn: `Welcome ${name}! We're glad to have you at ViralLinkUp. Explore the best digital products.`,
    type: 'WELCOME',
    link: 'packages',
    sendEmail: true,
    emailTemplateKey: 'welcome',
    emailVariables: { name },
    emailLang: lang === 'ar' ? 'ar' : 'en',
  });
}

export async function notifyPasswordReset(userId: string, name: string, email: string, lang: string = 'ar') {
  return createNotification({
    userId,
    titleAr: 'استعادة كلمة المرور',
    titleEn: 'Password Recovery',
    messageAr: `تم طلب إعادة تعيين كلمة المرور لحسابك. إذا لم تكن أنت، تجاهل هذا الإشعار.`,
    messageEn: `A password reset was requested for your account. If this wasn't you, ignore this notification.`,
    type: 'PASSWORD_RESET',
    sendEmail: true,
    emailTemplateKey: 'password_reset',
    emailVariables: { name, email },
    emailLang: lang === 'ar' ? 'ar' : 'en',
  });
}

export async function notifyDownload(userId: string, productName: string, productNameEn: string, lang: string = 'ar') {
  return createNotification({
    userId,
    titleAr: 'تم التحميل بنجاح',
    titleEn: 'Download Complete',
    messageAr: `تم تحميل "${productName}" بنجاح`,
    messageEn: `"${productNameEn}" downloaded successfully`,
    type: 'DOWNLOAD',
    link: 'user-downloads',
    sendEmail: false,
  });
}

export async function notifySubscriptionCancel(userId: string, plan: string, lang: string = 'ar') {
  const planLabel = lang === 'ar'
    ? { BASIC: 'أساسي', PRO: 'احترافي', PREMIUM: 'مميز' }[plan] || plan
    : plan;

  return createNotification({
    userId,
    titleAr: 'تم إلغاء الاشتراك',
    titleEn: 'Subscription Cancelled',
    messageAr: `تم إلغاء اشتراكك في الخطة "${planLabel}"`,
    messageEn: `Your "${planLabel}" subscription has been cancelled`,
    type: 'SUBSCRIPTION_CANCEL',
    link: 'user-dashboard',
    sendEmail: true,
    emailTemplateKey: 'subscription_cancelled',
    emailVariables: { plan: planLabel },
    emailLang: lang === 'ar' ? 'ar' : 'en',
  });
}
