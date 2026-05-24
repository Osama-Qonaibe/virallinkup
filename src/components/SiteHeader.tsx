'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Globe, ChevronDown, User, LogOut, LayoutDashboard,
  ShoppingCart, Heart, Shield
} from 'lucide-react';

export default function SiteHeader() {
  const {
    currentPage, currentLang, user, isAdmin,
    setCurrentPage, setCurrentLang, logout, setUser
  } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const isRTL = currentLang === 'ar';

  const toggleLang = () => {
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    setCurrentLang(newLang);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    logout();
  };

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [currentLang, isRTL]);

  const navItems = [
    { key: 'landing', label: t('home', currentLang) },
    { key: 'packages', label: t('packages', currentLang) },
    { key: 'categories', label: t('categories', currentLang) },
    { key: 'subscriptions', label: t('subscriptions', currentLang) },
    { key: 'faq', label: t('faq', currentLang) },
  ];

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => setCurrentPage('landing')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img src="/logo.jpg" alt="ViralLinkUp" className="h-9 w-9 rounded-lg object-cover" />
            <span className="text-xl font-bold gradient-text hidden sm:block">ViralLinkUp</span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setCurrentPage(item.key as typeof currentPage)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === item.key
                    ? 'bg-[#F61A5A]/15 text-[#F61A5A]'
                    : 'text-[#8888A0] hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-white/5 hover:bg-white/10 transition-colors text-[#B4CDD3]"
            >
              <Globe className="w-4 h-4" />
              <span>{currentLang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {/* User Menu or Auth Buttons */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#B01743] to-[#F61A5A] flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white hidden sm:block">
                    {user.name || user.email}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#8888A0]" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-56 rounded-xl bg-[#1A1A2E] border border-white/10 shadow-2xl overflow-hidden`}
                    >
                      <div className="p-3 border-b border-white/5">
                        <p className="text-sm font-medium text-white truncate">{user.name}</p>
                        <p className="text-xs text-[#8888A0] truncate">{user.email}</p>
                      </div>
                      <div className="p-1.5">
                        <button
                          onClick={() => { setCurrentPage('user-dashboard'); setUserMenuOpen(false); setMobileOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#E8E8F0] hover:bg-white/5 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#F61A5A]" />
                          {t('dashboard', currentLang)}
                        </button>
                        <button
                          onClick={() => { setCurrentPage('user-purchases'); setUserMenuOpen(false); setMobileOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#E8E8F0] hover:bg-white/5 transition-colors"
                        >
                          <ShoppingCart className="w-4 h-4 text-[#F61A5A]" />
                          {t('myPurchases', currentLang)}
                        </button>
                        <button
                          onClick={() => { setCurrentPage('user-wallet'); setUserMenuOpen(false); setMobileOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#E8E8F0] hover:bg-white/5 transition-colors"
                        >
                          <Heart className="w-4 h-4 text-[#F61A5A]" />
                          {t('myWallet', currentLang)}
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => { setCurrentPage('admin-dashboard'); setUserMenuOpen(false); setMobileOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#F61A5A] hover:bg-[#F61A5A]/10 transition-colors"
                          >
                            <Shield className="w-4 h-4" />
                            {t('adminDashboard', currentLang)}
                          </button>
                        )}
                        <hr className="my-1 border-white/5" />
                        <button
                          onClick={() => { handleLogout(); setUserMenuOpen(false); setMobileOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          {t('logout', currentLang)}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage('login')}
                  className="px-4 py-1.5 rounded-lg text-sm font-medium text-[#B4CDD3] hover:bg-white/5 transition-colors"
                >
                  {t('login', currentLang)}
                </button>
                <button
                  onClick={() => setCurrentPage('register')}
                  className="btn-primary px-4 py-1.5 rounded-lg text-sm font-medium text-white"
                >
                  {t('register', currentLang)}
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors text-white"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-white/5"
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => { setCurrentPage(item.key as typeof currentPage); setMobileOpen(false); }}
                  className={`w-full text-start px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    currentPage === item.key
                      ? 'bg-[#F61A5A]/15 text-[#F61A5A]'
                      : 'text-[#8888A0] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              {!user && (
                <div className="pt-3 border-t border-white/5 flex gap-2">
                  <button
                    onClick={() => { setCurrentPage('login'); setMobileOpen(false); }}
                    className="flex-1 py-2 rounded-lg text-sm font-medium text-center text-[#B4CDD3] border border-[#B4CDD3]/30"
                  >
                    {t('login', currentLang)}
                  </button>
                  <button
                    onClick={() => { setCurrentPage('register'); setMobileOpen(false); }}
                    className="flex-1 btn-primary py-2 rounded-lg text-sm font-medium text-center text-white"
                  >
                    {t('register', currentLang)}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
