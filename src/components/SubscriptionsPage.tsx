'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { Check, Sparkles, Crown, Star } from 'lucide-react';

const plans = [
  {
    key: 'basic',
    icon: Star,
    color: 'from-[#B4CDD3] to-[#8EC5CC]',
    priceKey: 'basicPrice',
    descKey: 'basicDesc',
    featuresAr: ['10 منتج شهرياً', 'ترخيص شخصي', 'دعم بالبريد', 'تحديثات شهرية'],
    featuresEn: ['10 products/month', 'Personal license', 'Email support', 'Monthly updates'],
    popular: false,
  },
  {
    key: 'pro',
    icon: Sparkles,
    color: 'from-[#B01743] to-[#F61A5A]',
    priceKey: 'proPrice',
    descKey: 'proDesc',
    featuresAr: ['منتجات غير محدودة', 'ترخيص تجاري', 'دعم أولوية 24/7', 'تحديثات فورية', 'محتوى حصري'],
    featuresEn: ['Unlimited products', 'Commercial license', '24/7 priority support', 'Instant updates', 'Exclusive content'],
    popular: true,
  },
  {
    key: 'premium',
    icon: Crown,
    color: 'from-[#F59E0B] to-[#FBBF24]',
    priceKey: 'premiumPrice',
    descKey: 'premiumDesc',
    featuresAr: ['كل شيء غير محدود', 'جميع أنواع التراخيص', 'دعم مخصص', 'محتوى حصري مبكر', 'برنامج إحالة مميز', 'وصول مدى الحياة'],
    featuresEn: ['Everything unlimited', 'All license types', 'Dedicated support', 'Early exclusive content', 'Premium referral program', 'Lifetime access'],
    popular: false,
  },
];

export default function SubscriptionsPage() {
  const { currentLang } = useAppStore();
  const isAr = currentLang === 'ar';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-12">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-3">
          {t('subscriptionsTitle', currentLang)}
        </h1>
        <p className="text-[#8888A0]">{t('subscriptionsDesc', currentLang)}</p>
        <div className="w-20 h-1 bg-gradient-to-r from-[#B01743] to-[#F61A5A] mx-auto rounded-full mt-3" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.key}
              className={`relative glass-card rounded-2xl p-6 sm:p-8 card-hover ${plan.popular ? 'ring-2 ring-[#F61A5A] glow-rose' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-[#B01743] to-[#F61A5A] text-xs font-semibold text-white">
                  {t('mostPopular', currentLang)}
                </div>
              )}

              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mx-auto mb-4`}>
                <Icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-lg font-bold text-white text-center mb-1">
                {t(plan.key, currentLang)}
              </h3>
              <p className="text-sm text-[#8888A0] text-center mb-4">
                {t(plan.descKey, currentLang)}
              </p>

              <div className="text-center mb-6">
                <span className="text-3xl font-bold gradient-text">{t(plan.priceKey, currentLang)}</span>
                <span className="text-sm text-[#8888A0]">{t('perMonth', currentLang)}</span>
              </div>

              <ul className="space-y-3 mb-6">
                {(isAr ? plan.featuresAr : plan.featuresEn).map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[#B4CDD3]">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                  plan.popular
                    ? 'btn-primary glow-rose'
                    : 'btn-secondary'
                }`}
              >
                {t('getStarted', currentLang)}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
