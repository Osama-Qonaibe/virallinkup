'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, ArrowRight, Wallet, DollarSign, ArrowDownCircle, ArrowUpCircle,
  Plus, CreditCard, Crown, Check, X, Shield, Zap, Star, Gift, Clock, Loader2, AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const PREDEFINED_AMOUNTS = [10, 25, 50, 100];

const PLANS = [
  {
    id: 'BASIC',
    nameAr: 'أساسي',
    nameEn: 'Basic',
    price: 9.99,
    icon: Star,
    color: 'text-[#B4CDD3]',
    bgColor: 'bg-[#B4CDD3]/10',
    borderColor: 'border-[#B4CDD3]/30',
    features: {
      ar: ['5 تحميلات شهرياً', 'دعم عبر البريد', 'تحديثات الأساسية'],
      en: ['5 downloads per month', 'Email support', 'Basic updates'],
    },
  },
  {
    id: 'PRO',
    nameAr: 'احترافي',
    nameEn: 'Pro',
    price: 24.99,
    icon: Zap,
    color: 'text-[#F61A5A]',
    bgColor: 'bg-[#F61A5A]/10',
    borderColor: 'border-[#F61A5A]/30',
    popular: true,
    features: {
      ar: ['50 تحميل شهرياً', 'دعم فني ذو أولوية', 'تحديثات مجانية', 'محتوى حصري'],
      en: ['50 downloads per month', 'Priority support', 'Free updates', 'Exclusive content'],
    },
  },
  {
    id: 'PREMIUM',
    nameAr: 'مميز',
    nameEn: 'Premium',
    price: 49.99,
    icon: Crown,
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
    borderColor: 'border-amber-400/30',
    features: {
      ar: ['تحميلات غير محدودة', 'دعم فني على مدار الساعة', 'كل التحديثات مجاناً', 'محتوى حصري', 'عمولة إحالة مضاعفة'],
      en: ['Unlimited downloads', '24/7 support', 'All updates free', 'Exclusive content', 'Double referral commission'],
    },
  },
];

