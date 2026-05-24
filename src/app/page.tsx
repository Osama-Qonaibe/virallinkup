'use client';

import { useAppStore } from '@/lib/store';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import TechBackground from '@/components/TechBackground';
import ScrollToTop from '@/components/ScrollToTop';
import AuthInitializer from '@/components/AuthInitializer';
import AdminLayout from '@/components/AdminLayout';
import HeroSlider from '@/components/HeroSlider';
import FeaturesSection from '@/components/FeaturesSection';
import PackagesPreview from '@/components/PackagesPreview';
import TestimonialsSection from '@/components/TestimonialsSection';
import StatsSection from '@/components/StatsSection';
import FAQSection from '@/components/FAQSection';
import CTASection from '@/components/CTASection';
import LoginCard from '@/components/LoginCard';
import RegisterCard from '@/components/RegisterCard';
import ForgotPasswordCard from '@/components/ForgotPasswordCard';
import PackagesList from '@/components/PackagesList';
import PackageDetail from '@/components/PackageDetail';
import CategoriesPage from '@/components/CategoriesPage';
import SubscriptionsPage from '@/components/SubscriptionsPage';
import FAQPage from '@/components/FAQPage';
import LegalPageView from '@/components/LegalPageView';
import UserDashboard from '@/components/UserDashboard';
import UserPurchases from '@/components/UserPurchases';
import UserDownloads from '@/components/UserDownloads';
import UserReferrals from '@/components/UserReferrals';
import UserWallet from '@/components/UserWallet';
import AdminDashboard from '@/components/AdminDashboard';
import AdminProducts from '@/components/AdminProducts';
import AdminUsers from '@/components/AdminUsers';
import AdminOrders from '@/components/AdminOrders';
import AdminSettings from '@/components/AdminSettings';
import AdminCategories from '@/components/AdminCategories';
import AdminPages from '@/components/AdminPages';
import AdminTestimonials from '@/components/AdminTestimonials';

function LandingPage() {
  return (
    <>
      <HeroSlider />
      <FeaturesSection />
      <PackagesPreview />
      <TestimonialsSection />
      <StatsSection />
      <FAQSection />
      <CTASection />
    </>
  );
}

function AdminContent() {
  const { currentPage } = useAppStore();

  switch (currentPage) {
    case 'admin-products': return <AdminProducts />;
    case 'admin-users': return <AdminUsers />;
    case 'admin-orders': return <AdminOrders />;
    case 'admin-settings': return <AdminSettings />;
    case 'admin-categories': return <AdminCategories />;
    case 'admin-pages': return <AdminPages />;
    case 'admin-testimonials': return <AdminTestimonials />;
    default: return <AdminDashboard />;
  }
}

export default function HomePage() {
  const { currentPage } = useAppStore();
  const isAdminPage = currentPage.startsWith('admin-');
  const hideFooter = isAdminPage || ['login', 'register', 'forgot-password'].includes(currentPage);

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'login':
        return <LoginCard />;
      case 'register':
        return <RegisterCard />;
      case 'forgot-password':
        return <ForgotPasswordCard />;
      case 'packages':
        return <PackagesList />;
      case 'package-detail':
        return <PackageDetail />;
      case 'categories':
        return <CategoriesPage />;
      case 'subscriptions':
        return <SubscriptionsPage />;
      case 'faq':
        return <FAQPage />;
      case 'legal-page':
        return <LegalPageView />;
      case 'about':
        return <LegalPageView />;
      case 'user-dashboard':
        return <UserDashboard />;
      case 'user-purchases':
        return <UserPurchases />;
      case 'user-downloads':
        return <UserDownloads />;
      case 'user-referrals':
        return <UserReferrals />;
      case 'user-wallet':
        return <UserWallet />;
      case 'admin-dashboard':
      case 'admin-products':
      case 'admin-users':
      case 'admin-orders':
      case 'admin-settings':
      case 'admin-categories':
      case 'admin-pages':
      case 'admin-testimonials':
        return (
          <AdminLayout>
            <AdminContent />
          </AdminLayout>
        );
      default:
        return <LandingPage />;
    }
  };

  return (
    <AuthInitializer>
      <div className="min-h-screen flex flex-col relative">
        <TechBackground />
        <div className="relative z-10 flex flex-col min-h-screen">
          <SiteHeader />
          <main className="flex-1">
            {renderPage()}
          </main>
          {!hideFooter && <SiteFooter />}
        </div>
        <ScrollToTop />
      </div>
    </AuthInitializer>
  );
}
