'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { Package, Users, Download, FolderOpen } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

interface StatItem {
  icon: React.ElementType;
  value: number;
  labelKey: string;
  suffix: string;
}

const stats: StatItem[] = [
  { icon: Package, value: 500, labelKey: 'statProducts', suffix: '+' },
  { icon: Users, value: 12000, labelKey: 'statUsers', suffix: '+' },
  { icon: Download, value: 85000, labelKey: 'statDownloads', suffix: '+' },
  { icon: FolderOpen, value: 25, labelKey: 'statCategories', suffix: '' },
];

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const step = target / (duration / 16);
          let current = 0;
          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref}>
      {count.toLocaleString()}{suffix}
    </div>
  );
}

export default function StatsSection() {
  const { currentLang } = useAppStore();

  return (
    <section className="py-16 sm:py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-[#B01743]/5 via-transparent to-[#B4CDD3]/5" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-3">
            {t('statsTitle', currentLang)}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#B01743] to-[#F61A5A] mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="glass-card rounded-2xl p-6 text-center card-hover"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#B01743]/20 to-[#F61A5A]/20 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-[#F61A5A]" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm text-[#8888A0]">
                  {t(stat.labelKey, currentLang)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
