'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { useState, useEffect } from 'react';
import {
  ShoppingCart, Download, Users, Wallet,
  Package, ArrowLeft, ArrowRight, DollarSign
} from 'lucide-react';

interface DashData {
  totalPurchases: number;
  totalSpent: number;
  totalReferrals: number;
  walletBalance: number;
  referralCode: string;
  recentOrders: { id: string; amount: number; status: string; createdAt: string; product: { title: string; titleEn: string | null } }[];
}

export default function UserDashboard() {
  const { currentLang, user, setCurrentPage } = useAppStore();
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const isRTL = currentLang === 'ar';

  useEffect(() => {
    if (!user) return;
    fetch(`/api/user/dashboard?userId=${user.id}`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="flex items-center justify-center py-32"><div className="animate-spin w-8 h-8 border-2 border-[#F61A5A] border-t-transparent rounded-full" /></div>;

  const stats = [
    { icon: ShoppingCart, label: t('totalPurchases', currentLang), value: data?.totalPurchases || 0, color: 'from-[#B01743] to-[#F61A5A]' },
    { icon: DollarSign, label: t('totalSpent', currentLang), value: `$${data?.totalSpent?.toFixed(2) || '0'}`, color: 'from-[#0EA5E9] to-[#38BDF8]' },
    { icon: Users, label: t('totalReferrals', currentLang), value: data?.totalReferrals || 0, color: 'from-[#8B5CF6] to-[#A78BFA]' },
    { icon: Wallet, label: t('balance', currentLang), value: `$${data?.walletBalance?.toFixed(2) || '0'}`, color: 'from-[#10B981] to-[#34D399]' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text">
          {t('welcomeBack', currentLang)}، {user?.name}!
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="glass-card rounded-2xl p-5 card-hover cursor-pointer" onClick={() => {
              if (i === 0) setCurrentPage('user-purchases');
              if (i === 2) setCurrentPage('user-referrals');
              if (i === 3) setCurrentPage('user-wallet');
            }}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-[#8888A0]">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: t('myPurchases', currentLang), page: 'user-purchases' as const, icon: Package },
          { label: t('myDownloads', currentLang), page: 'user-downloads' as const, icon: Download },
          { label: t('myReferrals', currentLang), page: 'user-referrals' as const, icon: Users },
          { label: t('myWallet', currentLang), page: 'user-wallet' as const, icon: Wallet },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.page}
              onClick={() => setCurrentPage(action.page)}
              className="glass-card rounded-xl p-4 text-center card-hover"
            >
              <Icon className="w-6 h-6 text-[#F61A5A] mx-auto mb-2" />
              <span className="text-xs font-medium text-white">{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">{t('myPurchases', currentLang)}</h2>
        {(!data?.recentOrders || data.recentOrders.length === 0) ? (
          <p className="text-sm text-[#8888A0] text-center py-8">{t('noPurchases', currentLang)}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-start py-3 text-[#8888A0] font-medium">{currentLang === 'ar' ? 'المنتج' : 'Product'}</th>
                  <th className="text-start py-3 text-[#8888A0] font-medium">{t('amount', currentLang)}</th>
                  <th className="text-start py-3 text-[#8888A0] font-medium">{t('status', currentLang)}</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 text-white">{currentLang === 'ar' ? order.product.title : (order.product.titleEn || order.product.title)}</td>
                    <td className="py-3 text-[#F61A5A] font-medium">${order.amount}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                        order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {t(order.status.toLowerCase() as 'completed' | 'pending' | 'refunded', currentLang)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
