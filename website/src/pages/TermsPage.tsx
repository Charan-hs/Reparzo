import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  FileText, 
  Users, 
  Wrench, 
  CalendarCheck, 
  CreditCard, 
  Cpu, 
  Star, 
  Lock, 
  AlertTriangle, 
  Scale, 
  RefreshCw, 
  Mail, 
  Phone, 
  MapPin, 
  ChevronRight, 
  Printer, 
  ExternalLink,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';

export const TermsPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'customer' | 'partner' | 'payments'>('all');

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Terms & Conditions URL copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 pt-4 sm:pt-8">
      {/* ── Top Breadcrumbs ────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link to="/" className="hover:text-[#2563EB] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold">Terms & Conditions</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Share Link</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Terms</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Hero Banner ────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0E1B4D] via-[#1E3A8A] to-[#2563EB] text-white p-6 sm:p-10 shadow-xl border border-blue-900/40">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-white/10 backdrop-blur-md border border-white/20 text-blue-200">
              <Shield className="w-3.5 h-3.5 text-blue-300" />
              <span>Platform Legal & Governance Agreement</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Terms & Conditions
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              These Terms & Conditions constitute a legally binding agreement between you (as a Customer or Service Partner / Vendor) and Reparzo. Please review them carefully before booking or offering repair services on our platform.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] text-blue-200/90 font-medium">
              <span>Effective Date: October 2026</span>
              <span>•</span>
              <span>Jurisdiction: Karnataka, India</span>
              <span>•</span>
              <span>Covers Customers & Service Partners</span>
            </div>
          </div>

          {/* Decorative watermark */}
          <div className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none select-none">
            <Scale className="w-72 h-72 text-white" />
          </div>
        </div>
      </div>

      {/* ── Category Filter Pills ──────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Sections (1–12)
            </button>
            <button
              onClick={() => setActiveFilter('customer')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'customer'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Customer Terms
            </button>
            <button
              onClick={() => setActiveFilter('partner')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'partner'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Service Partner / Vendor Terms
            </button>
            <button
              onClick={() => setActiveFilter('payments')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'payments'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Bookings, Payments & Role
            </button>
          </div>

          <div className="text-xs text-slate-500">
            Have questions? <Link to="/contact" className="text-[#2563EB] font-bold hover:underline">Contact Support</Link>
          </div>
        </div>
      </div>

      {/* ── Terms Document Sections ────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">

        {/* 1. About Reparzo */}
        {(activeFilter === 'all' || activeFilter === 'payments') && (
          <section id="about" className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2563EB]">Section 1</span>
                <h2 className="text-lg font-bold text-slate-900">About Reparzo</h2>
              </div>
            </div>
            <div className="text-slate-600 text-xs sm:text-sm leading-relaxed space-y-2 pl-0 sm:pl-13">
              <p>
                Reparzo is an on-demand technology platform that connects customers with local service professionals and businesses. Reparzo facilitates the discovery, communication, booking, dispatch, and coordination of doorstep repair and maintenance services across home and mobility categories.
              </p>
              <p>
                By accessing, browsing, registering on, or utilizing the Reparzo website, mobile applications, or associated edge APIs, you agree to comply with and be bound by these Terms & Conditions.
              </p>
            </div>
          </section>
        )}

        {/* 2. Customer Terms */}
        {(activeFilter === 'all' || activeFilter === 'customer') && (
          <section id="customer-terms" className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">Section 2</span>
                <h2 className="text-lg font-bold text-slate-900">Customer Terms</h2>
              </div>
            </div>
            <div className="text-slate-600 text-xs sm:text-sm leading-relaxed pl-0 sm:pl-13">
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Accurate Information:</strong> Customers must provide accurate, up-to-date contact information, doorstep delivery/service address, and specific descriptions of repair requirements.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Prior Confirmation:</strong> Customers are responsible for confirming the service requirements, scope of work, inspection findings, spare parts cost, and final price with the service partner before physical work commences.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Variable Charges:</strong> Service charges and final billing amounts may vary depending on the nature of the issue, location/geography, materials or replacement parts required, and labor hours spent.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Timely Payments:</strong> Customers agree to make payments promptly upon service completion or as per agreed digital payment terms displayed on the platform.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Cancellations & Rescheduling:</strong> Any cancellation, schedule alteration, or timing modification should be communicated through the platform as early as possible before technician dispatch.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Prohibition of Misuse:</strong> Customers must not provide fraudulent contact details, engage in disrespectful conduct toward service technicians, or misuse the platform in any unauthorized manner.</span>
                </li>
              </ul>
            </div>
          </section>
        )}

        {/* 3. Vendor / Service Partner Terms */}
        {(activeFilter === 'all' || activeFilter === 'partner') && (
          <section id="vendor-terms" className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600">Section 3</span>
                <h2 className="text-lg font-bold text-slate-900">Vendor / Service Partner Terms</h2>
              </div>
            </div>
            <div className="text-slate-600 text-xs sm:text-sm leading-relaxed pl-0 sm:pl-13">
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Accurate Business & Profile Details:</strong> Service partners and independent vendors must provide accurate identity credentials, business registration, contact coordinates, operating locations, and catalog capabilities.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Quality, Safety & Legality:</strong> Vendors are solely responsible for the technical quality, occupational safety, workmanship standards, and legality of the services performed and spare parts installed.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Clear Price Disclosures:</strong> Vendors must communicate initial inspection findings, required parts costs, and all additional charges explicitly to customers and obtain customer approval before carrying out any additional work.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Professional Conduct:</strong> Service partners must maintain courteous, professional, and ethical conduct with customers at all times during doorstep appointments.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Profile Review & Moderation:</strong> Reparzo reserves the right to review, background-verify, audit ratings, suspend, or delist vendor profiles where necessary to ensure customer safety and platform integrity.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Data Protection & Non-Misuse:</strong> Vendors and technicians must NEVER use customer names, phone numbers, or addresses obtained through Reparzo for unsolicited communication, private solicitation, harassment, or unauthorized secondary purposes.</span>
                </li>
              </ul>
            </div>
          </section>
        )}

        {/* 4. Service Bookings */}
        {(activeFilter === 'all' || activeFilter === 'payments') && (
          <section id="bookings" className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600">Section 4</span>
                <h2 className="text-lg font-bold text-slate-900">Service Bookings & Confirmations</h2>
              </div>
            </div>
            <div className="text-slate-600 text-xs sm:text-sm leading-relaxed space-y-2 pl-0 sm:pl-13">
              <p>
                A booking request or service enquiry submitted through the Reparzo website or application does not automatically guarantee that a service will be completed unless and until it is officially accepted and confirmed by the relevant independent service provider.
              </p>
              <p>
                Service fulfillment is subject to technician availability, accurate customer location details, and mutual agreement between the customer and service partner regarding timing and scope.
              </p>
            </div>
          </section>
        )}

        {/* 5. Payments & Refunds */}
        {(activeFilter === 'all' || activeFilter === 'payments') && (
          <section id="payments" className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-600">Section 5</span>
                <h2 className="text-lg font-bold text-slate-900">Payments & Refunds</h2>
              </div>
            </div>
            <div className="text-slate-600 text-xs sm:text-sm leading-relaxed space-y-2 pl-0 sm:pl-13">
              <p>
                Any service payment, advance deposit, inspection fee, cancellation charge, or refund will be strictly subject to the applicable service provider's terms and the payment terms disclosed to the customer at the time of booking.
              </p>
              <p>
                Where eligible, refunds are processed back to the original payment method or credited to the customer account within 5–7 banking days. Disputed charges should be reported to Reparzo Support (Contact@reparzo.com) with supporting booking receipts.
              </p>
            </div>
          </section>
        )}

        {/* 6. Platform Role */}
        {(activeFilter === 'all' || activeFilter === 'payments') && (
          <section id="platform-role" className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-600">Section 6</span>
                <h2 className="text-lg font-bold text-slate-900">Platform Role & Intermediary Status</h2>
              </div>
            </div>
            <div className="text-slate-600 text-xs sm:text-sm leading-relaxed space-y-2 pl-0 sm:pl-13">
              <p>
                Reparzo acts as an intermediary technology platform connecting customers seeking repair solutions with third-party service providers. Unless expressly stated otherwise in writing, Reparzo is not the direct employer or provider of physical services performed by independent vendors.
              </p>
              <p>
                Reparzo provides digital discovery, scheduling tools, digital invoicing facilitation, and customer support coordination as an intermediary under applicable provisions of the Information Technology Act, 2000 and Consumer Protection (E-Commerce) Rules, 2020.
              </p>
            </div>
          </section>
        )}

        {/* 7. Reviews & Ratings */}
        {activeFilter === 'all' && (
          <section id="reviews" className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600">Section 7</span>
                <h2 className="text-lg font-bold text-slate-900">Reviews & Ratings</h2>
              </div>
            </div>
            <div className="text-slate-600 text-xs sm:text-sm leading-relaxed space-y-2 pl-0 sm:pl-13">
              <p>
                Customers are encouraged to leave genuine, constructive reviews and star ratings reflecting their actual service experience. Honest feedback helps maintain top service standards across the Reparzo network.
              </p>
              <p>
                Reparzo reserves the right to review and remove ratings that contain fraudulent claims, abusive or profane language, competitor defamation, extortion attempts, or violations of applicable laws.
              </p>
            </div>
          </section>
        )}

        {/* 8. Personal Information & Privacy */}
        {activeFilter === 'all' && (
          <section id="privacy" className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-600">Section 8</span>
                <h2 className="text-lg font-bold text-slate-900">Personal Information & Privacy</h2>
              </div>
            </div>
            <div className="text-slate-600 text-xs sm:text-sm leading-relaxed space-y-2 pl-0 sm:pl-13">
              <p>
                Reparzo may collect and process information such as your name, telephone number, email address, physical service address, geo-location data, and service request history to provide, coordinate, and improve its repair platform.
              </p>
              <p>
                All personal data is collected and processed for specified, lawful purposes with appropriate notice and user consent where required under applicable Indian data-protection regulations, including the Digital Personal Data Protection (DPDP) Act, 2023. For complete details on data handling and user rights, please review our comprehensive <Link to="/privacy" className="text-[#2563EB] font-bold hover:underline">Privacy Policy</Link>.
              </p>
            </div>
          </section>
        )}

        {/* 9. Account Suspension */}
        {activeFilter === 'all' && (
          <section id="suspension" className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600">Section 9</span>
                <h2 className="text-lg font-bold text-slate-900">Account Suspension & Termination</h2>
              </div>
            </div>
            <div className="text-slate-600 text-xs sm:text-sm leading-relaxed space-y-2 pl-0 sm:pl-13">
              <p>
                Reparzo reserves the right to temporarily suspend, permanently restrict, or terminate any user or service partner account immediately upon finding evidence of fraud, unauthorized platform misuse, submission of false or misleading credentials, abusive or threatening behavior, non-compliance with these terms, or violation of applicable regulatory policies.
              </p>
            </div>
          </section>
        )}

        {/* 10. Limitation of Liability */}
        {activeFilter === 'all' && (
          <section id="liability" className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Section 10</span>
                <h2 className="text-lg font-bold text-slate-900">Limitation of Liability</h2>
              </div>
            </div>
            <div className="text-slate-600 text-xs sm:text-sm leading-relaxed space-y-2 pl-0 sm:pl-13">
              <p>
                To the fullest extent permitted by applicable Indian law, Reparzo is not responsible or liable for direct, indirect, incidental, or consequential losses, damages, or disputes arising from the independent acts, omissions, workmanship, delays, property damage, or conduct of third-party service providers.
              </p>
              <p>
                Reparzo facilitates dispute resolution and customer assistance in good faith to maintain network quality, but does not provide an absolute guarantee of third-party physical workmanship.
              </p>
            </div>
          </section>
        )}

        {/* 11. Changes to Terms */}
        {activeFilter === 'all' && (
          <section id="changes" className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2563EB]">Section 11</span>
                <h2 className="text-lg font-bold text-slate-900">Changes to Terms</h2>
              </div>
            </div>
            <div className="text-slate-600 text-xs sm:text-sm leading-relaxed space-y-2 pl-0 sm:pl-13">
              <p>
                Reparzo may update, revise, or amend these Terms & Conditions from time to time to reflect operational, technological, or regulatory developments.
              </p>
              <p>
                Updated terms will be posted prominently on the website and mobile applications with an updated effective date. Continued usage of the Reparzo platform following any update signifies your acceptance of the revised Terms.
              </p>
            </div>
          </section>
        )}

        {/* 12. Contact */}
        <section id="contact" className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-blue-300 flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-300">Section 12</span>
              <h2 className="text-xl font-bold text-white">Official Contact Information</h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            For inquiries regarding these Terms & Conditions, legal notices, service grievances, or vendor onboarding questions, please contact the Reparzo Grievance Officer and Platform Team:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <a 
              href="mailto:Contact@reparzo.com" 
              className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-start gap-3 group"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Email Us</span>
                <span className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors truncate block">
                  Contact@reparzo.com
                </span>
              </div>
            </a>

            <a 
              href="tel:+916362000263" 
              className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-start gap-3 group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Direct Helpline</span>
                <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors truncate block font-mono">
                  +91 6362000263
                </span>
              </div>
            </a>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Headquarters</span>
                <span className="text-sm font-bold text-white block">
                  Davangere, Karnataka, India
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <span>Reparzo • All Rights Reserved</span>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-white transition-colors underline">Privacy Policy</Link>
              <Link to="/contact" className="hover:text-white transition-colors underline">Contact Support</Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
