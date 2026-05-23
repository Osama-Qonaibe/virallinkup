'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { ArrowLeft, ArrowRight, Rocket } from 'lucide-react';

export default function CTASection() {
  const { currentLang, setCurrentPage } = useAppStore();
  const isRTL = currentLang === 'ar';

  return (
    <section className="py-16 sm:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl overflow-hidden">
          {/* BG */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#B01743] to-[#F61A5A]" />
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-72 h-72 bg-white/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#B4CDD3]/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10 px-8 py-14 sm:px-14 sm:py-18 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
              {t('ctaTitle', currentLang)}
            </h2>
            <p className="text-base sm:text-lg text-white/80 mb-8 max-w-xl mx-auto">
              {t('ctaDesc', currentLang)}
            </p>
            <button
              onClick={() => setCurrentPage('register')}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-[#B01743] font-semibold text-sm hover:bg-white/90 transition-all hover:scale-105 shadow-lg shadow-black/20"
            >
              {t('ctaButton', currentLang)}
              {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
