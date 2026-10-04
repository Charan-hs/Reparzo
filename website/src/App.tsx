import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { Footer } from './components/layout/Footer';
import { FullScreenSearch } from './components/search/FullScreenSearch';
import { LocationPickerModal } from './components/location/LocationPickerModal';
import { AddressMapModal } from './components/location/AddressMapModal';
import { UnifiedAuthModal } from './components/auth/UnifiedAuthModal';
import { CategoryManagerModal } from './components/admin/CategoryManagerModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { CustomRequestModal } from './components/common/CustomRequestModal';
import { ScrollManager } from './components/layout/ScrollManager';

import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ProfilePage } from './pages/ProfilePage';
import { BookingsPage } from './pages/BookingsPage';
import { PartnerDashboard } from './pages/PartnerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { HealthPage } from './pages/HealthPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { ContactPage } from './pages/ContactPage';
import { useAppStore } from './store/useAppStore';

function DashboardRouter() {
  const { user } = useAppStore();
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'partner') return <PartnerDashboard />;
  if (user?.role === 'user') return <BookingsPage />;
  return <Navigate to="/bookings" replace />;
}

export function App() {
  const { 
    loginWithFirebaseUser, 
    user, 
    fetchCatalog, 
    fetchServiceHubs, 
    initLocationLifecycle 
  } = useAppStore();

  // Fetch live categories, subcategories & services from backend API + Hubs + Init Location Lifecycle
  useEffect(() => {
    fetchCatalog();
    fetchServiceHubs();
    initLocationLifecycle();
  }, [fetchCatalog, fetchServiceHubs, initLocationLifecycle]);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && !user) {
        loginWithFirebaseUser(firebaseUser);
      }
    });
    return () => unsubscribe();
  }, [loginWithFirebaseUser, user]);

  return (
    <BrowserRouter>
      {/* Scroll restoration manager for forward & backward navigation */}
      <ScrollManager />

      <div className="min-h-screen flex flex-col bg-[#080D1A] text-slate-100 font-sans selection:bg-[#4770DB]/30 selection:text-white">
        <Toaster position="bottom-right" theme="dark" richColors />

        {/* Global Navigation Header (Blinkit-inspired with Location & Search) */}
        <Navbar />

        {/* Full-Screen Search Overlay (Opens when user clicks search bar) */}
        <FullScreenSearch />

        {/* Location Picker Modal */}
        <LocationPickerModal />

        {/* Interactive Map Address Modal */}
        <AddressMapModal />

        {/* Unified 3-Role Authentication Modal (Customer, Partner, Admin) */}
        <UnifiedAuthModal />

        {/* Admin Category Manager CMS */}
        <CategoryManagerModal />

        {/* Slide-over Cart Drawer */}
        <CartDrawer />

        {/* User-to-Admin Custom & Unique Request Modal */}
        <CustomRequestModal />

        {/* Main Routed Page Content */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/partner" element={<PartnerDashboard />} />
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/cart" element={<CheckoutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/account" element={<ProfilePage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/orders" element={<BookingsPage />} />
            <Route path="/health" element={<HealthPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/terms-and-conditions" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/contact-us" element={<ContactPage />} />
            {/* Fallback Catch-All Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />

        {/* Mobile-First Bottom Navigation Dock with Floating Cart */}
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
