'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { user, setUser, setRestored, currentLang } = useAppStore();
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser({
            id: data.id,
            email: data.email,
            name: data.name || '',
            role: data.role,
            avatar: data.avatar,
            referralCode: data.referralCode,
            walletBalance: data.walletBalance,
          });
        }
      } catch {
        // Session expired or invalid - user stays logged out
      } finally {
        setRestored();
        setIsHydrating(false);
      }
    };

    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply language direction to document
  useEffect(() => {
    if (!currentLang) return;
    const isRTL = currentLang === 'ar';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  // Show loading screen while restoring session
  if (isHydrating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A1A]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#B01743] to-[#F61A5A] flex items-center justify-center animate-pulse">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-[#F61A5A] animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-[#F61A5A] animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-[#F61A5A] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
