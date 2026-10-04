import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  HelpCircle, 
  ChevronRight, 
  Sparkles,
  CheckCircle2,
  FileText,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('booking_support');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      toast.error('Please fill in your name, phone number, and message');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success('Your message has been sent to the Reparzo Support Desk!', {
        description: 'Our team will contact you at +91 ' + phone + ' shortly.',
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 pt-4 sm:pt-8">
      {/* ── Breadcrumbs ────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/" className="hover:text-[#2563EB] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">Contact & Support</span>
        </div>
      </div>

      {/* ── Hero Banner ────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0E1B4D] via-[#1E3A8A] to-[#2563EB] text-white p-6 sm:p-10 shadow-xl border border-blue-900/40">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-white/10 backdrop-blur-md border border-white/20 text-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Dedicated Customer & Partner Assistance</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              We're Here to Help
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Have a question about an ongoing booking, need technician assistance, want to join as a Service Partner, or have a grievance? Connect with our support team directly.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] text-blue-200/90 font-medium">
              <span>Average Response: Under 15 Minutes</span>
              <span>•</span>
              <span>Direct Phone & WhatsApp</span>
              <span>•</span>
              <span>Davangere, Karnataka</span>
            </div>
          </div>

          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none select-none">
            <Phone className="w-64 h-64 text-white" />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        
        {/* ── Left 1 Col: Official Contact Cards ───────────────────── */}
        <div className="md:col-span-1 space-y-4">
          
          {/* Email */}
          <a
            href="mailto:Contact@reparzo.com"
            className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-blue-400 transition-all flex items-start gap-4 shadow-2xs group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Direct Email</span>
              <span className="text-sm font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors truncate block">
                Contact@reparzo.com
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">Booking, partner & legal inquiries</span>
            </div>
          </a>

          {/* Phone Helpline */}
          <a
            href="tel:+916362000263"
            className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-400 transition-all flex items-start gap-4 shadow-2xs group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Phone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Phone Helpline</span>
              <span className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate block font-mono">
                +91 6362000263
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">Direct technician & order assistance</span>
            </div>
          </a>

          {/* WhatsApp Direct */}
          <a
            href="https://wa.me/916362000263?text=Hi%20Reparzo,%20I%20need%20assistance%20with%20a%20service"
            target="_blank"
            rel="noreferrer"
            className="p-5 rounded-3xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-start gap-4 shadow-xs group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-white/20 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-100 block">Instant Chat</span>
              <span className="text-base font-bold text-white block">
                WhatsApp Support
              </span>
              <span className="text-[11px] text-emerald-100 block mt-0.5">Quick photo & location sharing</span>
            </div>
          </a>

          {/* Registered Office */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Headquarters</span>
              <span className="text-sm font-bold text-slate-900 block">
                Davangere, Karnataka, India
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">Reparzo Operations Hub</span>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Dispatch Hours</span>
              <span className="text-sm font-bold text-slate-900 block">
                7:00 AM – 11:00 PM
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">Monday to Sunday (7 Days/Week)</span>
            </div>
          </div>

        </div>

        {/* ── Right 2 Cols: Interactive Message / Callback Form ────── */}
        <div className="md:col-span-2">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Send an Inquiry or Request a Callback</h3>
              <p className="text-xs text-slate-500 mt-1">
                Fill in your details and our team will get back to you with technician scheduling or support within 15–30 minutes.
              </p>
            </div>

            {isSubmitted ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Message Received!</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Thank you for reaching out. A Reparzo support coordinator has been notified and will call you at +91 {phone} or email you at {email || 'your registered contact'}.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setMessage('');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Mobile Phone Number *
                    </label>
                    <div className="flex items-center rounded-xl bg-slate-50 border border-slate-200 overflow-hidden focus-within:bg-white focus-within:border-[#2563EB]">
                      <span className="px-3 py-2.5 bg-slate-100 text-slate-600 font-mono text-xs border-r border-slate-200">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="6362000263"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 px-3.5 py-2.5 bg-transparent text-slate-900 font-mono text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. rahul@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Inquiry Category *
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-[#2563EB]"
                    >
                      <option value="booking_support">Customer Booking / Technician Dispatch</option>
                      <option value="partner_onboarding">Become a Service Partner / Technician</option>
                      <option value="billing_refund">Billing, Invoice or Refund Query</option>
                      <option value="grievance_legal">Grievance Redressal / Legal Notice</option>
                      <option value="general_feedback">General Feedback & Suggestions</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Your Message / Issue Description *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your service request, appliance issue, or inquiry in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-[#2563EB] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Sending Message...' : 'Submit Inquiry'}</span>
                </button>
              </form>
            )}

            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Protected under Reparzo Privacy Policy & Indian DPDP Act</span>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/terms" className="hover:text-[#2563EB] font-bold">Terms & Conditions</Link>
                <span>•</span>
                <Link to="/privacy" className="hover:text-[#2563EB] font-bold">Privacy Policy</Link>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── FAQ Section ────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Frequently Asked Questions</h3>
              <p className="text-xs text-slate-500">Quick answers about our terms, charges, and bookings.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <h4 className="text-xs font-bold text-slate-900">How are service charges determined?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                As per Section 2 of our Terms, service charges may vary depending on the service category, inspection findings, replacement parts, and labor required. All prices are confirmed with you before physical work begins.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <h4 className="text-xs font-bold text-slate-900">How does technician dispatch work?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                As per Section 4 of our Terms, a booking submitted through Reparzo is confirmed upon acceptance by an available verified service partner in your locality, typically arriving within 18–45 minutes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <h4 className="text-xs font-bold text-slate-900">What is Reparzo's intermediary role?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                As per Section 6, Reparzo acts as a technology platform connecting customers with independent service professionals. We coordinate dispatch, communication, and digital invoicing.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <h4 className="text-xs font-bold text-slate-900">How do I join as a Service Partner?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Licensed technicians and local businesses can apply directly via our Partner Portal or email Contact@reparzo.com with credentials. Partners must comply with our Vendor Terms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
