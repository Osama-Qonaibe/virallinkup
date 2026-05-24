import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await db.user.upsert({
    where: { email: 'admin@virallinkup.com' },
    update: {},
    create: {
      email: 'admin@virallinkup.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
      referralCode: 'admin2024',
      walletBalance: 0,
    },
  });
  console.log('Admin created:', admin.email);

  // Create categories
  const categories = [
    { name: 'قوالب واجهة المستخدم', nameEn: 'UI Templates', slug: 'ui-templates', icon: 'Layout', sortOrder: 1 },
    { name: 'مقتطفات الأكواد', nameEn: 'Code Snippets', slug: 'code-snippets', icon: 'Code', sortOrder: 2 },
    { name: 'رسوميات', nameEn: 'Graphics', slug: 'graphics', icon: 'Palette', sortOrder: 3 },
    { name: 'أدوات الويب', nameEn: 'Web Tools', slug: 'web-tools', icon: 'Globe', sortOrder: 4 },
    { name: 'تسويق', nameEn: 'Marketing', slug: 'marketing', icon: 'TrendingUp', sortOrder: 5 },
    { name: 'تعليم', nameEn: 'Education', slug: 'education', icon: 'GraduationCap', sortOrder: 6 },
    { name: 'أعمال', nameEn: 'Business', slug: 'business', icon: 'Briefcase', sortOrder: 7 },
    { name: 'وسائل التواصل', nameEn: 'Social Media', slug: 'social-media', icon: 'Share2', sortOrder: 8 },
  ];

  for (const cat of categories) {
    await db.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('Categories created');

  // Create products
  const products = [
    {
      title: 'حزمة قوالب لوحة التحكم',
      titleEn: 'Dashboard Templates Bundle',
      description: 'مجموعة شاملة من قوالب لوحات التحكم الاحترافية مع تصميم عصري ومتجاوب',
      descriptionEn: 'Comprehensive collection of professional dashboard templates with modern responsive design',
      price: 29.99,
      category: 'ui-templates',
      licenseType: 'COMMERCIAL',
      features: JSON.stringify(['50+ صفحة جاهزة', 'تصميم متجاوب', 'دعم RTL و LTR', 'تحديثات مجانية', 'مكونات قابلة للتخصيص']),
      thumbnailUrl: '/slider2.png',
      downloads: 342,
    },
    {
      title: 'مجموعة مقتطفات أكواد React',
      titleEn: 'React Code Snippets Collection',
      description: 'أكثر من 200 مقتطف كود جاهز للاستخدام في مشاريع React',
      descriptionEn: 'Over 200 ready-to-use code snippets for React projects',
      price: 19.99,
      category: 'code-snippets',
      licenseType: 'PERSONAL',
      features: JSON.stringify(['200+ مقتطف كود', 'React Hooks', 'TypeScript', 'أمثلة عملية', 'توثيق كامل']),
      thumbnailUrl: '/slider3.png',
      downloads: 528,
    },
    {
      title: 'حزمة أيقونات وتصاميم جرافيك',
      titleEn: 'Icons & Graphic Design Pack',
      description: 'أكثر من 1000 أيقونة SVG وعناصر تصميم جرافيكي احترافية',
      descriptionEn: 'Over 1000 SVG icons and professional graphic design elements',
      price: 39.99,
      category: 'graphics',
      licenseType: 'EXTENDED',
      features: JSON.stringify(['1000+ أيقونة SVG', 'ملفات PSD و AI', 'ألوان قابلة للتعديل', 'تصاميم مسطحة و 3D', 'مجاني للاستخدام التجاري']),
      thumbnailUrl: '/slider4.png',
      downloads: 215,
    },
    {
      title: 'أدوات تطوير الويب الشاملة',
      titleEn: 'Complete Web Development Toolkit',
      description: 'مجموعة أدوات متكاملة لتطوير مواقع الويب الحديثة',
      descriptionEn: 'Integrated toolkit for modern web development',
      price: 49.99,
      category: 'web-tools',
      licenseType: 'RESELLER',
      features: JSON.stringify(['أدوات بناء', 'قوالب Next.js', 'مكونات UI', 'أدوات SEO', 'برامج إدارة المحتوى']),
      thumbnailUrl: '/slider5.png',
      downloads: 167,
    },
    {
      title: 'قوالب تسويق السوشيال ميديا',
      titleEn: 'Social Media Marketing Templates',
      description: 'قوالب احترافية لجميع منصات التواصل الاجتماعي',
      descriptionEn: 'Professional templates for all social media platforms',
      price: 14.99,
      category: 'marketing',
      licenseType: 'PERSONAL',
      features: JSON.stringify(['500+ قالب', 'Instagram, Facebook, Twitter', 'Canva متوافق', 'مقاسات جاهزة', 'تحديثات شهرية']),
      thumbnailUrl: '/slider6.png',
      downloads: 893,
    },
    {
      title: 'حزمة تعلم البرمجة الكاملة',
      titleEn: 'Complete Programming Learning Pack',
      description: 'دورة شاملة لتعلم البرمجة من الصفر حتى الاحتراف',
      descriptionEn: 'Comprehensive course to learn programming from zero to pro',
      price: 59.99,
      category: 'education',
      licenseType: 'ENTERPRISE',
      features: JSON.stringify(['100+ درس', 'مشاريع تطبيقية', 'شهادة إتمام', 'وصول مدى الحياة', 'دعم مجتمعي']),
      thumbnailUrl: '/slider1.png',
      downloads: 456,
    },
  ];

  for (const p of products) {
    await db.product.create({ data: p });
  }
  console.log('Products created');

  // Create testimonials
  const testimonials = [
    { name: 'أحمد محمد', nameEn: 'Ahmed Mohammed', content: 'منصة رائعة بمحتوى عالي الجودة. ساعدتني كثيراً في مشاريعي!', contentEn: 'Amazing platform with high-quality content. Helped me a lot with my projects!', rating: 5 },
    { name: 'سارة علي', nameEn: 'Sarah Ali', content: 'أسعار ممتازة مقارنة بالجودة المقدمة. أنصح بها بشدة.', contentEn: 'Excellent prices compared to the quality offered. Highly recommended.', rating: 5 },
    { name: 'محمد خالد', nameEn: 'Mohammed Khaled', content: 'دعم فني سريع ومتجاوب. تجربة شراء سهلة ومميزة.', contentEn: 'Fast and responsive support. Easy and unique shopping experience.', rating: 4 },
    { name: 'نورة سعد', nameEn: 'Noura Saad', content: 'مجموعة متنوعة من المنتجات الرقمية. أوفر الكثير من الوقت والجهد.', contentEn: 'Diverse range of digital products. Saves me a lot of time and effort.', rating: 5 },
  ];

  for (const t of testimonials) {
    await db.testimonial.create({ data: t });
  }
  console.log('Testimonials created');

  // Create legal pages
  const pages = [
    { slug: 'privacy-policy', title: 'سياسة الخصوصية', titleEn: 'Privacy Policy', content: '<h2>سياسة الخصوصية</h2><p>نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.</p><p>نقوم بجمع المعلومات الضرورية فقط لتقديم خدماتنا بشكل أفضل.</p>', contentEn: '<h2>Privacy Policy</h2><p>We respect your privacy and are committed to protecting your personal data.</p><p>We only collect necessary information to provide our services better.</p>', type: 'PRIVACY' },
    { slug: 'terms-conditions', title: 'الشروط والأحكام', titleEn: 'Terms & Conditions', content: '<h2>الشروط والأحكام</h2><p>باستخدامك لهذه المنصة، فإنك توافق على الشروط والأحكام التالية.</p><p>جميع المنتجات محمية بحقوق الملكية الفكرية.</p>', contentEn: '<h2>Terms & Conditions</h2><p>By using this platform, you agree to the following terms and conditions.</p><p>All products are protected by intellectual property rights.</p>', type: 'TERMS' },
    { slug: 'about', title: 'من نحن', titleEn: 'About Us', content: '<h2>من نحن</h2><p>فيرال لينك أب هي منصة رائدة للمنتجات الرقمية.</p><p>نهدف إلى توفير أفضل المنتجات الرقمية بأسعار منافسة.</p>', contentEn: '<h2>About Us</h2><p>ViralLinkUp is a leading platform for digital products.</p><p>We aim to provide the best digital products at competitive prices.</p>', type: 'ABOUT' },
  ];

  for (const p of pages) {
    await db.page.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }
  console.log('Pages created');

  // Create site settings
  const settings = [
    { key: 'siteName', value: 'ViralLinkUp' },
    { key: 'siteNameAr', value: 'فيرال لينك أب' },
    { key: 'siteDescription', value: 'Digital Products Marketplace' },
    { key: 'primaryColor', value: '#F61A5A' },
    { key: 'secondaryColor', value: '#B4CDD3' },
    { key: 'darkBg', value: '#0F0F1A' },
  ];

  for (const s of settings) {
    await db.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log('Settings created');

  // ============================================
  // Seed Default Email Templates
  // ============================================
  const emailTemplates = [
    {
      key: 'welcome',
      subject: 'مرحباً بك في فيرال لينك أب',
      subjectEn: 'Welcome to ViralLinkUp',
      bodyHtml: `<h2 style="color:#F61A5A;font-size:22px;margin-bottom:16px;">مرحباً {{name}} 👋</h2>
<p style="color:#E8E8F0;font-size:15px;line-height:1.8;margin-bottom:16px;">يسعدنا انضمامك إلى منصة <strong style="color:#F61A5A;">فيرال لينك أب</strong>. نحن هنا لتقديم أفضل المنتجات الرقمية الاحترافية.</p>
<p style="color:#E8E8F0;font-size:15px;line-height:1.8;margin-bottom:20px;">استكشف مكتبتنا الواسعة من القوالب والأدوات والموارد الرقمية المصممة لتسريع عملك.</p>
<div style="text-align:center;padding:24px;background:rgba(246,26,90,0.1);border-radius:12px;border:1px solid rgba(246,26,90,0.2);margin-bottom:20px;">
  <p style="color:#B4CDD3;font-size:13px;margin:0;">ابدأ الآن</p>
  <p style="color:#F61A5A;font-size:20px;font-weight:bold;margin:8px 0 0 0;">اكتشف المنتجات</p>
</div>
<p style="color:#8888A0;font-size:13px;">إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذه الرسالة.</p>`,
      bodyHtmlEn: `<h2 style="color:#F61A5A;font-size:22px;margin-bottom:16px;">Welcome {{name}} 👋</h2>
<p style="color:#E8E8F0;font-size:15px;line-height:1.8;margin-bottom:16px;">We're excited to have you join <strong style="color:#F61A5A;">ViralLinkUp</strong>. We're here to provide the best professional digital products.</p>
<p style="color:#E8E8F0;font-size:15px;line-height:1.8;margin-bottom:20px;">Explore our extensive library of templates, tools, and digital resources designed to accelerate your work.</p>
<div style="text-align:center;padding:24px;background:rgba(246,26,90,0.1);border-radius:12px;border:1px solid rgba(246,26,90,0.2);margin-bottom:20px;">
  <p style="color:#B4CDD3;font-size:13px;margin:0;">Get Started</p>
  <p style="color:#F61A5A;font-size:20px;font-weight:bold;margin:8px 0 0 0;">Discover Products</p>
</div>
<p style="color:#8888A0;font-size:13px;">If you didn't create this account, you can ignore this email.</p>`,
      variables: JSON.stringify(['name']),
    },
    {
      key: 'purchase_confirmation',
      subject: 'تأكيد عملية الشراء - {{productName}}',
      subjectEn: 'Purchase Confirmation - {{productNameEn}}',
      bodyHtml: `<h2 style="color:#F61A5A;font-size:20px;margin-bottom:16px;">تم شراء المنتج بنجاح ✅</h2>
<p style="color:#E8E8F0;font-size:15px;line-height:1.8;margin-bottom:12px;">مرحباً،</p>
<p style="color:#E8E8F0;font-size:15px;line-height:1.8;margin-bottom:20px;">تم تأكيد عملية الشراء التالية:</p>
<div style="background:rgba(26,26,46,0.8);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:20px;">
  <p style="color:#B4CDD3;font-size:13px;margin:0 0 4px 0;">المنتج</p>
  <p style="color:white;font-size:16px;font-weight:bold;margin:0 0 12px 0;">{{productName}}</p>
  <p style="color:#B4CDD3;font-size:13px;margin:0 0 4px 0;">المبلغ</p>
  <p style="color:#F61A5A;font-size:18px;font-weight:bold;margin:0;">\${{amount}}</p>
</div>
<p style="color:#8888A0;font-size:13px;">يمكنك الوصول إلى المنتج من قسم "مشترياتي" في حسابك.</p>`,
      bodyHtmlEn: `<h2 style="color:#F61A5A;font-size:20px;margin-bottom:16px;">Purchase Successful ✅</h2>
<p style="color:#E8E8F0;font-size:15px;line-height:1.8;margin-bottom:12px;">Hello,</p>
<p style="color:#E8E8F0;font-size:15px;line-height:1.8;margin-bottom:20px;">The following purchase has been confirmed:</p>
<div style="background:rgba(26,26,46,0.8);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:20px;">
  <p style="color:#B4CDD3;font-size:13px;margin:0 0 4px 0;">Product</p>
  <p style="color:white;font-size:16px;font-weight:bold;margin:0 0 12px 0;">{{productNameEn}}</p>
  <p style="color:#B4CDD3;font-size:13px;margin:0 0 4px 0;">Amount</p>
  <p style="color:#F61A5A;font-size:18px;font-weight:bold;margin:0;">\${{amount}}</p>
</div>
<p style="color:#8888A0;font-size:13px;">You can access the product from "My Purchases" in your account.</p>`,
      variables: JSON.stringify(['productName', 'productNameEn', 'amount']),
    },
    {
      key: 'payment_confirmation',
      subject: 'تأكيد عملية الدفع بنجاح',
      subjectEn: 'Payment Confirmed Successfully',
      bodyHtml: `<h2 style="color:#F61A5A;font-size:20px;margin-bottom:16px;">تمت عملية الدفع بنجاح 💳</h2>
<p style="color:#E8E8F0;font-size:15px;line-height:1.8;margin-bottom:20px;">تمت معالجة عملية الدفع بنجاح في حسابك.</p>
<div style="background:rgba(26,26,46,0.8);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:20px;">
  <p style="color:#B4CDD3;font-size:13px;margin:0 0 4px 0;">نوع العملية</p>
  <p style="color:white;font-size:15px;font-weight:600;margin:0 0 12px 0;">{{paymentType}}</p>
  <p style="color:#B4CDD3;font-size:13px;margin:0 0 4px 0;">المبلغ</p>
  <p style="color:#F61A5A;font-size:18px;font-weight:bold;margin:0;">\${{amount}}</p>
</div>
<p style="color:#8888A0;font-size:13px;">شكراً لثقتك بنا. يمكنك مراجعة سجل المعاملات من حسابك.</p>`,
      bodyHtmlEn: `<h2 style="color:#F61A5A;font-size:20px;margin-bottom:16px;">Payment Successful 💳</h2>
<p style="color:#E8E8F0;font-size:15px;line-height:1.8;margin-bottom:20px;">Your payment has been processed successfully.</p>
<div style="background:rgba(26,26,46,0.8);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:20px;">
  <p style="color:#B4CDD3;font-size:13px;margin:0 0 4px 0;">Transaction Type</p>
  <p style="color:white;font-size:15px;font-weight:600;margin:0 0 12px 0;">{{paymentType}}</p>
  <p style="color:#B4CDD3;font-size:13px;margin:0 0 4px 0;">Amount</p>
  <p style="color:#F61A5A;font-size:18px;font-weight:bold;margin:0;">\${{amount}}</p>
</div>
<p style="color:#8888A0;font-size:13px;">Thank you for your trust. You can review your transaction history in your account.</p>`,
      variables: JSON.stringify(['amount', 'paymentType']),
    },
    {
      key: 'wallet_deposit',
      subject: 'إيداع في محفظتك بنجاح',
      subjectEn: 'Wallet Deposit Successful',
      bodyHtml: `<h2 style="color:#F61A5A;font-size:20px;margin-bottom:16px;">إيداع في المحفظة 💰</h2>
<p style="color:#E8E8F0;font-size:15px;line-height:1.8;margin-bottom:20px;">تم إيداع المبلغ التالي في محفظتك بنجاح:</p>
<div style="text-align:center;padding:24px;background:rgba(180,205,211,0.1);border-radius:12px;border:1px solid rgba(180,205,211,0.2);margin-bottom:20px;">
  <p style="color:#B4CDD3;font-size:14px;margin:0 0 8px 0;">المبلغ المودع</p>
  <p style="color:#B4CDD3;font-size:28px;font-weight:bold;margin:0;">\${{amount}}</p>
</div>
<p style="color:#8888A0;font-size:13px;">يمكنك استخدام رصيدك لشراء المنتجات من المنصة.</p>`,
      bodyHtmlEn: `<h2 style="color:#F61A5A;font-size:20px;margin-bottom:16px;">Wallet Deposit 💰</h2>
<p style="color:#E8E8F0;font-size:15px;line-height:1.8;margin-bottom:20px;">The following amount has been deposited to your wallet:</p>
<div style="text-align:center;padding:24px;background:rgba(180,205,211,0.1);border-radius:12px;border:1px solid rgba(180,205,211,0.2);margin-bottom:20px;">
  <p style="color:#B4CDD3;font-size:14px;margin:0 0 8px 0;">Deposited Amount</p>
  <p style="color:#B4CDD3;font-size:28px;font-weight:bold;margin:0;">\${{amount}}</p>
</div>
<p style="color:#8888A0;font-size:13px;">You can use your balance to purchase products from the platform.</p>`,
      variables: JSON.stringify(['amount']),
    },
    {
      key: 'wallet_withdrawal',
      subject: 'تم تقديم طلب السحب',
      subjectEn: 'Withdrawal Request Submitted',
      bodyHtml: `<h2 style="color:#F61A5A;font-size:20px;margin-bottom:16px;">طلب سحب من المحفظة 📤</h2>
<p style="color:#E8E8F0;font-size:15px;line-height:1.8;margin-bottom:20px;">تم تقديم طلب سحب بمبلغ:</p>
<div style="text-align:center;padding:24px;background:rgba(246,26,90,0.08);border-radius:12px;border:1px solid rgba(246,26,90,0.2);margin-bottom:20px;">
  <p style="color:#8888A0;font-size:14px;margin:0 0 8px 0;">مبلغ السحب</p>
  <p style="color:#F61A5A;font-size:28px;font-weight:bold;margin:0;">\${{amount}}</p>
</div>
<p style="color:#E8E8F0;font-size:15px;line-height:1.8;margin-bottom:12px;">سيتم مراجعة الطلب ومعالجته خلال 24-48 ساعة عمل.</p>
<p style="color:#8888A0;font-size:13px;">سيتم إشعارك فور اعتماد السحب.</p>`,
      bodyHtmlEn: `<h2 style="color:#F61A5A;font-size:20px;margin-bottom:16px;">Withdrawal Request 📤</h2>
<p style="color:#E8E8F0;font-size:15px;line-height:1.8;margin-bottom:20px;">A withdrawal request has been submitted for:</p>
<div style="text-align:center;padding:24px;background:rgba(246,26,90,0.08);border-radius:12px;border:1px solid rgba(246,26,90,0.2);margin-bottom:20px;">
  <p style="color:#8888A0;font-size:14px;margin:0 0 8px 0;">Withdrawal Amount</p>
  <p style="color:#F61A5A;font-size:28px;font-weight:bold;margin:0;">\${{amount}}</p>
</div>
<p style="color:#E8E8F0;font-size:15px;line-height:1.8;margin-bottom:12px;">Your request will be reviewed and processed within 24-48 business hours.</p>
<p style="color:#8888A0;font-size:13px;">You will be notified once the withdrawal is approved.</p>`,
      variables: JSON.stringify(['amount']),
    },
    {
      key: 'referral_commission',
      subject: 'عمولة إحالة جديدة',
      subjectEn: 'New Referral Commission',
      bodyHtml: `<h2 style="color:#F61A5A;font-size:20px;margin-bottom:16px;">إحالة جديدة! 🎉</h2>
<p style="color:#E8E8F0;font-size:15px;line-height:1.8;margin-bottom:20px;">لقد انضم مستخدم جديد عبر رابط الإحالة الخاص بك.</p>
<div style="background:rgba(59,130,246,0.1);border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid rgba(59,130,246,0.2);">
  <p style="color:#B4CDD3;font-size:13px;margin:0 0 4px 0;">المستخدم المحال</p>
  <p style="color:white;font-size:16px;font-weight:600;margin:0 0 12px 0;">{{referredName}}</p>
  <p style="color:#B4CDD3;font-size:13px;margin:0 0 4px 0;">العمولة المكتسبة</p>
  <p style="color:#3B82F6;font-size:20px;font-weight:bold;margin:0;">\${{commission}}</p>
</div>
<p style="color:#8888A0;font-size:13px;">استمر في مشاركة رابطك لكسب المزيد من العمولات!</p>`,
      bodyHtmlEn: `<h2 style="color:#F61A5A;font-size:20px;margin-bottom:16px;">New Referral! 🎉</h2>
<p style="color:#E8E8F0;font-size:15px;line-height:1.8;margin-bottom:20px;">A new user has joined through your referral link.</p>
<div style="background:rgba(59,130,246,0.1);border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid rgba(59,130,246,0.2);">
  <p style="color:#B4CDD3;font-size:13px;margin:0 0 4px 0;">Referred User</p>
  <p style="color:white;font-size:16px;font-weight:600;margin:0 0 12px 0;">{{referredName}}</p>
  <p style="color:#B4CDD3;font-size:13px;margin:0 0 4px 0;">Commission Earned</p>
  <p style="color:#3B82F6;font-size:20px;font-weight:bold;margin:0;">\${{commission}}</p>
</div>
<p style="color:#8888A0;font-size:13px;">Keep sharing your link to earn more commissions!</p>`,
      variables: JSON.stringify(['referredName', 'commission']),
    },
    {
      key: 'subscription_activated',
      subject: 'تم تفعيل اشتراكك - {{plan}}',
      subjectEn: 'Subscription Activated - {{plan}}',
      bodyHtml: `<h2 style="color:#F61A5A;font-size:20px;margin-bottom:16px;">تم تفعيل الاشتراك ⭐</h2>
<p style="color:#E8E8F0;font-size:15px;line-height:1.8;margin-bottom:20px;">تهانينا! تم تفعيل اشتراكك بنجاح.</p>
<div style="text-align:center;padding:24px;background:linear-gradient(135deg,rgba(176,23,67,0.1),rgba(246,26,90,0.1));border-radius:12px;border:1px solid rgba(246,26,90,0.2);margin-bottom:20px;">
  <p style="color:#B4CDD3;font-size:14px;margin:0 0 8px 0;">الخطة المفعّلة</p>
  <p style="color:#F61A5A;font-size:24px;font-weight:bold;margin:0;">{{plan}}</p>
</div>
<p style="color:#E8E8F0;font-size:15px;line-height:1.8;margin-bottom:12px;">استمتع بجميع مميزات الخطة بما فيها التحميلات غير المحدودة والدعم ذو الأولوية.</p>
<p style="color:#8888A0;font-size:13px;">يمكنك إدارة اشتراكك من إعدادات الحساب.</p>`,
      bodyHtmlEn: `<h2 style="color:#F61A5A;font-size:20px;margin-bottom:16px;">Subscription Activated ⭐</h2>
<p style="color:#E8E8F0;font-size:15px;line-height:1.8;margin-bottom:20px;">Congratulations! Your subscription has been activated.</p>
<div style="text-align:center;padding:24px;background:linear-gradient(135deg,rgba(176,23,67,0.1),rgba(246,26,90,0.1));border-radius:12px;border:1px solid rgba(246,26,90,0.2);margin-bottom:20px;">
  <p style="color:#B4CDD3;font-size:14px;margin:0 0 8px 0;">Activated Plan</p>
  <p style="color:#F61A5A;font-size:24px;font-weight:bold;margin:0;">{{plan}}</p>
</div>
<p style="color:#E8E8F0;font-size:15px;line-height:1.8;margin-bottom:12px;">Enjoy all plan features including unlimited downloads and priority support.</p>
<p style="color:#8888A0;font-size:13px;">You can manage your subscription from account settings.</p>`,
      variables: JSON.stringify(['plan']),
    },
    {
      key: 'subscription_cancelled',
      subject: 'تم إلغاء اشتراكك - {{plan}}',
      subjectEn: 'Subscription Cancelled - {{plan}}',
      bodyHtml: `<h2 style="color:#F61A5A;font-size:20px;margin-bottom:16px;">إلغاء الاشتراك</h2>
<p style="color:#E8E8F0;font-size:15px;line-height:1.8;margin-bottom:20px;">تم إلغاء اشتراكك في الخطة <strong style="color:#F61A5A;">{{plan}}</strong>.</p>
<p style="color:#E8E8F0;font-size:15px;line-height:1.8;margin-bottom:12px;">ستبقى مميزات الخطة فعالة حتى نهاية فترة الاشتراك الحالية.</p>
<p style="color:#8888A0;font-size:13px;">يمكنك إعادة الاشتراك في أي وقت من صفحة الاشتراكات.</p>`,
      bodyHtmlEn: `<h2 style="color:#F61A5A;font-size:20px;margin-bottom:16px;">Subscription Cancelled</h2>
<p style="color:#E8E8F0;font-size:15px;line-height:1.8;margin-bottom:20px;">Your <strong style="color:#F61A5A;">{{plan}}</strong> subscription has been cancelled.</p>
<p style="color:#E8E8F0;font-size:15px;line-height:1.8;margin-bottom:12px;">Your plan features will remain active until the end of the current billing period.</p>
<p style="color:#8888A0;font-size:13px;">You can re-subscribe at any time from the subscriptions page.</p>`,
      variables: JSON.stringify(['plan']),
    },
    {
      key: 'password_reset',
      subject: 'استعادة كلمة المرور',
      subjectEn: 'Password Recovery',
      bodyHtml: `<h2 style="color:#F61A5A;font-size:20px;margin-bottom:16px;">استعادة كلمة المرور 🔐</h2>
<p style="color:#E8E8F0;font-size:15px;line-height:1.8;margin-bottom:20px;">مرحباً {{name}}،</p>
<p style="color:#E8E8F0;font-size:15px;line-height:1.8;margin-bottom:20px;">تم طلب إعادة تعيين كلمة المرور لحسابك. إذا لم تكن أنت من طلب هذا، يمكنك تجاهل هذه الرسالة بأمان.</p>
<div style="text-align:center;padding:20px;background:rgba(246,26,90,0.08);border-radius:12px;border:1px solid rgba(246,26,90,0.15);margin-bottom:20px;">
  <p style="color:#8888A0;font-size:13px;margin:0;">الحساب</p>
  <p style="color:white;font-size:15px;margin:4px 0 0 0;">{{email}}</p>
</div>
<p style="color:#8888A0;font-size:13px;">لأسباب أمنية، يرجى التواصل مع فريق الدعم لاستعادة حسابك.</p>`,
      bodyHtmlEn: `<h2 style="color:#F61A5A;font-size:20px;margin-bottom:16px;">Password Recovery 🔐</h2>
<p style="color:#E8E8F0;font-size:15px;line-height:1.8;margin-bottom:20px;">Hello {{name}},</p>
<p style="color:#E8E8F0;font-size:15px;line-height:1.8;margin-bottom:20px;">A password reset was requested for your account. If you didn't request this, you can safely ignore this email.</p>
<div style="text-align:center;padding:20px;background:rgba(246,26,90,0.08);border-radius:12px;border:1px solid rgba(246,26,90,0.15);margin-bottom:20px;">
  <p style="color:#8888A0;font-size:13px;margin:0;">Account</p>
  <p style="color:white;font-size:15px;margin:4px 0 0 0;">{{email}}</p>
</div>
<p style="color:#8888A0;font-size:13px;">For security reasons, please contact support to recover your account.</p>`,
      variables: JSON.stringify(['name', 'email']),
    },
  ];

  for (const tpl of emailTemplates) {
    await db.emailTemplate.upsert({
      where: { key: tpl.key },
      update: {},
      create: tpl,
    });
  }
  console.log('Email templates created (' + emailTemplates.length + ')');

  console.log('Seeding completed!');
}

seed().catch(console.error);
