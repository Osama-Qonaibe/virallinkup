'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { licenseColors, licenseNames, type Product } from '@/lib/constants';
import { useState, useEffect } from 'react';
import { Download, ShoppingBag, Check, ArrowLeft, ArrowRight } from 'lucide-react';

export default function PackageDetail() {
  const { currentLang, selectedPackageId, setCurrentPage, user } = useAppStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const isRTL = currentLang === 'ar';

  useEffect(() => {
    if (!selectedPackageId) { setCurrentPage('packages'); return; }
    let cancelled = false;
    fetch(`/api/products/${selectedPackageId}`)
      .then(r => r.json())
      .then(d => { if (!cancelled) setProduct(d); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedPackageId, setCurrentPage]);

  const handleBuy = async () => {
    if (!user || !product) return;
    setBuying(true);
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, productId: product.id, licenseType: product.licenseType }),
      });
      setCurrentPage('user-purchases');
    } catch {}
    setBuying(false);
  };

  if (loading) return <div className="flex items-center justify-center py-32"><div className="animate-spin w-8 h-8 border-2 border-[#F61A5A] border-t-transparent rounded-full" /></div>;
  if (!product) return null;

  const features: string[] = JSON.parse(product.features || '[]');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => setCurrentPage('packages')}
        className="flex items-center gap-2 text-sm text-[#8888A0] hover:text-white transition-colors mb-6"
      >
        {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
        {t('packages', currentLang)}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="rounded-2xl overflow-hidden glass-card">
          <img
            src={product.thumbnailUrl || '/slider1.png'}
            alt={currentLang === 'ar' ? product.title : (product.titleEn || product.title)}
            className="w-full h-64 sm:h-80 object-cover"
          />
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full border mb-3 ${licenseColors[product.licenseType] || ''}`}>
              {licenseNames[currentLang][product.licenseType] || product.licenseType}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {currentLang === 'ar' ? product.title : (product.titleEn || product.title)}
            </h1>
            <p className="text-[#8888A0] text-sm leading-relaxed">
              {currentLang === 'ar' ? product.description : (product.descriptionEn || product.description)}
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-[#8888A0]">
            <span className="flex items-center gap-1"><Download className="w-4 h-4" />{product.downloads} {t('downloads', currentLang)}</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold gradient-text">${product.price}</span>
          </div>

          {user ? (
            <button
              onClick={handleBuy}
              disabled={buying}
              className="w-full btn-primary py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShoppingBag className="w-5 h-5" />
              {buying ? t('loading', currentLang) : t('buyNow', currentLang)}
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentPage('login')}
                className="flex-1 btn-primary py-3.5 rounded-xl text-sm font-semibold text-center"
              >
                {t('login', currentLang)}
              </button>
              <button
                onClick={() => setCurrentPage('register')}
                className="flex-1 btn-secondary py-3.5 rounded-xl text-sm font-semibold text-center"
              >
                {t('register', currentLang)}
              </button>
            </div>
          )}

          {/* Features */}
          {features.length > 0 && (
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">{t('features', currentLang)}</h3>
              <ul className="space-y-2">
                {features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[#B4CDD3]">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
