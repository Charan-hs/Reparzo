import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  User, 
  Wrench, 
  Shield, 
  CheckCircle2, 
  Zap,
  ArrowUpRight,
  KeyRound
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '../../store/useAppStore';
import { resolveUserByIdentifier, PRESET_ACCOUNTS, RecognizedAccount } from '../../lib/authConfig';

export const UnifiedAuthModal: React.FC = () => {
  const navigate = useNavigate();
  const { 
    isAuthModalOpen, 
    setAuthModalOpen, 
    authModalInitialRole,
    loginSimulated 
  } = useAppStore();

  const [identifier, setIdentifier] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize or prefill if modal opened with specific context
  useEffect(() => {
    if (isAuthModalOpen) {
      setStep('phone');
      setOtp(['', '', '', '', '', '']);
      setTimer(30);

      // If opened with initial role hint (e.g. "Become a partner" link), prefill that demo account
      if (authModalInitialRole === 'admin') {
        setIdentifier(PRESET_ACCOUNTS.admin.phone);
      } else if (authModalInitialRole === 'partner') {
        setIdentifier(PRESET_ACCOUNTS.partner.phone);
      } else {
        setIdentifier('');
      }
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

  // Auto-detect role and user identity in real-time from the single input
  const detectedUser: RecognizedAccount = resolveUserByIdentifier(identifier);
  const isInputReady = identifier.replace(/\D/g, '').length >= 10 || identifier.includes('@');

  const executeLogin = (userAccount: RecognizedAccount) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      loginSimulated(userAccount.role, userAccount.phone, userAccount.name);

      toast.success(
        `Welcome, ${userAccount.name}! Auto-routed to ${userAccount.roleLabel} Dashboard`,
        {
          description: `Access Granted • Redirecting to ${userAccount.targetRoute}`,
        }
      );

      navigate(userAccount.targetRoute);
    }, 600);
  };

  const handleSendOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (identifier.replace(/\D/g, '').length < 10 && !identifier.includes('@')) {
      toast.error('Please enter a valid 10-digit mobile number or email');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      setTimer(30);
      toast.success(`Verification code sent to ${identifier.includes('@') ? identifier : `+91 ${identifier}`}`);
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
    executeLogin(detectedUser);
  };

  const handleQuickPresetLogin = (preset: RecognizedAccount) => {
    setIdentifier(preset.phone);
    executeLogin(preset);
  };

  const handleGoogleLogin = () => {
    // Google One-Tap detects role if identifier matches, otherwise defaults to Customer
    executeLogin(detectedUser);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col relative text-slate-900"
        >
          {/* Close button */}
          <button
            onClick={() => setAuthModalOpen(false)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header & Brand */}
          <div className="p-6 pb-4 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] animate-pulse"></span>
              <span className="text-[11px] uppercase font-extrabold tracking-widest text-[#2563EB]">
                Reparzo Single Sign-On (SSO)
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {step === 'phone' ? 'Sign In to Your Account' : 'Verify Mobile OTP'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              One login screen for all 3 roles. Enter your registered number and your dashboard opens automatically.
            </p>

            {/* ── 3-User Quick Demo Switcher (Instant 1-Click Auto-Login) ── */}
            <div className="mt-4 pt-3 border-t border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" /> 1-Click Demo Accounts (Auto-Role Detect)
                </span>
                <span className="text-[10px] text-slate-400">Click to auto-login</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* 1. Admin Demo Button */}
                <button
                  type="button"
                  onClick={() => handleQuickPresetLogin(PRESET_ACCOUNTS.admin)}
                  className="p-2 sm:p-2.5 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer group bg-rose-50/60 border-rose-200 hover:border-[#E32402] hover:bg-rose-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-lg bg-[#E32402] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <Shield className="w-3.5 h-3.5" />
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-rose-400 group-hover:text-[#E32402] transition-colors" />
                  </div>
                  <div className="mt-1.5">
                    <div className="text-[11px] font-extrabold text-slate-900 flex items-center gap-1">
                      <span>Admin</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">99999 99999</div>
                  </div>
                </button>

                {/* 2. Partner Demo Button */}
                <button
                  type="button"
                  onClick={() => handleQuickPresetLogin(PRESET_ACCOUNTS.partner)}
                  className="p-2 sm:p-2.5 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer group bg-amber-50/60 border-amber-200 hover:border-amber-500 hover:bg-amber-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <Wrench className="w-3.5 h-3.5" />
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-amber-500 group-hover:text-amber-700 transition-colors" />
                  </div>
                  <div className="mt-1.5">
                    <div className="text-[11px] font-extrabold text-slate-900 flex items-center gap-1">
                      <span>Partner</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">98765 43210</div>
                  </div>
                </button>

                {/* 3. Customer Demo Button */}
                <button
                  type="button"
                  onClick={() => handleQuickPresetLogin(PRESET_ACCOUNTS.user)}
                  className="p-2 sm:p-2.5 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer group bg-blue-50/60 border-blue-200 hover:border-[#2563EB] hover:bg-blue-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <User className="w-3.5 h-3.5" />
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-blue-400 group-hover:text-[#2563EB] transition-colors" />
                  </div>
                  <div className="mt-1.5">
                    <div className="text-[11px] font-extrabold text-slate-900 flex items-center gap-1">
                      <span>Customer</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">98450 12345</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-4 bg-white">
            {/* Live Role Detection Card (Shows feedback as user types) */}
            {isInputReady && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                  detectedUser.role === 'admin'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : detectedUser.role === 'partner'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-blue-50 border-blue-200 text-blue-900'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-xs ${
                    detectedUser.role === 'admin'
                      ? 'bg-[#E32402]'
                      : detectedUser.role === 'partner'
                      ? 'bg-amber-500'
                      : 'bg-[#2563EB]'
                  }`}
                >
                  {detectedUser.role === 'admin' && <Shield className="w-4 h-4" />}
                  {detectedUser.role === 'partner' && <Wrench className="w-4 h-4" />}
                  {detectedUser.role === 'user' && <User className="w-4 h-4" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold truncate">
                      {detectedUser.name}
                    </span>
                    <span
                      className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded-full ${
                        detectedUser.role === 'admin'
                          ? 'bg-rose-200/80 text-rose-800'
                          : detectedUser.role === 'partner'
                          ? 'bg-amber-200/80 text-amber-800'
                          : 'bg-blue-200/80 text-blue-800'
                      }`}
                    >
                      {detectedUser.roleLabel}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-80 truncate">
                    Destination: <strong className="font-mono">{detectedUser.targetRoute}</strong> ({detectedUser.designation})
                  </p>
                </div>

                <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white/80 border border-current shadow-xs flex-shrink-0">
                  Auto-Detect ✓
                </span>
              </motion.div>
            )}

            {step === 'phone' ? (
              <>
                {/* Mobile Input Form */}
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Enter Mobile Number or Email
                    </label>
                    <div className="flex items-center rounded-2xl bg-slate-50 border border-slate-200 focus-within:bg-white focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/20 overflow-hidden transition-all">
                      <div className="px-3.5 py-3.5 bg-slate-100 border-r border-slate-200 text-slate-800 font-mono font-bold text-sm flex items-center gap-1.5">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="e.g. 98765 43210 or 99999 99999"
                        className="flex-1 px-4 py-3.5 bg-transparent text-slate-900 placeholder-slate-400 font-mono text-base outline-none"
                        autoFocus
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      Admins, Partners, and Customers use this same input. Role is recognized automatically.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isLoading || !isInputReady}
                      className="flex-1 py-3.5 rounded-2xl bg-[#2563EB] hover:bg-[#1d4ed8] disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <span>{isLoading ? 'Verifying...' : 'Get 6-Digit OTP'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {/* Instant Login Shortcut when number is recognized */}
                    {isInputReady && (
                      <button
                        type="button"
                        onClick={() => executeLogin(detectedUser)}
                        disabled={isLoading}
                        title="Skip OTP and test auto-login immediately"
                        className="px-4 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Instant Login</span>
                      </button>
                    )}
                  </div>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="h-px bg-slate-200 flex-1"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    OR SINGLE SIGN-ON
                  </span>
                  <div className="h-px bg-slate-200 flex-1"></div>
                </div>

                {/* Google Login Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xs cursor-pointer"
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
              </>
            ) : (
              /* OTP Verification Step */
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-xs text-slate-500">
                    Enter the 6-digit verification code sent to
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {identifier.includes('@') ? identifier : `+91 ${identifier}`}
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
                      className="w-11 sm:w-12 h-13 sm:h-14 rounded-2xl bg-slate-50 border border-slate-200 text-center font-mono text-xl font-bold text-slate-900 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none transition-all"
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
                  <KeyRound className="w-4 h-4" />
                  <span>
                    {isLoading
                      ? 'Logging In...'
                      : `Verify & Enter ${detectedUser.roleLabel} Dashboard`}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Footer Guarantee */}
          <div className="p-3.5 border-t border-slate-100 bg-slate-50 text-center flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-bit encrypted single session • Role-based access control</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
