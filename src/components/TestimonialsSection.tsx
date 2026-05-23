'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  nameEn: string | null;
  content: string;
  contentEn: string | null;
  rating: number;
}

export default function TestimonialsSection() {
  const { currentLang } = useAppStore();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [active, setActive] = useState(0);
  const isRTL = currentLang === 'ar';

  useEffect(() => {
    fetch('/api/testimonials')
      .then(r => r.json())
      .then(d => setTestimonials(d || []))
      .catch(() => {});
  }, []);

  const next = () => setActive((prev) => (prev + 1) % testimonials.length);
  const prev = () => setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  if (testimonials.length === 0) return null;

  const current = testimonials[active];

  return (
    <section className="py-16 sm:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#B01743]/5 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-3">
            {t('testimonialsTitle', currentLang)}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#B01743] to-[#F61A5A] mx-auto rounded-full" />
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="glass-card rounded-2xl p-8 sm:p-10 text-center relative">
            <Quote className="absolute top-4 start-4 w-10 h-10 text-[#F61A5A]/10" />
            
            <div className="flex items-center justify-center gap-1 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < current.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                />
              ))}
            </div>

            <p className="text-base sm:text-lg text-[#E8E8F0] leading-relaxed mb-6 min-h-[60px]">
              {currentLang === 'ar' ? current.content : (current.contentEn || current.content)}
            </p>

            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#B01743] to-[#F61A5A] mx-auto flex items-center justify-center mb-3">
              <span className="text-white font-bold text-lg">
                {(currentLang === 'ar' ? current.name : (current.nameEn || current.name))[0]}
              </span>
            </div>
            <p className="text-sm font-semibold text-white">
              {currentLang === 'ar' ? current.name : (current.nameEn || current.name)}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#F61A5A]/20 flex items-center justify-center transition-colors text-white"
            >
              {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === active ? 'bg-[#F61A5A] w-6' : 'bg-white/20 w-2'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#F61A5A]/20 flex items-center justify-center transition-colors text-white"
            >
              {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
