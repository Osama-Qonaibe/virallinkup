'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { licenseColors, licenseNames, type Product } from '@/lib/constants';
import { useState, useEffect } from 'react';
import { Download, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';

export default function PackagesPreview() {
  const { currentLang, setCurrentPage, setSelectedPackageId } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const isRTL = currentLang === 'ar';

  useEffect(() => {
    fetch('/api/products?limit=6')
      .then(r => r.json())
      .then(d => setProducts(d.products || []))
      .catch(() => {});
  }, []);

  const openPackage = (id: string) => {
    setSelectedPackageId(id);
    setCurrentPage('package-detail');
  };

  return (
    <section className="py-16 sm:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">
              {t('featuredPackages', currentLang)}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#B01743] to-[#F61A5A] rounded-full" />
          </div>
          <button
            onClick={() => setCurrentPage('packages')}
            className="flex items-center gap-1 text-sm font-medium text-[#F61A5A] hover:text-[#FF6B8A] transition-colors"
          >
            {t('viewAll', currentLang)}
            {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, i) => (
            <div
              key={product.id}
              className="group glass-card rounded-2xl overflow-hidden card-hover cursor-pointer"
              onClick={() => openPackage(product.id)}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Thumbnail */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={product.thumbnailUrl || '/slider1.png'}
                  alt={currentLang === 'ar' ? product.title : (product.titleEn || product.title)}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E] to-transparent" />
                <div className="absolute top-3 end-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${licenseColors[product.licenseType] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                    {licenseNames[currentLang][product.licenseType] || product.licenseType}
                  </span>
                </div>
                <div className="absolute bottom-3 start-3 flex items-center gap-1 text-xs text-white/70">
                  <Download className="w-3.5 h-3.5" />
                  {product.downloads} {t('downloads', currentLang)}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-base font-semibold text-white mb-2 group-hover:text-[#F61A5A] transition-colors line-clamp-1">
                  {currentLang === 'ar' ? product.title : (product.titleEn || product.title)}
                </h3>
                <p className="text-sm text-[#8888A0] mb-4 line-clamp-2">
                  {currentLang === 'ar' ? product.description : (product.descriptionEn || product.description)}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold gradient-text">
                    ${product.price}
                  </span>
                  <button className="btn-primary px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    {t('buyNow', currentLang)}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
