'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Wallet, DollarSign, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export default function UserWallet() {
  const { currentLang, user, setCurrentPage } = useAppStore();
  const [balance, setBalance] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [msg, setMsg] = useState('');
  const isRTL = currentLang === 'ar';

  useEffect(() => {
    if (!user) return;
    fetch(`/api/referrals?userId=${user.id}`)
      .then(r => r.json())
      .then(d => setBalance(d.walletBalance || 0))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < 10) {
      setMsg(currentLang === 'ar' ? 'الحد الأدنى $10' : 'Minimum $10');
      return;
    }
    setWithdrawing(true);
    setMsg('');
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, amount }),
      });
      if (res.ok) {
        setBalance(prev => prev - amount);
        setWithdrawAmount('');
        setMsg(t('success', currentLang));
      } else {
        const d = await res.json();
        setMsg(d.error || t('error', currentLang));
      }
    } catch {
      setMsg(t('error', currentLang));
    }
    setWithdrawing(false);
  };

  if (loading) return <div className="flex items-center justify-center py-32"><div className="animate-spin w-8 h-8 border-2 border-[#F61A5A] border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => setCurrentPage('user-dashboard')} className="flex items-center gap-2 text-sm text-[#8888A0] hover:text-white transition-colors mb-6">
        {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
        {t('dashboard', currentLang)}
      </button>

      <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-8">{t('myWallet', currentLang)}</h1>

      {/* Balance Card */}
      <div className="glass-card rounded-2xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#B01743]/10 to-transparent rounded-bl-full" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-[#F61A5A]" />
            <span className="text-sm text-[#8888A0]">{t('balance', currentLang)}</span>
          </div>
          <p className="text-4xl font-bold gradient-text">${balance.toFixed(2)}</p>
        </div>
      </div>

      {/* Withdraw */}
      <div className="glass-card rounded-2xl p-6 mb-8">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[#F61A5A]" />
          {t('withdrawRequest', currentLang)}
        </h2>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <span className={`absolute top-1/2 -translate-y-1/2 text-[#8888A0] ${isRTL ? 'right-3' : 'left-3'}`}>$</span>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder={t('withdrawAmount', currentLang)}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-[#8888A0] focus:outline-none focus:border-[#F61A5A]/50"
              dir="ltr"
              style={{ paddingInlineStart: '1.75rem' }}
            />
          </div>
          <button
            onClick={handleWithdraw}
            disabled={withdrawing}
            className="btn-primary px-6 rounded-xl text-sm font-medium disabled:opacity-50"
          >
            {withdrawing ? t('loading', currentLang) : t('withdraw', currentLang)}
          </button>
        </div>
        <p className="text-xs text-[#8888A0] mt-2">{t('minWithdraw', currentLang)}: $10.00</p>
        {msg && <p className={`text-xs mt-2 ${msg === t('success', currentLang) ? 'text-emerald-400' : 'text-red-400'}`}>{msg}</p>}
      </div>

      {/* Transactions */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">{t('transactionHistory', currentLang)}</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <ArrowUpCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-white">{t('commission', currentLang)}</p>
              <p className="text-xs text-[#8888A0]">2024-01-15</p>
            </div>
            <span className="text-sm font-medium text-emerald-400">+$5.00</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <ArrowDownCircle className="w-5 h-5 text-red-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-white">{t('debit', currentLang)}</p>
              <p className="text-xs text-[#8888A0]">2024-01-10</p>
            </div>
            <span className="text-sm font-medium text-red-400">-$20.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}
