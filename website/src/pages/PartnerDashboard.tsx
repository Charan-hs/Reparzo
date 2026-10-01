import React, { useState } from 'react';
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
  User as UserIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '../store/useAppStore';

interface PartnerJob {
  id: string;
  customerName: string;
  address: string;
  distanceKm: number;
  serviceTitle: string;
  category: string;
  payoutAmount: number;
  scheduledTime: string;
  status: 'available' | 'accepted' | 'completed';
}

export const PartnerDashboard: React.FC = () => {
  const { user, partnerIsOnline, setPartnerIsOnline } = useAppStore();

  const [jobs, setJobs] = useState<PartnerJob[]>([
    {
      id: 'JOB-9021',
      customerName: 'Kavitha R.',
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

  return (
    <div className="min-h-screen bg-[#080D1A] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Partner Profile & Status Toggle */}
        <div className="p-6 rounded-3xl bg-[#0E1B4D] border border-slate-700/80 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt="Partner"
              className="w-14 h-14 rounded-2xl object-cover border-2 border-[#4770DB]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">
                  {user?.name || 'Sunil Gowda'}
                </h1>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Verified Partner
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> 4.92 ★ (380+ Jobs)
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
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
                partnerIsOnline
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{partnerIsOnline ? 'Status: ONLINE (Receiving)' : 'Status: OFFLINE'}</span>
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-2xl font-mono font-bold text-emerald-400">
              ₹{earningsToday}
            </div>
            <div className="text-xs text-slate-400 mt-1">Earnings Today</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-2xl font-mono font-bold text-[#4770DB]">4</div>
            <div className="text-xs text-slate-400 mt-1">Jobs Completed</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-2xl font-mono font-bold text-amber-400">100%</div>
            <div className="text-xs text-slate-400 mt-1">Acceptance Rate</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-2xl font-mono font-bold text-purple-400">₹38,400</div>
            <div className="text-xs text-slate-400 mt-1">Monthly Payout</div>
          </div>
        </div>

        {/* Active In-Progress Job Section (if accepted) */}
        {activeJob && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0E1B4D] via-[#162766] to-[#0E1B4D] border-2 border-[#4770DB] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Active Doorstep Job in Progress
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Payout: ₹{activeJob.payoutAmount}
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">{activeJob.serviceTitle}</h3>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <UserIcon className="w-3.5 h-3.5 text-[#4770DB]" /> Customer: <strong>{activeJob.customerName}</strong>
              </p>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-rose-400" /> {activeJob.address}
              </p>
            </div>

            {/* Navigation & Call Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(activeJob.address)}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-[#4770DB] text-white text-xs font-bold flex items-center gap-2 shadow-md hover:bg-[#385cc4]"
              >
                <Navigation className="w-4 h-4" /> Start GPS Navigation
              </a>
              <a
                href="tel:9845012345"
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold flex items-center gap-2 hover:bg-slate-700"
              >
                <Phone className="w-4 h-4" /> Call Customer
              </a>
            </div>

            {/* OTP Verification & Complete */}
            <form onSubmit={handleCompleteJob} className="pt-4 border-t border-slate-700/80 flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full">
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Enter 4-digit Customer Completion PIN (e.g. 1234)"
                  value={completionOtp}
                  onChange={(e) => setCompletionOtp(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono outline-none focus:border-[#4770DB]"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg"
              >
                Verify PIN & Mark Done
              </button>
            </form>
          </div>
        )}

        {/* Incoming Job Requests Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#4770DB]" /> Nearby Repair Orders ({jobs.filter((j) => j.status === 'available').length})
            </h3>
            <span className="text-xs text-slate-400">Auto-refreshing live</span>
          </div>

          {!partnerIsOnline ? (
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <h4 className="text-base font-bold text-white">You are currently Offline</h4>
              <p className="text-xs text-slate-400 mt-1 mb-4">
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
                    className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-[#4770DB]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#4770DB]/20 text-[#4770DB]">
                          {job.category}
                        </span>
                        <span className="text-xs text-emerald-400 font-bold">
                          ⚡ {job.distanceKm} km away
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white truncate">{job.serviceTitle}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" /> {job.address}
                      </p>
                      <p className="text-[11px] text-slate-500">{job.scheduledTime}</p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 flex-shrink-0">
                      <span className="text-xl font-mono font-black text-emerald-400">
                        ₹{job.payoutAmount}
                      </span>
                      <button
                        onClick={() => handleAcceptJob(job)}
                        className="px-5 py-2.5 rounded-xl bg-[#4770DB] hover:bg-[#385cc4] text-white text-xs font-bold shadow-md active:scale-95 transition-all"
                      >
                        Accept Job ➔
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