export default function UserWallet() {
  const { currentLang, user, setCurrentPage, showDepositModal, setShowDepositModal, setUser } = useAppStore();
  const [balance, setBalance] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [msg, setMsg] = useState('');
  const isRTL = currentLang === 'ar';

  // Deposit state
  const [selectedAmount, setSelectedAmount] = useState<number | null>(25);
  const [customAmount, setCustomAmount] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [depositMsg, setDepositMsg] = useState('');

  // Subscription state
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [subMsg, setSubMsg] = useState('');

  // Cancel subscription dialog
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Payment history
  const [paymentHistory, setPaymentHistory] = useState<Array<{
    id: string;
    amount: number;
    currency: string;
    type: string;
    status: string;
    createdAt: string;
    metadata: Record<string, string> | null;
  }>>([]);

  // User subscription data
  const [userSub, setUserSub] = useState<{
    plan: string | null;
    status: string | null;
    expiresAt: string | null;
  }>({ plan: null, status: null, expiresAt: null });

  const fetchUserData = useCallback(async () => {
    if (!user) return;
    try {
      const [refRes, subRes, historyRes] = await Promise.all([
        fetch(`/api/referrals?userId=${user.id}`),
        fetch(`/api/user/dashboard?userId=${user.id}`),
        fetch(`/api/payments/history?userId=${user.id}`),
      ]);
      const refData = await refRes.json();
      setBalance(refData.walletBalance || 0);

      const subData = await subRes.json();
      setUserSub({
        plan: subData.subscriptionPlan || null,
        status: subData.subscriptionStatus || null,
        expiresAt: subData.subscriptionExpiresAt || null,
      });

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setPaymentHistory(historyData || []);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

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

  const handleDeposit = async () => {
    const amount = selectedAmount || parseFloat(customAmount);
    if (!amount || amount <= 0) {
      setDepositMsg(currentLang === 'ar' ? 'يرجى اختيار مبلغ صالح' : 'Please enter a valid amount');
      return;
    }
    setDepositing(true);
    setDepositMsg('');
    try {
      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'deposit',
          amount,
          userId: user?.id,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setDepositMsg(data.error || t('error', currentLang));
        setDepositing(false);
        return;
      }

      if (data.demoMode) {
        // Simulate demo payment
        setDepositMsg(t('paymentProcessing', currentLang));
        setTimeout(async () => {
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentIntentId: data.paymentIntentId }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.status === 'COMPLETED') {
              setBalance(verifyData.walletBalance || balance + amount);
              setUser({ ...user!, walletBalance: verifyData.walletBalance || balance + amount });
              setDepositMsg('');
              setShowDepositModal(false);
              setSelectedAmount(25);
              setCustomAmount('');
              fetchUserData();
            } else {
              setDepositMsg(t('paymentFailed', currentLang));
            }
          } catch {
            setDepositMsg(t('paymentFailed', currentLang));
          }
          setDepositing(false);
        }, 2000);
      } else {
        // Redirect to Stripe checkout
        if (data.url) {
          window.location.href = data.url;
        }
        setDepositing(false);
      }
    } catch {
      setDepositMsg(t('error', currentLang));
      setDepositing(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) return;
    setSubscribing(planId);
    setSubMsg('');
    try {
      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'subscription',
          plan: planId,
          userId: user.id,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setSubMsg(data.error || t('error', currentLang));
        setSubscribing(null);
        return;
      }

      if (data.demoMode) {
        setSubMsg(t('paymentProcessing', currentLang));
        setTimeout(async () => {
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentIntentId: data.paymentIntentId }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              fetchUserData();
              setSubMsg('');
            } else {
              setSubMsg(t('paymentFailed', currentLang));
            }
          } catch {
            setSubMsg(t('paymentFailed', currentLang));
          }
          setSubscribing(null);
        }, 2000);
      } else {
        if (data.url) {
          window.location.href = data.url;
        }
        setSubscribing(null);
      }
    } catch {
      setSubMsg(t('error', currentLang));
      setSubscribing(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user) return;
    setCancelling(true);
    try {
      const res = await fetch('/api/payments/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      if (res.ok) {
        fetchUserData();
      }
    } catch {
      // silent
    }
    setCancelling(false);
    setShowCancelDialog(false);
  };

  if (loading) return <div className="flex items-center justify-center py-32"><div className="animate-spin w-8 h-8 border-2 border-[#F61A5A] border-t-transparent rounded-full" /></div>;

  const getFinalDepositAmount = () => {
    if (selectedAmount) return selectedAmount;
    const custom = parseFloat(customAmount);
    return isNaN(custom) ? 0 : custom;
  };

  const getPlanData = (planId: string) => PLANS.find(p => p.id === planId);

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
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-[#F61A5A]" />
              <span className="text-sm text-[#8888A0]">{t('balance', currentLang)}</span>
            </div>
            <p className="text-4xl font-bold gradient-text">${balance.toFixed(2)}</p>
          </div>
          <button
            onClick={() => setShowDepositModal(true)}
            className="btn-primary px-6 py-3 rounded-xl text-sm font-medium flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            {t('deposit', currentLang)}
          </button>
        </div>
      </div>

      {/* Current Subscription */}
      {userSub.status === 'ACTIVE' && userSub.plan && (() => {
        const planData = getPlanData(userSub.plan);
        if (!planData) return null;
        const PlanIcon = planData.icon;
        return (
          <div className={`glass-card rounded-2xl p-6 mb-8 border ${planData.borderColor}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${planData.bgColor} flex items-center justify-center`}>
                  <PlanIcon className={`w-6 h-6 ${planData.color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">
                      {currentLang === 'ar' ? planData.nameAr : planData.nameEn} {t('subscriptionPlan', currentLang)}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-medium">
                      {t('active', currentLang)}
                    </span>
                  </div>
                  <p className="text-sm text-[#8888A0] mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {t('subExpiry', currentLang)}: {userSub.expiresAt ? new Date(userSub.expiresAt).toLocaleDateString(currentLang === 'ar' ? 'ar-SA' : 'en-US') : 'N/A'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCancelDialog(true)}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
              >
                {t('cancelSubscription', currentLang)}
              </button>
            </div>
          </div>
        );
      })()}

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

      {/* Subscription Plans */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold gradient-text flex items-center gap-2">
            <Crown className="w-5 h-5" />
            {t('subscriptionsTitle', currentLang)}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map(plan => {
            const Icon = plan.icon;
            const isCurrentPlan = userSub.plan === plan.id && userSub.status === 'ACTIVE';
            const isLoading = subscribing === plan.id;
            return (
              <div
                key={plan.id}
                className={`glass-card rounded-2xl p-6 relative transition-all ${plan.popular ? 'border-[#F61A5A]/30 glow-rose' : ''} ${isCurrentPlan ? plan.borderColor : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-[#B01743] to-[#F61A5A] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {t('mostPopular', currentLang)}
                    </span>
                  </div>
                )}
                <div className={`w-10 h-10 rounded-xl ${plan.bgColor} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${plan.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  {currentLang === 'ar' ? plan.nameAr : plan.nameEn}
                </h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-bold gradient-text">${plan.price.toFixed(2)}</span>
                  <span className="text-sm text-[#8888A0]">{t('perMonth2', currentLang)}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {(currentLang === 'ar' ? plan.features.ar : plan.features.en).map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-[#8888A0]">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {isCurrentPlan ? (
                  <div className="w-full py-2.5 rounded-xl text-sm font-medium text-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {currentLang === 'ar' ? 'الخطة الحالية' : 'Current Plan'}
                  </div>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 btn-primary"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                    {isLoading ? t('paymentProcessing', currentLang) : t('getStarted', currentLang)}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {subMsg && (
          <p className={`text-sm mt-3 text-center ${subMsg.includes(t('paymentProcessing', currentLang)) ? 'text-amber-400' : 'text-red-400'}`}>
            {subMsg}
          </p>
        )}
      </div>

      {/* Payment History */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-[#F61A5A]" />
          {t('paymentHistory', currentLang)}
        </h2>
        {paymentHistory.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="w-10 h-10 text-[#8888A0]/30 mx-auto mb-3" />
            <p className="text-sm text-[#8888A0]">{currentLang === 'ar' ? 'لا توجد مدفوعات بعد' : 'No payments yet'}</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {paymentHistory.map(payment => (
              <div key={payment.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                {payment.type === 'DEPOSIT' ? (
                  <ArrowDownCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : payment.type === 'SUBSCRIPTION' ? (
                  <Crown className="w-5 h-5 text-amber-400 shrink-0" />
                ) : (
                  <Gift className="w-5 h-5 text-[#B4CDD3] shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">
                    {payment.type === 'DEPOSIT' && t('depositToWallet', currentLang)}
                    {payment.type === 'SUBSCRIPTION' && `${t('subscriptionPlan', currentLang)}: ${payment.metadata?.plan || ''}`}
                    {payment.type === 'PURCHASE' && currentLang === 'ar' ? 'شراء منتج' : 'Product Purchase'}
                  </p>
                  <p className="text-xs text-[#8888A0]">{new Date(payment.createdAt).toLocaleDateString(currentLang === 'ar' ? 'ar-SA' : 'en-US')}</p>
                </div>
                <div className="text-end shrink-0">
                  <span className="text-sm font-medium text-white">${payment.amount.toFixed(2)}</span>
                  <span className={`block text-xs ${payment.status === 'COMPLETED' ? 'text-emerald-400' : payment.status === 'PENDING' ? 'text-amber-400' : 'text-red-400'}`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Deposit Dialog */}
      <Dialog open={showDepositModal} onOpenChange={setShowDepositModal}>
        <DialogContent className="bg-[#1A1A2E] border border-white/10 sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold gradient-text flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              {t('depositFunds', currentLang)}
            </DialogTitle>
            <DialogDescription className="text-sm text-[#8888A0]">
              {t('chooseAmount', currentLang)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Predefined Amounts */}
            <div className="grid grid-cols-4 gap-3">
              {PREDEFINED_AMOUNTS.map(amount => (
                <button
                  key={amount}
                  onClick={() => { setSelectedAmount(amount); setCustomAmount(''); }}
                  className={`py-3 rounded-xl text-sm font-bold transition-all ${
                    selectedAmount === amount
                      ? 'bg-gradient-to-br from-[#B01743] to-[#F61A5A] text-white glow-rose'
                      : 'bg-white/5 text-[#8888A0] border border-white/10 hover:border-[#F61A5A]/30 hover:text-white'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="space-y-2">
              <label className="text-xs text-[#8888A0] font-medium">{t('customAmount', currentLang)}</label>
              <div className="relative">
                <span className={`absolute top-1/2 -translate-y-1/2 text-[#8888A0] text-sm font-medium ${isRTL ? 'right-4' : 'left-4'}`}>$</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                  placeholder="0.00"
                  className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F61A5A]/50"
                  dir="ltr"
                  style={{ paddingInlineStart: '2rem' }}
                  min="1"
                />
              </div>
            </div>

            {/* Secure Payment Note */}
            <div className="flex items-center gap-2 text-xs text-[#8888A0] bg-white/5 rounded-lg p-3">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              {t('securePaymentNote', currentLang)}
            </div>

            {/* Total */}
            {getFinalDepositAmount() > 0 && (
              <div className="flex items-center justify-between py-2 border-t border-white/10">
                <span className="text-sm text-[#8888A0]">{t('depositAmount', currentLang)}</span>
                <span className="text-xl font-bold gradient-text">${getFinalDepositAmount().toFixed(2)}</span>
              </div>
            )}

            {/* Messages */}
            {depositMsg && (
              <div className={`flex items-center gap-2 text-sm p-3 rounded-xl ${
                depositMsg === t('paymentProcessing', currentLang) ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {depositMsg === t('paymentProcessing', currentLang) ? (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                {depositMsg}
              </div>
            )}

            {/* Proceed Button */}
            <button
              onClick={handleDeposit}
              disabled={depositing || getFinalDepositAmount() <= 0}
              className="w-full btn-primary py-3 rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {depositing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('paymentProcessing', currentLang)}
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  {t('proceedToPayment', currentLang)}
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="bg-[#1A1A2E] border border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">{t('cancelConfirmTitle', currentLang)}</AlertDialogTitle>
            <AlertDialogDescription className="text-[#8888A0]">
              {t('cancelConfirmDesc', currentLang)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-[#8888A0] hover:text-white hover:bg-white/10">
              {t('cancel', currentLang)}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={cancelling}
              className="bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 focus:ring-red-500"
            >
              {cancelling ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('loading', currentLang)}
                </span>
              ) : t('cancelSubscription', currentLang)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
