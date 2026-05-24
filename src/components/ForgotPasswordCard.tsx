'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { Mail, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function ForgotPasswordCard() {
  const { currentLang, setCurrentPage } = useAppStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const isRTL = currentLang === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {}
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#B01743] to-[#F61A5A] flex items-center justify-center mx-auto mb-4">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">{t('forgotPasswordTitle', currentLang)}</h2>
            <p className="text-sm text-[#8888A0] mt-2">{t('forgotPasswordDesc', currentLang)}</p>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-sm text-white">
                {currentLang === 'ar'
                  ? 'تم إرسال رابط الاستعادة إلى بريدك الإلكتروني'
                  : 'Reset link sent to your email'}
              </p>
              <button
                onClick={() => setCurrentPage('login')}
                className="btn-primary px-6 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 mx-auto"
              >
                {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                {t('backToLogin', currentLang)}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                {loading ? t('sending', currentLang) : t('sendResetLink', currentLang)}
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage('login')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm text-[#8888A0] hover:text-white transition-colors"
              >
                {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                {t('backToLogin', currentLang)}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
