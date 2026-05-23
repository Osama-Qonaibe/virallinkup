'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { useState, useEffect } from 'react';

interface Page {
  id: string;
  slug: string;
  title: string;
  titleEn: string | null;
  type: string;
  updatedAt: string;
}

export default function AdminPages() {
  const { currentLang, setCurrentPage, setSelectedLegalPage } = useAppStore();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const slugs = ['privacy-policy', 'terms-conditions', 'about'];
    Promise.all(slugs.map(s => fetch(`/api/pages/${s}`).then(r => r.json()).catch(() => null)))
      .then(results => { setPages(results.filter(Boolean)); setLoading(false); });
  }, []);

  const openPage = (slug: string) => {
    setSelectedLegalPage(slug);
    setCurrentPage('legal-page');
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-[#F61A5A] border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold gradient-text">{t('pages', currentLang)}</h1>
      <div className="space-y-2">
        {pages.map((p) => (
          <button
            key={p.id}
            onClick={() => openPage(p.slug)}
            className="w-full glass-card rounded-xl p-4 flex items-center justify-between hover:border-[#F61A5A]/30 transition-colors text-start"
          >
            <div>
              <p className="text-sm font-medium text-white">{currentLang === 'ar' ? p.title : (p.titleEn || p.title)}</p>
              <p className="text-xs text-[#8888A0]">{p.slug} • {p.type}</p>
            </div>
            <span className="text-xs text-[#F61A5A]">{t('view', currentLang)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
