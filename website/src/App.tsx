import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { Footer } from './components/layout/Footer';
import { FullScreenSearch } from './components/search/FullScreenSearch';
import { LocationPickerModal } from './components/location/LocationPickerModal';
import { UnifiedAuthModal } from './components/auth/UnifiedAuthModal';
import { CategoryManagerModal } from './components/admin/CategoryManagerModal';
import { CartDrawer } from './components/cart/CartDrawer';

import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PartnerDashboard } from './pages/PartnerDashboard';
import { HealthPage } from './pages/HealthPage';

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#080D1A] text-slate-100 font-sans selection:bg-[#4770DB]/30 selection:text-white">
        <Toaster position="bottom-right" theme="dark" richColors />

        {/* Global Navigation Header (Blinkit-inspired with Location & Search) */}
        <Navbar />

        {/* Full-Screen Search Overlay (Opens when user clicks search bar) */}
        <FullScreenSearch />

        {/* Location Picker Modal */}
        <LocationPickerModal />

        {/* Unified 3-Role Authentication Modal (Customer, Partner, Admin) */}
        <UnifiedAuthModal />

        {/* Admin Category Manager CMS */}
        <CategoryManagerModal />

        {/* Slide-over Cart Drawer */}
        <CartDrawer />

        {/* Main Routed Page Content */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/cart" element={<CheckoutPage />} />
            <Route path="/partner" element={<PartnerDashboard />} />
            <Route path="/health" element={<HealthPage />} />
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
