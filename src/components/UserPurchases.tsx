'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Download } from 'lucide-react';

interface Order {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  licenseType: string;
  product: { title: string; titleEn: string | null; thumbnailUrl: string | null };
}

export default function UserPurchases() {
  const { currentLang, user, setCurrentPage } = useAppStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const isRTL = currentLang === 'ar';

  useEffect(() => {
    if (!user) return;
    fetch(`/api/orders?userId=${user.id}`)
      .then(r => r.json())
      .then(d => setOrders(d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="flex items-center justify-center py-32"><div className="animate-spin w-8 h-8 border-2 border-[#F61A5A] border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => setCurrentPage('user-dashboard')} className="flex items-center gap-2 text-sm text-[#8888A0] hover:text-white transition-colors mb-6">
        {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
        {t('dashboard', currentLang)}
      </button>

      <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-8">{t('myPurchases', currentLang)}</h1>

      {orders.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Download className="w-12 h-12 text-[#8888A0] mx-auto mb-4" />
          <p className="text-[#8888A0]">{t('noPurchases', currentLang)}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="glass-card rounded-xl p-4 flex items-center gap-4 card-hover">
              <img
                src={order.product.thumbnailUrl || '/slider1.png'}
                alt=""
                className="w-16 h-16 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white truncate">
                  {currentLang === 'ar' ? order.product.title : (order.product.titleEn || order.product.title)}
                </h3>
                <p className="text-xs text-[#8888A0]">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-end shrink-0">
                <p className="text-base font-bold text-[#F61A5A]">${order.amount}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  order.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                  order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {t(order.status.toLowerCase() as 'completed' | 'pending' | 'refunded', currentLang)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
