import React, { useState } from 'react';
import { X, CheckCircle2, Calendar, MapPin, Phone, User, Clock, AlertCircle } from 'lucide-react';
import { api, type ServiceItem } from '../lib/api';
import { toast } from 'sonner';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService?: ServiceItem | null;
  services: ServiceItem[];
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  selectedService,
  services,
}) => {
  const [serviceId, setServiceId] = useState(selectedService?.id || (services[0]?.id ?? ''));
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('560001');
  const [issueDescription, setIssueDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [submitting, setSubmitting] = useState(false);

  // Sync state if selectedService changes
  React.useEffect(() => {
    if (selectedService) {
      setServiceId(selectedService.id);
    } else if (services.length > 0 && !serviceId) {
      setServiceId(services[0].id);
    }
  }, [selectedService, services]);

  if (!isOpen) return null;

  const currentService = services.find((s) => s.id === serviceId) || selectedService;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim() || !address.trim()) {
      toast.error('Please fill in all required fields (Name, Phone, Address)');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.createBooking({
        serviceId: serviceId || (services[0]?.id ?? 'srv_ac_repair'),
        customerName,
        customerPhone,
        customerEmail: customerEmail || 'Contact@reparzo.com',
        address,
        pincode,
        city: 'Davangere',
        issueDescription,
        scheduledAt: new Date(scheduledDate).toISOString(),
      });

      toast.success('Booking Successful!', {
        description: response.message || 'A certified technician has been assigned.',
      });

      onClose();
    } catch (err: any) {
      toast.error('Booking failed', {
        description: err.message || 'Unable to connect to edge API server.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 bg-slate-900 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Fast Edge Dispatch</span>
          <h2 className="text-2xl font-bold text-white mt-1">Book Repair Technician</h2>
          <p className="text-sm text-slate-400 mt-1">
            Verified doorstep technicians arriving within 90 minutes.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Select Service */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Select Repair Service
            </label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} — ₹{s.priceEstimated}
                </option>
              ))}
            </select>
          </div>

          {/* Customer Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Charan Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Address & Pincode */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Service Address *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Street / Apartment #, Landmark"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Pincode *</label>
              <input
                type="text"
                required
                placeholder="560001"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Scheduled Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Slot</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Issue notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Symptoms / Issue Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. AC cooling low, unusual noise from outdoor unit..."
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Estimated Price & Submit */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <div>
              <span className="text-[11px] text-slate-400 block">Inspection / Base Estimate</span>
              <span className="text-lg font-bold text-cyan-400">
                ₹{currentService?.priceEstimated ?? 499}
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
            >
              {submitting ? 'Confirming with Edge...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
