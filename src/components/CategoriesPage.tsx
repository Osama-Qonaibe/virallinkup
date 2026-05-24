'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { useState, useEffect } from 'react';
import { Layout, Code, Palette, Globe, TrendingUp, GraduationCap, Briefcase, Share2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  icon: string | null;
}

const iconMap: Record<string, React.ElementType> = {
  Layout, Code, Palette, Globe, TrendingUp, GraduationCap, Briefcase, Share2,
};

const categoryColors = [
  'from-[#B01743] to-[#F61A5A]',
  'from-[#0EA5E9] to-[#38BDF8]',
  'from-[#8B5CF6] to-[#A78BFA]',
  'from-[#10B981] to-[#34D399]',
  'from-[#F59E0B] to-[#FBBF24]',
  'from-[#EC4899] to-[#F472B6]',
  'from-[#06B6D4] to-[#22D3EE]',
  'from-[#EF4444] to-[#F87171]',
];

export default function CategoriesPage() {
  const { currentLang, setCurrentPage, setSelectedCategorySlug } = useAppStore();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d || [])).catch(() => {});
  }, []);

  const openCategory = (slug: string) => {
    setSelectedCategorySlug(slug);
    setCurrentPage('packages');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">
          {t('browseCategories', currentLang)}
        </h1>
        <div className="w-20 h-1 bg-gradient-to-r from-[#B01743] to-[#F61A5A] rounded-full" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat, i) => {
          const Icon = iconMap[cat.icon || ''] || Layout;
          const gradient = categoryColors[i % categoryColors.length];
          return (
            <button
              key={cat.id}
              onClick={() => openCategory(cat.slug)}
              className="group glass-card rounded-2xl p-6 text-center card-hover"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-base font-semibold text-white group-hover:text-[#F61A5A] transition-colors">
                {currentLang === 'ar' ? cat.name : (cat.nameEn || cat.name)}
              </h3>
            </button>
          );
        })}
      </div>
    </div>
  );
}
