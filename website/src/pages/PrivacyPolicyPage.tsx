import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  Eye, 
  UserCheck, 
  Share2, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  ChevronRight, 
  Printer, 
  ExternalLink,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

export const PrivacyPolicyPage: React.FC = () => {
  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Privacy Policy URL copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 pt-4 sm:pt-8">
      {/* ── Top Breadcrumbs ────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link to="/" className="hover:text-[#2563EB] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold">Privacy Policy</span>
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
              <span>Print Policy</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Hero Banner ────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155] text-white p-6 sm:p-10 shadow-xl border border-slate-800">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-white/10 backdrop-blur-md border border-white/20 text-slate-200">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Data Protection & Privacy Governance</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Reparzo Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              At Reparzo, your privacy and digital personal data security are our utmost priority. This Privacy Policy details our data collection practices, lawful processing standards under the Digital Personal Data Protection (DPDP) Act 2023, and your rights as a customer or service partner.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-medium">
              <span>Last Updated: October 2026</span>
              <span>•</span>
              <span>Governed by Indian Law (DPDP Act 2023)</span>
              <span>•</span>
              <span>Contact: Contact@reparzo.com</span>
            </div>
          </div>

          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none select-none">
            <ShieldCheck className="w-64 h-64 text-white" />
          </div>
        </div>
      </div>

      {/* ── Privacy Policy Content ─────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">

        {/* 1. Overview */}
        <section className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2563EB]">Section 1</span>
              <h2 className="text-lg font-bold text-slate-900">1. Commitment to Privacy</h2>
            </div>
          </div>
          <div className="text-slate-600 text-xs sm:text-sm leading-relaxed space-y-2 pl-0 sm:pl-13">
            <p>
              Reparzo ("we", "our", or "us") operates as an on-demand repair platform connecting customers with local service professionals and businesses. We collect and process personal data strictly to facilitate service discovery, dispatch, coordination, and customer support.
            </p>
            <p>
              We adhere to the principles of purpose limitation, data minimization, transparency, and explicit user consent as required under applicable Indian data-protection law, including the Digital Personal Data Protection Act, 2023 (DPDP).
            </p>
          </div>
        </section>

        {/* 2. Personal Information Collected */}
        <section className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">Section 2</span>
              <h2 className="text-lg font-bold text-slate-900">2. Personal Information We Collect</h2>
            </div>
          </div>
          <div className="text-slate-600 text-xs sm:text-sm leading-relaxed pl-0 sm:pl-13">
            <p className="mb-3">
              We may collect only the information strictly necessary to provide and improve our services:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Identity & Contact Information:</strong> Full name, verified mobile phone number, and optional email address for authentication, OTP verification, and booking receipts.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Doorstep Address & Geo-location:</strong> House/flat number, landmark, area coordinates (GPS), and city solely for dispatching technicians to your doorstep.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Service Request Data:</strong> Appliance brand, vehicle model, symptoms described, audio/photo issue attachments, and selected service packages.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Billing & Payment Records:</strong> Payment mode, transaction IDs, invoice breakdown, and coupon usage. Note: We do NOT store sensitive card CVVs or net banking credentials.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Partner / Vendor Information:</strong> Government ID credentials, business licenses, service skills, bank payout accounts, and live location during active assignments.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* 3. Purpose of Processing */}
        <section className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600">Section 3</span>
              <h2 className="text-lg font-bold text-slate-900">3. Purpose of Data Processing</h2>
            </div>
          </div>
          <div className="text-slate-600 text-xs sm:text-sm leading-relaxed space-y-2 pl-0 sm:pl-13">
            <p>
              Your data is collected and processed for the following specified, lawful purposes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To match and dispatch qualified independent technicians or service partners to your address.</li>
              <li>To communicate order status updates, technician arrival times, and completion verification PINs.</li>
              <li>To generate transparent doorstep digital invoices and track spare parts warranty.</li>
              <li>To provide customer support, dispute resolution, and grievance redressal.</li>
              <li>To detect and prevent fraudulent bookings, abusive behavior, and security breaches.</li>
            </ul>
          </div>
        </section>

        {/* 4. Vendor Data Non-Misuse Clause */}
        <section className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200/80 shadow-2xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800">Section 4</span>
              <h2 className="text-lg font-bold text-slate-900">4. Third-Party Sharing & Strict Vendor Safeguards</h2>
            </div>
          </div>
          <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-2 pl-0 sm:pl-13">
            <p>
              We share your contact and doorstep address details <strong>solely with the designated service partner or technician assigned to fulfill your booking</strong>.
            </p>
            <p className="p-3.5 rounded-2xl bg-white border border-amber-300/80 text-amber-950 font-medium">
              ⚠️ <strong>Strict Non-Misuse Mandate:</strong> In accordance with Section 3 of our Terms & Conditions, service partners and independent technicians are contractually prohibited from retaining, distributing, selling, or utilizing customer information obtained through Reparzo for any unauthorized purpose, private solicitation, or marketing. Any violation results in immediate account termination and legal action.
            </p>
            <p>
              We do NOT sell, rent, or trade your personal information to third-party advertisers or telemarketers.
            </p>
          </div>
        </section>

        {/* 5. User Rights & Consent */}
        <section className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-600">Section 5</span>
              <h2 className="text-lg font-bold text-slate-900">5. Your Data Rights & Consent Withdrawal</h2>
            </div>
          </div>
          <div className="text-slate-600 text-xs sm:text-sm leading-relaxed space-y-2 pl-0 sm:pl-13">
            <p>
              Under the Indian DPDP Act 2023, you hold the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Right to Access:</strong> View all saved profile details, booking histories, and saved addresses directly in your Account dashboard.</li>
              <li><strong>Right to Correction:</strong> Edit your name, phone number, and address at any time via your Profile settings.</li>
              <li><strong>Right to Erasure:</strong> Request the deletion of your account and associated personal data by emailing Contact@reparzo.com.</li>
              <li><strong>Right to Grievance Redressal:</strong> Raise inquiries or complaints with our designated Grievance Officer.</li>
            </ul>
          </div>
        </section>

        {/* 6. Grievance Officer & Contact */}
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-emerald-300 flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300">Section 6</span>
              <h2 className="text-xl font-bold text-white">Grievance Officer & Privacy Contact</h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            In compliance with the Information Technology Act 2000 and the Digital Personal Data Protection Act 2023, the details of our Grievance Officer and Privacy Team are provided below:
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
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Grievance Email</span>
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
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Helpline / Phone</span>
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
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Registered Office</span>
                <span className="text-sm font-bold text-white block">
                  Davangere, Karnataka, India
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <span>Reparzo • All Rights Reserved</span>
            <div className="flex items-center gap-4">
              <Link to="/terms" className="hover:text-white transition-colors underline">Terms & Conditions</Link>
              <Link to="/contact" className="hover:text-white transition-colors underline">Contact Support</Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
