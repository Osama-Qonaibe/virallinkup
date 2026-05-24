'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { useState, useEffect } from 'react';
import {
  Package, Users, ShoppingCart, Settings,
  DollarSign, TrendingUp, Eye, ArrowUpRight, Activity
} from 'lucide-react';

interface AdminStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  recentOrders: { id: string; amount: number; status: string; createdAt: string; user: { name: string | null; email: string }; product: { title: string; titleEn: string | null } }[];
}

export default function AdminDashboard() {
  const { currentLang, currentPage, setCurrentPage } = useAppStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { icon: DollarSign, label: t('totalRevenue', currentLang), value: `$${stats?.totalRevenue?.toFixed(2) || '0'}`, change: '+12.5%', color: 'from-[#B01743] to-[#F61A5A]', bg: 'bg-[#F61A5A]/10' },
    { icon: TrendingUp, label: currentLang === 'ar' ? 'الإيرادات الشهرية' : 'Monthly Revenue', value: `$${stats?.monthlyRevenue?.toFixed(2) || '0'}`, change: '+8.2%', color: 'from-[#10B981] to-[#34D399]', bg: 'bg-emerald-500/10' },
    { icon: Users, label: t('totalUsers', currentLang), value: stats?.totalUsers || 0, change: '+24', color: 'from-[#0EA5E9] to-[#38BDF8]', bg: 'bg-sky-500/10' },
    { icon: Package, label: t('totalProducts', currentLang), value: stats?.totalProducts || 0, change: '+3', color: 'from-[#8B5CF6] to-[#A78BFA]', bg: 'bg-violet-500/10' },
    { icon: ShoppingCart, label: t('totalOrders', currentLang), value: stats?.totalOrders || 0, change: '+18', color: 'from-[#F59E0B] to-[#FBBF24]', bg: 'bg-amber-500/10' },
  ];

  const quickActions = [
    { key: 'admin-products', label: t('addProduct', currentLang), icon: Package, color: 'from-[#B01743] to-[#F61A5A]' },
    { key: 'admin-users', label: t('users', currentLang), icon: Users, color: 'from-[#0EA5E9] to-[#38BDF8]' },
    { key: 'admin-orders', label: t('orders', currentLang), icon: ShoppingCart, color: 'from-[#F59E0B] to-[#FBBF24]' },
    { key: 'admin-settings', label: t('settings', currentLang), icon: Settings, color: 'from-[#8B5CF6] to-[#A78BFA]' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-10 h-10 border-3 border-[#F61A5A] border-t-transparent rounded-full" />
          <p className="text-sm text-[#8888A0]">{t('loading', currentLang)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text">{t('overview', currentLang)}</h1>
          <p className="text-sm text-[#8888A0] mt-1">
            {currentLang === 'ar' ? 'مرحباً بك في لوحة إدارة فيرال لينك أب' : 'Welcome to ViralLinkUp Admin Panel'}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">
            {currentLang === 'ar' ? 'النظام يعمل بشكل طبيعي' : 'System Operational'}
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="glass-card rounded-2xl p-5 card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                  <ArrowUpRight className="w-3 h-3" />
                  {s.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-[#8888A0] mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-[#8888A0] mb-3">
          {currentLang === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                onClick={() => setCurrentPage(action.key as typeof currentPage)}
                className="glass-card rounded-xl p-4 flex flex-col items-center gap-3 card-hover group text-center"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-[#E8E8F0]">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-[#F61A5A]" />
            {currentLang === 'ar' ? 'أحدث الطلبات' : 'Recent Orders'}
          </h2>
          <button
            onClick={() => setCurrentPage('admin-orders')}
            className="text-xs text-[#F61A5A] hover:text-[#FF6B8A] flex items-center gap-1 font-medium"
          >
            {t('viewAll', currentLang)}
            <Eye className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-start py-3 text-[#8888A0] font-medium text-xs uppercase tracking-wider">{currentLang === 'ar' ? 'العميل' : 'Customer'}</th>
                <th className="text-start py-3 text-[#8888A0] font-medium text-xs uppercase tracking-wider">{currentLang === 'ar' ? 'المنتج' : 'Product'}</th>
                <th className="text-start py-3 text-[#8888A0] font-medium text-xs uppercase tracking-wider">{t('amount', currentLang)}</th>
                <th className="text-start py-3 text-[#8888A0] font-medium text-xs uppercase tracking-wider">{t('status', currentLang)}</th>
                <th className="text-start py-3 text-[#8888A0] font-medium text-xs uppercase tracking-wider">{t('date', currentLang)}</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentOrders || []).slice(0, 5).map((order) => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 text-white font-medium">{order.user?.name || order.user?.email}</td>
                  <td className="py-3 text-[#B4CDD3] truncate max-w-[200px]">{currentLang === 'ar' ? order.product?.title : order.product?.titleEn}</td>
                  <td className="py-3 text-[#F61A5A] font-bold">${order.amount}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      order.status === 'COMPLETED' ? 'bg-emerald-500/15 text-emerald-400' :
                      order.status === 'PENDING' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-red-500/15 text-red-400'
                    }`}>{order.status}</span>
                  </td>
                  <td className="py-3 text-[#8888A0] text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#8888A0]">
                    {t('noResults', currentLang)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
