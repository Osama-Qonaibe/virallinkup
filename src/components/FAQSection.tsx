'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const faqItems = [
  { qKey: 'faq1Q', aKey: 'faq1A' },
  { qKey: 'faq2Q', aKey: 'faq2A' },
  { qKey: 'faq3Q', aKey: 'faq3A' },
  { qKey: 'faq4Q', aKey: 'faq4A' },
  { qKey: 'faq5Q', aKey: 'faq5A' },
  { qKey: 'faq6Q', aKey: 'faq6A' },
];

export default function FAQSection() {
  const { currentLang } = useAppStore();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-3">
            {t('faqTitle', currentLang)}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#B01743] to-[#F61A5A] mx-auto rounded-full" />
        </div>

        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <div
              key={i}
              className="glass-card rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-start"
              >
                <span className="text-sm font-medium text-white pr-4">{t(item.qKey, currentLang)}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#F61A5A] shrink-0 transition-transform duration-300 ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="px-5 pb-5 text-sm text-[#8888A0] leading-relaxed">
                  {t(item.aKey, currentLang)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
