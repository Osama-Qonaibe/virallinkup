'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { Sparkles, DollarSign, Headphones, RefreshCw, FileText, Users } from 'lucide-react';

const features = [
  { icon: Sparkles, titleAr: 'feature1Title', descAr: 'feature1Desc', titleEn: 'feature1Title', descEn: 'feature1Desc' },
  { icon: DollarSign, titleAr: 'feature2Title', descAr: 'feature2Desc', titleEn: 'feature2Title', descEn: 'feature2Desc' },
  { icon: Headphones, titleAr: 'feature3Title', descAr: 'feature3Desc', titleEn: 'feature3Title', descEn: 'feature3Desc' },
  { icon: RefreshCw, titleAr: 'feature4Title', descAr: 'feature4Desc', titleEn: 'feature4Title', descEn: 'feature4Desc' },
  { icon: FileText, titleAr: 'feature5Title', descAr: 'feature5Desc', titleEn: 'feature5Title', descEn: 'feature5Desc' },
  { icon: Users, titleAr: 'feature6Title', descAr: 'feature6Desc', titleEn: 'feature6Title', descEn: 'feature6Desc' },
];

export default function FeaturesSection() {
  const { currentLang } = useAppStore();

  return (
    <section className="py-16 sm:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-3">
            {t('featuresTitle', currentLang)}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#B01743] to-[#F61A5A] mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="group glass-card rounded-2xl p-6 card-hover cursor-default"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#B01743]/20 to-[#F61A5A]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-[#F61A5A]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {t(feature.titleAr, currentLang)}
                </h3>
                <p className="text-sm text-[#8888A0] leading-relaxed">
                  {t(feature.descAr, currentLang)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
