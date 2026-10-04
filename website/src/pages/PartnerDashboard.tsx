import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, 
  MapPin, 
  Phone, 
  Navigation, 
  CheckCircle2, 
  DollarSign, 
  Clock, 
  Power, 
  ShieldCheck, 
  Star,
  Layers,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  User as UserIcon,
  FileText,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '../store/useAppStore';

interface PartnerJob {
  id: string;
  customerName: string;
  customerPhone?: string;
  address: string;
  distanceKm: number;
  serviceTitle: string;
  category: string;
  payoutAmount: number;
  scheduledTime: string;
  status: 'available' | 'accepted' | 'completed';
}

export const PartnerDashboard: React.FC = () => {
  const { user, partnerIsOnline, setPartnerIsOnline, setAuthModalOpen } = useAppStore();

  const [jobs, setJobs] = useState<PartnerJob[]>([
    {
      id: 'JOB-9021',
      customerName: 'Kavitha R.',
      customerPhone: '+91 6362000263',
      address: 'House #22, 17th Cross, HSR Sector 2, Bengaluru',
      distanceKm: 1.4,
      serviceTitle: 'AC Foam Jet Deep Service & Coil Check',
      category: 'AC Services',
      payoutAmount: 499,
      scheduledTime: 'Immediate (Arrive by 35 mins)',
      status: 'available',
    },
    {
      id: 'JOB-8812',
      customerName: 'Vinay Kumar',
      customerPhone: '+91 6362000263',
      address: 'Apt 304, Palm Meadows, Koramangala 4th Block',
      distanceKm: 2.8,
      serviceTitle: 'Doorstep Bike General Service & Brake Tuning',
      category: 'Bike Service',
      payoutAmount: 349,
      scheduledTime: 'Today, 04:30 PM',
      status: 'available',
    },
    {
      id: 'JOB-7734',
      customerName: 'Arun Prasad',
      customerPhone: '+91 6362000263',
      address: 'Plot 18, 5th Main, BDA Layout, Indiranagar',
      distanceKm: 3.9,
      serviceTitle: 'MCB Short Circuit & Tripping Diagnosis',
      category: 'Electrical Services',
      payoutAmount: 249,
      scheduledTime: 'Today, 06:00 PM',
      status: 'available',
    },
  ]);

  const [activeJob, setActiveJob] = useState<PartnerJob | null>(null);
  const [completionOtp, setCompletionOtp] = useState('');
  const [earningsToday, setEarningsToday] = useState(1420);

  const handleAcceptJob = (job: PartnerJob) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, status: 'accepted' } : j))
    );
    setActiveJob({ ...job, status: 'accepted' });
    toast.success(`Job ${job.id} Accepted! Navigation route generated.`);
  };

  const handleCompleteJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (completionOtp.length !== 4) {
      toast.error('Ask customer for their 4-digit service completion PIN');
      return;
    }

    if (activeJob) {
      setEarningsToday((prev) => prev + activeJob.payoutAmount);
      setJobs((prev) => prev.filter((j) => j.id !== activeJob.id));
      setActiveJob(null);
      setCompletionOtp('');
      toast.success('Job marked as Completed! Payout credited to your Reparzo wallet.');
    }
  };

  // If user is not partner, show friendly partner gate
  if (user?.role !== 'partner') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 text-slate-900">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200 text-center shadow-xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 border border-amber-200 flex items-center justify-center mx-auto shadow-md">
            <Wrench className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-slate-900">Partner Access Required</h1>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              This dashboard is for verified Reparzo technicians to accept nearby repair jobs, start GPS navigation, and track daily payouts.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 text-left text-xs text-slate-700">
            <span className="font-bold text-slate-900 block mb-0.5">Demo Partner Account:</span>
            <span>Mobile: <strong className="text-amber-700 font-mono">98765 43210</strong> (Auto-detected as Partner)</span>
          </div>

          <button
            onClick={() => setAuthModalOpen(true, 'partner')}
            className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
          >
            Open Unified Login Screen ➔
          </button>

          <a
            href="/"
            className="inline-block text-xs text-slate-400 hover:text-slate-700 transition-colors"
          >
            ← Return to Customer Storefront
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Storefront link */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-bold text-amber-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Active Partner Fleet Session
          </span>
          <a href="/" className="hover:text-[#2563EB] font-bold flex items-center gap-1">
            <span>View Customer Storefront</span>
            <span>→</span>
          </a>
        </div>
        
        {/* Top Partner Profile & Status Toggle */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt="Partner"
              className="w-14 h-14 rounded-2xl object-cover border-2 border-[#2563EB]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  {user?.name || 'Sunil Gowda'}
                </h1>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified Partner
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span className="text-amber-500 font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500" /> 4.92 ★ (380+ Jobs)
                </span>
                <span>•</span>
                <span>Master Technician</span>
              </p>
            </div>
          </div>

          {/* Online Status Toggle */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              onClick={() => {
                setPartnerIsOnline(!partnerIsOnline);
                toast.info(partnerIsOnline ? 'Switched to Offline' : 'You are now Online! Receiving jobs.');
              }}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 ${
                partnerIsOnline
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{partnerIsOnline ? 'Status: ONLINE (Receiving)' : 'Status: OFFLINE'}</span>
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center">
            <div className="text-2xl font-mono font-bold text-emerald-600">
              ₹{earningsToday}
            </div>
            <div className="text-xs text-slate-500 mt-1">Earnings Today</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center">
            <div className="text-2xl font-mono font-bold text-[#2563EB]">4</div>
            <div className="text-xs text-slate-500 mt-1">Jobs Completed</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center">
            <div className="text-2xl font-mono font-bold text-amber-500">100%</div>
            <div className="text-xs text-slate-500 mt-1">Acceptance Rate</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center">
            <div className="text-2xl font-mono font-bold text-purple-600">₹38,400</div>
            <div className="text-xs text-slate-500 mt-1">Monthly Payout</div>
          </div>
        </div>

        {/* Active In-Progress Job Section (if accepted) */}
        {activeJob && (
          <div className="p-6 rounded-3xl bg-blue-50/60 border-2 border-[#2563EB] shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#2563EB] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-ping" />
                Active Doorstep Job in Progress
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Payout: ₹{activeJob.payoutAmount}
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">{activeJob.serviceTitle}</h3>
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-2">
                <UserIcon className="w-3.5 h-3.5 text-[#2563EB]" /> Customer: <strong>{activeJob.customerName}</strong>
              </p>
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> {activeJob.address}
              </p>
            </div>

            {/* Navigation & Call Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(activeJob.address)}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-[#2563EB] text-white text-xs font-bold flex items-center gap-2 shadow-xs hover:bg-[#1d4ed8]"
              >
                <Navigation className="w-4 h-4" /> Start GPS Navigation
              </a>
              <a
                href={`tel:${activeJob.customerPhone || '+916362000263'}`}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-2 hover:bg-slate-200"
              >
                <Phone className="w-4 h-4" /> Call Customer
              </a>
            </div>

            {/* OTP Verification & Complete */}
            <form onSubmit={handleCompleteJob} className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full">
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Enter 4-digit Customer Completion PIN (e.g. 1234)"
                  value={completionOtp}
                  onChange={(e) => setCompletionOtp(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono outline-none focus:border-[#2563EB]"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Verify PIN & Mark Done
              </button>
            </form>
          </div>
        )}

        {/* Incoming Job Requests Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2563EB]" /> Nearby Repair Orders ({jobs.filter((j) => j.status === 'available').length})
            </h3>
            <span className="text-xs text-slate-500">Auto-refreshing live</span>
          </div>

          {!partnerIsOnline ? (
            <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center shadow-xs">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <h4 className="text-base font-bold text-slate-900">You are currently Offline</h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Toggle your status to ONLINE above to start receiving repair requests in your area.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {jobs
                .filter((j) => j.status === 'available')
                .map((job) => (
                  <div
                    key={job.id}
                    className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-blue-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:shadow-md"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] border border-blue-200">
                          {job.category}
                        </span>
                        <span className="text-xs text-emerald-600 font-bold">
                          ⚡ {job.distanceKm} km away
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 truncate">{job.serviceTitle}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.address}
                      </p>
                      <p className="text-[11px] text-slate-400">{job.scheduledTime}</p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 flex-shrink-0">
                      <span className="text-xl font-mono font-black text-emerald-600">
                        ₹{job.payoutAmount}
                      </span>
                      <button
                        onClick={() => handleAcceptJob(job)}
                        className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                      >
                        Accept Job ➔
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* ── Partner Terms & Code of Conduct Notice ───────────────── */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-md space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
                  Section 3: Vendor & Service Partner Terms
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">Partner Quality, Safety & Non-Misuse Mandate</h4>
              <p className="text-xs text-slate-400 max-w-2xl">
                Partners must communicate pricing and additional part charges clearly before carrying out work, maintain professional conduct, and never use customer data for unauthorized purposes.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
              <Link
                to="/terms"
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 border border-white/10"
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>View Partner Terms</span>
              </Link>
              <a
                href="mailto:Contact@reparzo.com"
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 border border-white/10"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>Partner Support</span>
              </a>
            </div>
          </div>
          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
            <span>Direct Partner Helpline: +91 6362000263</span>
            <span>Support: Contact@reparzo.com • Davangere, Karnataka</span>
          </div>
        </div>
      </div>
    </div>
  );
};
