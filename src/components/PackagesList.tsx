'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { useState, useEffect } from 'react';
import { Search, Download, ShoppingBag, SlidersHorizontal } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  titleEn: string | null;
  description: string;
  descriptionEn: string | null;
  price: number;
  category: string | null;
  licenseType: string;
  thumbnailUrl: string | null;
  downloads: number;
}

interface Category {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  icon: string | null;
}

const licenseColors: Record<string, string> = {
  PERSONAL: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  COMMERCIAL: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  EXTENDED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  RESELLER: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  ENTERPRISE: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  PLR: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
};

const licenseNames: Record<string, Record<string, string>> = {
  ar: { PERSONAL: 'شخصي', COMMERCIAL: 'تجاري', EXTENDED: 'ممتد', RESELLER: 'إعادة البيع', ENTERPRISE: 'مؤسسي', PLR: 'حقوق تأليف خاصة' },
  en: { PERSONAL: 'Personal', COMMERCIAL: 'Commercial', EXTENDED: 'Extended', RESELLER: 'Reseller', ENTERPRISE: 'Enterprise', PLR: 'PLR' },
};

export default function PackagesList() {
  const { currentLang, setCurrentPage, setSelectedPackageId, user } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [licenseFilter, setLicenseFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);

  const isRTL = currentLang === 'ar';

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d || [])).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (categoryFilter !== 'all') params.set('category', categoryFilter);
    if (licenseFilter !== 'all') params.set('licenseType', licenseFilter);
    if (sort) params.set('sort', sort);

    fetch(`/api/products?${params.toString()}`)
      .then(r => r.json())
      .then(d => { if (!cancelled) setProducts(d.products || []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [search, categoryFilter, licenseFilter, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">{t('packages', currentLang)}</h1>
        <div className="w-20 h-1 bg-gradient-to-r from-[#B01743] to-[#F61A5A] rounded-full" />
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 sm:p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal className="w-5 h-5 text-[#F61A5A]" />
          <span className="text-sm font-medium text-white">{t('filter', currentLang)}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888A0] ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchProducts', currentLang)}
              className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-[#8888A0] focus:outline-none focus:border-[#F61A5A]/50"
              dir={isRTL ? 'rtl' : 'ltr'}
              style={{ paddingInlineStart: '2.25rem' }}
            />
          </div>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F61A5A]/50"
          >
            <option value="all" className="bg-[#1A1A2E]">{t('allCategories', currentLang)}</option>
            {categories.map(c => (
              <option key={c.slug} value={c.slug} className="bg-[#1A1A2E]">
                {currentLang === 'ar' ? c.name : (c.nameEn || c.name)}
              </option>
            ))}
          </select>

          {/* License */}
          <select
            value={licenseFilter}
            onChange={(e) => setLicenseFilter(e.target.value)}
            className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F61A5A]/50"
          >
            <option value="all" className="bg-[#1A1A2E]">{t('allLicenses', currentLang)}</option>
            {Object.entries(licenseNames[currentLang]).map(([key, name]) => (
              <option key={key} value={key} className="bg-[#1A1A2E]">{name}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F61A5A]/50"
          >
            <option value="newest" className="bg-[#1A1A2E]">{t('newest', currentLang)}</option>
            <option value="popular" className="bg-[#1A1A2E]">{t('popular', currentLang)}</option>
            <option value="priceLow" className="bg-[#1A1A2E]">{t('priceLow', currentLang)}</option>
            <option value="priceHigh" className="bg-[#1A1A2E]">{t('priceHigh', currentLang)}</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-[#F61A5A] border-t-transparent rounded-full" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-[#8888A0]">{t('noProducts', currentLang)}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group glass-card rounded-2xl overflow-hidden card-hover cursor-pointer"
              onClick={() => { setSelectedPackageId(product.id); setCurrentPage('package-detail'); }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={product.thumbnailUrl || '/slider1.png'}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E] to-transparent" />
                <div className="absolute top-3 end-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${licenseColors[product.licenseType] || ''}`}>
                    {licenseNames[currentLang][product.licenseType]}
                  </span>
                </div>
                <div className="absolute bottom-3 start-3 flex items-center gap-1 text-xs text-white/70">
                  <Download className="w-3.5 h-3.5" />{product.downloads}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-base font-semibold text-white mb-2 group-hover:text-[#F61A5A] transition-colors line-clamp-1">
                  {currentLang === 'ar' ? product.title : (product.titleEn || product.title)}
                </h3>
                <p className="text-sm text-[#8888A0] mb-4 line-clamp-2">
                  {currentLang === 'ar' ? product.description : (product.descriptionEn || product.description)}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold gradient-text">${product.price}</span>
                  <button className="btn-primary px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    {t('buyNow', currentLang)}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
