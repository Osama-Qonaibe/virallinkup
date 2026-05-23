'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';

const sliderData = [
  { img: '/slider1.png', titleKey: 'heroTitle1', subtitleKey: 'heroSubtitle1' },
  { img: '/slider2.png', titleKey: 'heroTitle2', subtitleKey: 'heroSubtitle2' },
  { img: '/slider3.png', titleKey: 'heroTitle3', subtitleKey: 'heroSubtitle3' },
  { img: '/slider4.png', titleKey: 'heroTitle4', subtitleKey: 'heroSubtitle4' },
  { img: '/slider5.png', titleKey: 'heroTitle5', subtitleKey: 'heroSubtitle5' },
  { img: '/slider6.png', titleKey: 'heroTitle6', subtitleKey: 'heroSubtitle6' },
];

export default function HeroSlider() {
  const { currentLang, setCurrentPage } = useAppStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const goToSlide = useCallback((index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsTransitioning(false);
    }, 300);
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      goToSlide((currentSlide + 1) % sliderData.length);
    }, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentSlide, goToSlide]);

  const slide = sliderData[currentSlide];

  return (
    <section className="relative h-[500px] sm:h-[550px] lg:h-[600px] overflow-hidden">
      {/* Background Slides */}
      {sliderData.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-all duration-1000 ease-in-out"
          style={{
            opacity: i === currentSlide ? 1 : 0,
            transform: i === currentSlide ? 'scale(1)' : 'scale(1.08)',
          }}
        >
          <img
            src={s.img}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            loading={i < 2 ? 'eager' : 'lazy'}
          />
        </div>
      ))}

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F1A] via-[#0F0F1A]/70 to-[#0F0F1A]/30 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#B01743]/15 to-transparent z-[1]" />

      {/* Animated side accent */}
      <div className="absolute top-0 end-0 w-1/3 h-full bg-gradient-to-l from-[#F61A5A]/5 to-transparent z-[1]" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-2xl space-y-6">
            <div
              className="space-y-4"
              style={{
                opacity: isTransitioning ? 0 : 1,
                transform: isTransitioning ? 'translateY(20px)' : 'translateY(0)',
                transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-[#F61A5A]/15 border border-[#F61A5A]/30 rounded-full px-4 py-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F61A5A] animate-pulse" />
                <span className="text-xs font-medium text-[#F61A5A]">
                  {currentLang === 'ar' ? 'ViralLinkUp' : 'ViralLinkUp'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
                {t(slide.titleKey, currentLang)}
              </h1>
              <p className="text-base sm:text-lg text-[#B4CDD3]/90 leading-relaxed max-w-xl">
                {t(slide.subtitleKey, currentLang)}
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => setCurrentPage('packages')}
                  className="btn-primary px-7 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2 group"
                >
                  {t('heroCTA1', currentLang)}
                  <svg className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${currentLang === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    useAppStore.getState().setSelectedLegalPage('about');
                    setCurrentPage('legal-page');
                  }}
                  className="btn-secondary px-7 py-3.5 rounded-xl text-sm font-bold"
                >
                  {t('heroCTA2', currentLang)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2.5">
        {sliderData.map((_, i) => (
          <button
            key={i}
            className={`h-2.5 rounded-full transition-all duration-500 ${
              i === currentSlide
                ? 'bg-[#F61A5A] w-10 shadow-[0_0_12px_rgba(246,26,90,0.6)]'
                : 'bg-white/25 w-2.5 hover:bg-white/40'
            }`}
            onClick={() => goToSlide(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute bottom-8 end-8 z-10 text-white/40 text-sm font-mono hidden sm:block">
        <span className="text-[#F61A5A] font-bold text-lg">
          {String(currentSlide + 1).padStart(2, '0')}
        </span>
        <span className="mx-1">/</span>
        <span>{String(sliderData.length).padStart(2, '0')}</span>
      </div>

      {/* Prev/Next Arrows */}
      <button
        onClick={() => goToSlide((currentSlide - 1 + sliderData.length) % sliderData.length)}
        className="absolute start-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-black/50 transition-all hidden md:flex"
        aria-label="Previous slide"
      >
        <svg className={`w-5 h-5 ${currentLang === 'ar' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => goToSlide((currentSlide + 1) % sliderData.length)}
        className="absolute end-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-black/50 transition-all hidden md:flex"
        aria-label="Next slide"
      >
        <svg className={`w-5 h-5 ${currentLang === 'ar' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
}
