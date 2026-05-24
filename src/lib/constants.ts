// Shared TypeScript interfaces used across components

export interface Product {
  id: string;
  title: string;
  titleEn: string | null;
  description: string;
  descriptionEn: string | null;
  price: number;
  category: string | null;
  licenseType: string;
  features: string;
  thumbnailUrl: string | null;
  fileUrl: string | null;
  isActive: boolean;
  downloads: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  icon: string | null;
  sortOrder: number;
}

export interface Order {
  id: string;
  userId: string;
  productId: string;
  licenseType: string;
  amount: number;
  status: string;
  transactionId: string | null;
  createdAt: string;
  updatedAt: string;
  product?: Product;
}

// License type styling constants
export const licenseColors: Record<string, string> = {
  PERSONAL: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  COMMERCIAL: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  EXTENDED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  RESELLER: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  ENTERPRISE: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  PLR: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
};

export const licenseNames: Record<string, Record<string, string>> = {
  ar: { PERSONAL: 'شخصي', COMMERCIAL: 'تجاري', EXTENDED: 'ممتد', RESELLER: 'إعادة البيع', ENTERPRISE: 'مؤسسي', PLR: 'حقوق تأليف خاصة' },
  en: { PERSONAL: 'Personal', COMMERCIAL: 'Commercial', EXTENDED: 'Extended', RESELLER: 'Reseller', ENTERPRISE: 'Enterprise', PLR: 'PLR' },
};

// FAQ items shared between FAQSection and FAQPage
export const faqItems = [
  { qKey: 'faq1Q', aKey: 'faq1A' },
  { qKey: 'faq2Q', aKey: 'faq2A' },
  { qKey: 'faq3Q', aKey: 'faq3A' },
  { qKey: 'faq4Q', aKey: 'faq4A' },
  { qKey: 'faq5Q', aKey: 'faq5A' },
  { qKey: 'faq6Q', aKey: 'faq6A' },
];
