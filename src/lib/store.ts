import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PageName = 
  | 'landing' 
  | 'login' 
  | 'register' 
  | 'forgot-password' 
  | 'user-dashboard' 
  | 'admin-dashboard' 
  | 'packages' 
  | 'package-detail' 
  | 'categories' 
  | 'subscriptions' 
  | 'legal-page' 
  | 'faq' 
  | 'about'
  | 'user-purchases'
  | 'user-downloads'
  | 'user-referrals'
  | 'user-wallet'
  | 'admin-products'
  | 'admin-users'
  | 'admin-orders'
  | 'admin-settings'
  | 'admin-pages'
  | 'admin-testimonials'
  | 'admin-categories';

export type Language = 'ar' | 'en';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  referralCode: string;
  walletBalance: number;
}

interface AppState {
  currentPage: PageName;
  currentLang: Language;
  user: User | null;
  isAdmin: boolean;
  selectedPackageId: string | null;
  selectedCategorySlug: string | null;
  selectedLegalPage: string | null;
  showDepositModal: boolean;
  _isRestored: boolean;

  setCurrentPage: (page: PageName) => void;
  setCurrentLang: (lang: Language) => void;
  setUser: (user: User | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setSelectedPackageId: (id: string | null) => void;
  setSelectedCategorySlug: (slug: string | null) => void;
  setSelectedLegalPage: (slug: string | null) => void;
  setShowDepositModal: (show: boolean) => void;
  logout: () => void;
  setRestored: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentPage: 'landing',
      currentLang: 'ar',
      user: null,
      isAdmin: false,
      selectedPackageId: null,
      selectedCategorySlug: null,
      selectedLegalPage: null,
      showDepositModal: false,
      _isRestored: false,

      setCurrentPage: (page) => set({ currentPage: page }),
      setCurrentLang: (lang) => set({ currentLang: lang }),
      setUser: (user) => set({ user, isAdmin: user?.role === 'ADMIN' }),
      setIsAdmin: (isAdmin) => set({ isAdmin }),
      setSelectedPackageId: (id) => set({ selectedPackageId: id }),
      setSelectedCategorySlug: (slug) => set({ selectedCategorySlug: slug }),
      setSelectedLegalPage: (slug) => set({ selectedLegalPage: slug }),
      setShowDepositModal: (show) => set({ showDepositModal: show }),
      logout: () => set({ user: null, isAdmin: false, currentPage: 'landing' }),
      setRestored: () => set({ _isRestored: true }),
    }),
    {
      name: 'virallinkup-store',
      partialize: (state) => ({
        currentLang: state.currentLang,
        user: state.user,
        isAdmin: state.isAdmin,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._isRestored = true;
        }
      },
    }
  )
);
