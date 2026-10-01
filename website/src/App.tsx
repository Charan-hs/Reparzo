import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { HealthPage } from './pages/HealthPage';
import { BookingModal } from './pages/BookingModal';
import { api, type ServiceItem } from './lib/api';

export function App() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  useEffect(() => {
    async function loadServices() {
      try {
        const data = await api.getServices();
        setServices(data || []);
      } catch (err) {
        console.warn('Failed to load services from API:', err);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  const handleOpenBooking = (service?: ServiceItem) => {
    setSelectedService(service || null);
    setIsBookingOpen(true);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
        <Toaster position="bottom-right" theme="dark" richColors />

        {/* Global Navbar */}
        <Navbar onOpenBooking={() => handleOpenBooking()} />

        {/* Page Content */}
        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  services={services}
                  loading={loading}
                  onSelectService={(s) => setSelectedService(s)}
                  onOpenBooking={() => setIsBookingOpen(true)}
                />
              }
            />
            <Route
              path="/services"
              element={
                <ServicesPage
                  services={services}
                  loading={loading}
                  onSelectService={(s) => setSelectedService(s)}
                  onOpenBooking={() => setIsBookingOpen(true)}
                />
              }
            />
            <Route path="/health" element={<HealthPage />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />

        {/* Booking Modal */}
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          selectedService={selectedService}
          services={services}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
