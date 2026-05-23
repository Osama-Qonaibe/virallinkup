'use client';

import { useAppStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function LegalPageView() {
  const { currentLang, selectedLegalPage, setCurrentPage } = useAppStore();
  const [page, setPage] = useState<{ title: string; titleEn: string | null; content: string; contentEn: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const isRTL = currentLang === 'ar';

  useEffect(() => {
    if (!selectedLegalPage) { setCurrentPage('landing'); return; }
    let cancelled = false;
    fetch(`/api/pages/${selectedLegalPage}`)
      .then(r => r.json())
      .then(d => { if (!cancelled) setPage(d); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedLegalPage, setCurrentPage]);

  if (loading) return <div className="flex items-center justify-center py-32"><div className="animate-spin w-8 h-8 border-2 border-[#F61A5A] border-t-transparent rounded-full" /></div>;
  if (!page) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => setCurrentPage('landing')}
        className="flex items-center gap-2 text-sm text-[#8888A0] hover:text-white transition-colors mb-6"
      >
        {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
        {currentLang === 'ar' ? 'الرئيسية' : 'Home'}
      </button>

      <div className="glass-card rounded-2xl p-6 sm:p-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">
          {currentLang === 'ar' ? page.title : (page.titleEn || page.title)}
        </h1>
        <div
          className="prose prose-invert max-w-none text-[#B4CDD3] leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: currentLang === 'ar' ? page.content : (page.contentEn || page.content),
          }}
        />
      </div>
    </div>
  );
}
