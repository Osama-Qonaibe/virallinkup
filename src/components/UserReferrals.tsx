'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Copy, Check, DollarSign, Gift, Users } from 'lucide-react';

interface ReferralData {
  referralCode: string;
  walletBalance: number;
  referrals: { id: string; commission: number; status: string; referred: { name: string | null; email: string; createdAt: string } }[];
  totalReferrals: number;
  totalCommission: number;
}

export default function UserReferrals() {
  const { currentLang, user, setCurrentPage } = useAppStore();
  const [data, setData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const isRTL = currentLang === 'ar';

  useEffect(() => {
    if (!user) return;
    fetch(`/api/referrals?userId=${user.id}`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const copyLink = () => {
    navigator.clipboard.writeText(`https://virallinkup.com/ref/${data?.referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="flex items-center justify-center py-32"><div className="animate-spin w-8 h-8 border-2 border-[#F61A5A] border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => setCurrentPage('user-dashboard')} className="flex items-center gap-2 text-sm text-[#8888A0] hover:text-white transition-colors mb-6">
        {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
        {t('dashboard', currentLang)}
      </button>

      <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-8">{t('myReferrals', currentLang)}</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: Users, label: t('totalReferrals', currentLang), value: data?.totalReferrals || 0, color: 'from-[#8B5CF6] to-[#A78BFA]' },
          { icon: DollarSign, label: t('commission', currentLang), value: `$${data?.totalCommission?.toFixed(2) || '0'}`, color: 'from-[#10B981] to-[#34D399]' },
          { icon: Gift, label: t('balance', currentLang), value: `$${data?.walletBalance?.toFixed(2) || '0'}`, color: 'from-[#B01743] to-[#F61A5A]' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="glass-card rounded-2xl p-5 text-center">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-[#8888A0]">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Referral Link */}
      <div className="glass-card rounded-2xl p-6 mb-8">
        <h2 className="text-sm font-semibold text-white mb-3">{t('referralLink', currentLang)}</h2>
        <div className="flex gap-2">
          <div className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-[#8888A0] truncate" dir="ltr">
            https://virallinkup.com/ref/{data?.referralCode}
          </div>
          <button onClick={copyLink} className="btn-primary px-4 rounded-xl flex items-center gap-2 text-sm">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? t('copied', currentLang) : t('copyLink', currentLang)}
          </button>
        </div>
      </div>

      {/* Referral List */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">
          {currentLang === 'ar' ? 'قائمة الإحالات' : 'Referral List'}
        </h2>
        {(!data?.referrals || data.referrals.length === 0) ? (
          <p className="text-sm text-[#8888A0] text-center py-8">{currentLang === 'ar' ? 'لا توجد إحالات بعد' : 'No referrals yet'}</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {data.referrals.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div>
                  <p className="text-sm font-medium text-white">{r.referred.name || r.referred.email}</p>
                  <p className="text-xs text-[#8888A0]">{new Date(r.referred.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="text-sm font-medium text-emerald-400">${r.commission}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
