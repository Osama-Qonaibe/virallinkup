'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { useState } from 'react';
import { Mail, Send } from 'lucide-react';

export default function SiteFooter() {
  const { currentLang, setCurrentPage } = useAppStore();
  const [email, setEmail] = useState('');
  const isRTL = currentLang === 'ar';

  const handleSubscribe = () => {
    setEmail('');
  };

  return (
    <footer className="bg-[#0A0A15] border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/logo.jpg" alt="ViralLinkUp" className="h-10 w-10 rounded-lg object-cover" />
              <span className="text-xl font-bold gradient-text">ViralLinkUp</span>
            </div>
            <p className="text-sm text-[#8888A0] leading-relaxed">
              {currentLang === 'ar'
                ? 'منصة رائدة للمنتجات الرقمية الاحترافية. اكتشف أفضل الأدوات والقوالب والموارد الرقمية.'
                : 'A leading platform for professional digital products. Discover the best tools, templates, and digital resources.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">
              {currentLang === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: t('packages', currentLang), page: 'packages' as const },
                { label: t('categories', currentLang), page: 'categories' as const },
                { label: t('subscriptions', currentLang), page: 'subscriptions' as const },
                { label: t('faq', currentLang), page: 'faq' as const },
              ].map((link) => (
                <li key={link.page}>
                  <button
                    onClick={() => setCurrentPage(link.page)}
                    className="text-sm text-[#8888A0] hover:text-[#F61A5A] transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">
              {t('legalTitle', currentLang)}
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: t('aboutUs', currentLang), slug: 'about' },
                { label: t('privacyPolicy', currentLang), slug: 'privacy-policy' },
                { label: t('termsConditions', currentLang), slug: 'terms-conditions' },
              ].map((link) => (
                <li key={link.slug}>
                  <button
                    onClick={() => {
                      useAppStore.getState().setSelectedLegalPage(link.slug);
                      setCurrentPage('legal-page');
                    }}
                    className="text-sm text-[#8888A0] hover:text-[#F61A5A] transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">
              {t('newsletter', currentLang)}
            </h4>
            <p className="text-sm text-[#8888A0] mb-4">
              {t('newsletterDesc', currentLang)}
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888A0] ${isRTL ? 'right-3' : 'left-3'}`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder', currentLang)}
                  className="w-full py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-[#8888A0] focus:outline-none focus:border-[#F61A5A]/50"
                  dir={isRTL ? 'rtl' : 'ltr'}
                  style={{ paddingInlineStart: '2.25rem', paddingInlineEnd: '0.75rem' }}
                />
              </div>
              <button
                onClick={handleSubscribe}
                className="btn-primary p-2 rounded-lg"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#8888A0]">
            © {new Date().getFullYear()} ViralLinkUp. {t('allRightsReserved', currentLang)}.
          </p>
          <div className="flex items-center gap-4">
            {['twitter', 'instagram', 'linkedin', 'github'].map((social) => (
              <a
                key={social}
                href="#"
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#8888A0] hover:text-[#F61A5A] hover:bg-[#F61A5A]/10 transition-all"
              >
                <span className="text-xs font-bold uppercase">{social[0]}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
