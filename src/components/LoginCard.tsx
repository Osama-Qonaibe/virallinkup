'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function LoginCard() {
  const { currentLang, setCurrentPage, setUser } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isRTL = currentLang === 'ar';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setUser({
          id: data.id,
          email: data.email,
          name: data.name || '',
          role: data.role,
          referralCode: data.referralCode,
          walletBalance: data.walletBalance,
        });
        setCurrentPage(data.role === 'ADMIN' ? 'admin-dashboard' : 'user-dashboard');
      } else {
        setError(data.error || t('invalidCredentials', currentLang));
      }
    } catch {
      setError(t('error', currentLang));
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: `user_${Date.now()}@gmail.com`, name: 'Google User' }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser({
          id: data.id,
          email: data.email,
          name: data.name || '',
          role: data.role,
          referralCode: data.referralCode,
          walletBalance: data.walletBalance,
        });
        setCurrentPage('user-dashboard');
      }
    } catch {}
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#B01743] to-[#F61A5A] flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">{t('login', currentLang)}</h2>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888A0] ${isRTL ? 'right-3' : 'left-3'}`} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('email', currentLang)}
                required
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-[#8888A0] focus:outline-none focus:border-[#F61A5A]/50"
                dir="ltr"
                style={{ paddingInlineStart: '2.5rem', paddingInlineEnd: '0.75rem' }}
              />
            </div>

            <div className="relative">
              <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888A0] ${isRTL ? 'right-3' : 'left-3'}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('password', currentLang)}
                required
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-[#8888A0] focus:outline-none focus:border-[#F61A5A]/50"
                dir="ltr"
                style={{ paddingInlineStart: '2.5rem', paddingInlineEnd: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute top-1/2 -translate-y-1/2 text-[#8888A0] hover:text-white ${isRTL ? 'left-3' : 'right-3'}`}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded accent-[#F61A5A]" />
                <span className="text-xs text-[#8888A0]">{t('rememberMe', currentLang)}</span>
              </label>
              <button
                type="button"
                onClick={() => setCurrentPage('forgot-password')}
                className="text-xs text-[#F61A5A] hover:text-[#FF6B8A] transition-colors"
              >
                {t('forgotPassword', currentLang)}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {loading ? t('loading', currentLang) : t('login', currentLang)}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-white/10 flex-1" />
              <span className="px-3 text-xs text-[#8888A0]">{t('orContinueWith', currentLang)}</span>
              <div className="border-t border-white/10 flex-1" />
            </div>
            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t('googleAuth', currentLang)}
            </button>
          </div>

          <p className="text-center mt-6 text-sm text-[#8888A0]">
            {t('noAccount', currentLang)}{' '}
            <button
              onClick={() => setCurrentPage('register')}
              className="text-[#F61A5A] font-medium hover:text-[#FF6B8A] transition-colors"
            >
              {t('createAccount', currentLang)}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
