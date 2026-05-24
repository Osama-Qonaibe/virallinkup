'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { useState } from 'react';
import {
  LayoutDashboard, Package, Users, ShoppingCart, Settings,
  FileText, MessageSquare, FolderOpen, Menu, X
} from 'lucide-react';

const sidebarItems = [
  { key: 'admin-dashboard', icon: LayoutDashboard, labelKey: 'overview' },
  { key: 'admin-products', icon: Package, labelKey: 'products' },
  { key: 'admin-orders', icon: ShoppingCart, labelKey: 'orders' },
  { key: 'admin-users', icon: Users, labelKey: 'users' },
  { key: 'admin-categories', icon: FolderOpen, labelKey: 'categoriesManage' },
  { key: 'admin-testimonials', icon: MessageSquare, labelKey: 'testimonialsManage' },
  { key: 'admin-pages', icon: FileText, labelKey: 'pages' },
  { key: 'admin-settings', icon: Settings, labelKey: 'settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { currentLang, currentPage, setCurrentPage } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isRTL = currentLang === 'ar';

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-e border-white/5 bg-[#0A0A15] sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="p-4 flex-1">
          <div className="flex items-center gap-2 px-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#B01743] to-[#F61A5A] flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-bold gradient-text">{t('admin', currentLang)}</h3>
          </div>
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setCurrentPage(item.key as typeof currentPage)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#F61A5A]/15 text-[#F61A5A] shadow-[inset_3px_0_0_#F61A5A]'
                      : 'text-[#8888A0] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" />
                  {t(item.labelKey, currentLang)}
                </button>
              );
            })}
          </nav>
        </div>
        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5">
          <div className="glass-card rounded-lg p-3 text-center">
            <p className="text-xs text-[#8888A0]">ViralLinkUp</p>
            <p className="text-[10px] text-[#8888A0]/60 mt-1">v1.0.0</p>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed bottom-6 end-6 z-40 w-12 h-12 rounded-full bg-[#F61A5A] text-white flex items-center justify-center shadow-lg glow-rose-strong"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className={`absolute ${isRTL ? 'right-0' : 'left-0'} top-0 w-64 h-full bg-[#0A0A15] flex flex-col shadow-2xl`}>
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#B01743] to-[#F61A5A] flex items-center justify-center">
                  <LayoutDashboard className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-bold gradient-text">{t('admin', currentLang)}</h3>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-[#8888A0] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => { setCurrentPage(item.key as typeof currentPage); setMobileOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#F61A5A]/15 text-[#F61A5A]'
                        : 'text-[#8888A0] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                    {t(item.labelKey, currentLang)}
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden min-w-0">
        {children}
      </main>
    </div>
  );
}
