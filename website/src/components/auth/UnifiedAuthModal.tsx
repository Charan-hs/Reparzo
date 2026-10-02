import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Phone, Sparkles, ArrowRight, User, Wrench, Shield, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '../../store/useAppStore';
import type { UserRole } from '../../types';

export const UnifiedAuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setAuthModalOpen, 
    authModalInitialRole, 
    loginSimulated 
  } = useAppStore();

  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthModalOpen) {
      setSelectedRole(authModalInitialRole || 'user');
      setStep('phone');
      setPhone('');
      setOtp(['', '', '', '', '', '']);
      setTimer(30);
    }
  }, [isAuthModalOpen, authModalInitialRole]);

  // Resend timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isAuthModalOpen) return null;

  const handleSendOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (phone.replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      setTimer(30);
      toast.success('OTP sent successfully to +91 ' + phone);
    }, 600);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input box
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-box-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSimulateAutoFill = () => {
    setOtp(['4', '2', '9', '8', '1', '0']);
    toast.info('Auto-filled test verification code: 429810');
  };

  const handleVerifyOtp = () => {
    const entered = otp.join('');
    if (entered.length < 6) {
      toast.error('Please enter the full 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const name =
        selectedRole === 'admin'
          ? 'Reparzo Executive Admin'
          : selectedRole === 'partner'
          ? 'Sunil Gowda (Verified Partner)'
          : 'Charan H.S.';

      loginSimulated(selectedRole, `+91 ${phone}`, name);
      toast.success(`Welcome to Reparzo! Logged in as ${selectedRole.toUpperCase()}`);
    }, 700);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const email = `${selectedRole}.reparzo@gmail.com`;
      const name =
        selectedRole === 'admin'
          ? 'Admin Director'
          : selectedRole === 'partner'
          ? 'Anand Kumar (Technician)'
          : 'Charan (Google User)';

      loginSimulated(selectedRole, email, name);
      toast.success(`Google verification successful! Logged in as ${selectedRole.toUpperCase()}`);
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col relative text-slate-900"
        >
          {/* Close button */}
          <button
            onClick={() => setAuthModalOpen(false)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header & Brand */}
          <div className="p-6 pb-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] animate-pulse"></span>
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#2563EB]">
                Unified Reparzo Access
              </span>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              {step === 'phone' ? 'Sign In or Register' : 'Verify Mobile OTP'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select your role to access customized portal features
            </p>

            {/* 3-Role Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 mt-4">
              <button
                type="button"
                onClick={() => setSelectedRole('user')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedRole === 'user'
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Customer</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('partner')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedRole === 'partner'
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Partner</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-[#E32402] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-5 bg-white">
            {/* Role Purpose Callout */}
            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedRole === 'user' &&
                  'Book verified doorstep technicians in 60-90 mins with transparent pricing and 30-day warranty.'}
                {selectedRole === 'partner' &&
                  'Accept local repair jobs in your neighborhood, track daily earnings, and get direct bank payouts.'}
                {selectedRole === 'admin' &&
                  'Manage categories, services pricing catalog, view live orders, and review partner applications.'}
              </p>
            </div>

            {step === 'phone' ? (
              <>
                {/* Google Login Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xs cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google One-Tap</span>
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="h-px bg-slate-200 flex-1"></div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    OR PHONE OTP
                  </span>
                  <div className="h-px bg-slate-200 flex-1"></div>
                </div>

                {/* Mobile Input Form */}
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Enter Mobile Number
                    </label>
                    <div className="flex items-center rounded-2xl bg-slate-50 border border-slate-200 focus-within:bg-white focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/20 overflow-hidden transition-all">
                      <div className="px-3.5 py-3.5 bg-slate-100 border-r border-slate-200 text-slate-800 font-mono font-bold text-sm flex items-center gap-1.5">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="98765 43210"
                        className="flex-1 px-4 py-3.5 bg-transparent text-slate-900 placeholder-slate-400 font-mono text-base outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || phone.length < 10}
                    className="w-full py-3.5 rounded-2xl bg-[#2563EB] hover:bg-[#1d4ed8] disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <span>{isLoading ? 'Sending Code...' : 'Get 6-Digit OTP'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              /* OTP Verification Step */
              <div className="space-y-5">
                <div className="text-center">
                  <p className="text-xs text-slate-500">
                    Enter the 6-digit verification code sent to
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      +91 {phone}
                    </span>
                    <button
                      onClick={() => setStep('phone')}
                      className="text-xs text-[#2563EB] hover:underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                </div>

                {/* 6 Digit Input Boxes */}
                <div className="flex justify-between gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-box-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !digit && idx > 0) {
                          document.getElementById(`otp-box-${idx - 1}`)?.focus();
                        }
                      }}
                      className="w-12 h-14 rounded-2xl bg-slate-50 border border-slate-200 text-center font-mono text-xl font-bold text-slate-900 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none transition-all"
                    />
                  ))}
                </div>

                {/* Quick Auto-Fill Helper for smooth testing */}
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={handleSimulateAutoFill}
                    className="text-[#2563EB] hover:text-[#1d4ed8] font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Auto-fill OTP (Demo)</span>
                  </button>

                  <span className="text-slate-500">
                    {timer > 0 ? (
                      `Resend code in ${timer}s`
                    ) : (
                      <button
                        onClick={handleSendOtp}
                        className="text-[#2563EB] font-bold hover:underline cursor-pointer"
                      >
                        Resend OTP
                      </button>
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isLoading || otp.join('').length < 6}
                  className="w-full py-3.5 rounded-2xl bg-[#2563EB] hover:bg-[#1d4ed8] disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>{isLoading ? 'Verifying...' : `Login as ${selectedRole.toUpperCase()}`}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Footer Guarantee */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-center flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-bit encrypted secure session powered by Cloudflare Workers</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
