'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  nameEn: string | null;
  content: string;
  contentEn: string | null;
  rating: number;
}

export default function AdminTestimonials() {
  const { currentLang } = useAppStore();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/testimonials').then(r => r.json()).then(d => { setTestimonials(d || []); setLoading(false); }).catch(() => {});
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-[#F61A5A] border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold gradient-text">{t('testimonialsManage', currentLang)}</h1>
      <div className="space-y-3">
        {testimonials.map((t2) => (
          <div key={t2.id} className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#B01743] to-[#F61A5A] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{(currentLang === 'ar' ? t2.name : (t2.nameEn || t2.name))[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{currentLang === 'ar' ? t2.name : (t2.nameEn || t2.name)}</p>
                  <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3 h-3 ${i < t2.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />)}</div>
                </div>
              </div>
            </div>
            <p className="text-sm text-[#B4CDD3]">{currentLang === 'ar' ? t2.content : (t2.contentEn || t2.content)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
