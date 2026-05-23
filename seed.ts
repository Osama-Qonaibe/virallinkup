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

  console.log('Seeding completed!');
}

seed().catch(console.error);
