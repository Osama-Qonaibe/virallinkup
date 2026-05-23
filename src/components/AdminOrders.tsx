'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { useState, useEffect } from 'react';

interface Order {
  id: string;
  amount: number;
  status: string;
  licenseType: string;
  createdAt: string;
  user: { name: string | null; email: string };
  product: { title: string; titleEn: string | null };
}

export default function AdminOrders() {
  const { currentLang } = useAppStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/orders').then(r => r.json()).then(d => { setOrders(d || []); setLoading(false); }).catch(() => {});
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-[#F61A5A] border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold gradient-text">{t('orders', currentLang)}</h1>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[#1A1A2E]">
              <tr className="border-b border-white/5">
                <th className="text-start py-3 px-4 text-[#8888A0] font-medium">{currentLang === 'ar' ? 'العميل' : 'Customer'}</th>
                <th className="text-start py-3 px-4 text-[#8888A0] font-medium">{currentLang === 'ar' ? 'المنتج' : 'Product'}</th>
                <th className="text-start py-3 px-4 text-[#8888A0] font-medium">{t('amount', currentLang)}</th>
                <th className="text-start py-3 px-4 text-[#8888A0] font-medium">{currentLang === 'ar' ? 'الترخيص' : 'License'}</th>
                <th className="text-start py-3 px-4 text-[#8888A0] font-medium">{t('status', currentLang)}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-white">{o.user?.name || o.user?.email}</td>
                  <td className="py-3 px-4 text-[#B4CDD3] truncate max-w-[150px]">{currentLang === 'ar' ? o.product?.title : o.product?.titleEn}</td>
                  <td className="py-3 px-4 text-[#F61A5A] font-medium">${o.amount}</td>
                  <td className="py-3 px-4 text-[#8888A0]">{o.licenseType}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      o.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                      o.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                    }`}>{o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
