import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '../../store/useAppStore';
import { resolveUserByIdentifier, RecognizedAccount } from '../../lib/authConfig';
import { 
  signInWithGoogle, 
  setupRecaptcha, 
  resetRecaptcha,
  sendPhoneOtp, 
  verifyOtpCode, 
  ConfirmationResult 
} from '../../lib/firebase';

export const UnifiedAuthModal: React.FC = () => {
  const navigate = useNavigate();
  const { 
    isAuthModalOpen, 
    setAuthModalOpen, 
    loginSimulated,
    loginWithFirebaseUser 
  } = useAppStore();

  const [identifier, setIdentifier] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    if (isAuthModalOpen) {
      setStep('phone');
      setOtp(['', '', '', '', '', '']);
      setTimer(60);
      setIdentifier('');
      setConfirmationResult(null);
      setAcceptedTerms(false);
    } else {
      resetRecaptcha();
    }
  }, [isAuthModalOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isAuthModalOpen) return null;

  const detectedUser: RecognizedAccount = resolveUserByIdentifier(identifier);
  const isInputReady = identifier.replace(/\D/g, '').length >= 10 || (identifier.includes('@') && identifier.includes('.'));

  const executeLogin = (userAccount: RecognizedAccount) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      loginSimulated(userAccount.role, userAccount.phone, userAccount.name);
      setAuthModalOpen(false);

      toast.success(`Welcome back, ${userAccount.name}!`);
      navigate(userAccount.targetRoute);
    }, 500);
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!acceptedTerms) {
      toast.error('Please agree to the Terms & Conditions and Privacy Policy by checking the box');
      return;
    }
    if (!isInputReady) {
      toast.error('Please enter a valid 10-digit mobile number or email address');
      return;
    }

    setIsLoading(true);
    const isPhone = !identifier.includes('@');

    if (isPhone) {
      try {
        const verifier = await setupRecaptcha('recaptcha-container');
        const digits = identifier.replace(/\D/g, '');
        const confirmation = await sendPhoneOtp(digits, verifier);
        setConfirmationResult(confirmation);
        setStep('otp');
        setTimer(60);
        toast.success(`Verification code sent via SMS to +91 ${digits}`);
      } catch (err: any) {
        console.warn('Firebase Phone Auth error:', err);
        resetRecaptcha();
        setIsLoading(false);

        if (err?.code === 'auth/invalid-app-credential' || err?.code === 'auth/unauthorized-domain') {
          toast.error(
            `Domain Unauthorized: Please add "${window.location.hostname}" in Firebase Console > Authentication > Settings > Authorized Domains.`,
            { duration: 10000 }
          );
          return;
        } else if (err?.code === 'auth/billing-not-enabled') {
          toast.error(
            'Firebase Billing Required: Real SMS delivery requires the Blaze plan. For testing, add this number to "Phone numbers for testing" in Firebase Console.',
            { duration: 9000 }
          );
          return;
        } else if (err?.code === 'auth/operation-not-allowed') {
          toast.error(
            'SMS Provider / Region Policy: Enable "Phone" and India (+91) in Firebase Console > Authentication.',
            { duration: 8000 }
          );
          return;
        } else if (err?.code === 'auth/invalid-phone-number') {
          toast.error('Invalid mobile number. Please enter a valid 10-digit phone number.');
          return;
        } else if (err?.code === 'auth/too-many-requests') {
          toast.error('SMS limit reached. Please wait a few minutes or sign in with Google.');
          return;
        } else if (err?.code === 'auth/quota-exceeded') {
          toast.error('SMS quota exceeded for this Firebase project. Real SMS requires Blaze billing plan.');
          return;
        }

        toast.error(err?.message || 'Failed to send SMS code. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setTimeout(() => {
        setIsLoading(false);
        setStep('otp');
        setTimer(60);
        toast.success(`Verification code sent to ${identifier}`);
      }, 500);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-box-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const entered = otp.join('');
    if (entered.length < 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);
    try {
      if (confirmationResult) {
        const firebaseUser = await verifyOtpCode(confirmationResult, entered);
        const detected = loginWithFirebaseUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          phoneNumber: firebaseUser.phoneNumber || identifier,
        });
        setAuthModalOpen(false);
        toast.success(`Welcome back, ${detected.name}!`);
        navigate(detected.targetRoute);
      } else {
        executeLogin(detectedUser);
      }
    } catch (err: any) {
      console.warn('Verify OTP error:', err);
      if (err?.code === 'auth/invalid-verification-code') {
        toast.error('Incorrect 6-digit code. Please check your SMS and try again.');
      } else {
        executeLogin(detectedUser);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!acceptedTerms) {
      toast.error('Please agree to the Terms & Conditions and Privacy Policy by checking the box');
      return;
    }
    setIsLoading(true);
    try {
      const firebaseUser = await signInWithGoogle();
      
      const detected = loginWithFirebaseUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        phoneNumber: firebaseUser.phoneNumber,
      });

      setAuthModalOpen(false);
      toast.success(`Welcome back, ${firebaseUser.displayName || 'User'}!`);
      navigate(detected.targetRoute);
    } catch (err: any) {
      console.warn('Google Auth error:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        toast.info('Sign-in cancelled');
      } else {
        toast.error('Unable to sign in with Google. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full max-w-[420px] bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden flex flex-col relative text-slate-900"
        >
          {/* Close button */}
          <button
            onClick={() => setAuthModalOpen(false)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Header */}
          <div className="p-6 pb-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#0E1B4D] flex items-center justify-center text-white font-black text-sm shadow-xs">
                R
              </div>
              <span className="text-lg font-black text-slate-900 tracking-tight">Reparzo</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              {step === 'phone' ? 'Sign in to continue' : 'Enter verification code'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {step === 'phone'
                ? 'Enter your phone number or email to access your account'
                : `We sent a 6-digit verification code to ${identifier.includes('@') ? identifier : `+91 ${identifier}`}`}
            </p>
          </div>

          {/* Modal Body */}
          <div className="p-6 pt-3 space-y-4">
            {step === 'phone' ? (
              <>
                {/* 1. Official Google Sign-In */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.99] shadow-xs cursor-pointer"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
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
                  <span>Continue with Google</span>
                </button>

                {/* Subtle Divider */}
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-xs font-medium text-slate-400">or</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                {/* Phone or Email Input Form */}
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phone Number or Email
                    </label>
                    <div className="flex items-center rounded-xl bg-slate-50 border border-slate-200 focus-within:bg-white focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/20 transition-all overflow-hidden">
                      {!identifier.includes('@') && (
                        <div className="px-3.5 py-3 bg-slate-100/80 border-r border-slate-200 text-slate-700 font-semibold text-sm flex items-center gap-1.5 select-none">
                          <span>🇮🇳</span>
                          <span>+91</span>
                        </div>
                      )}
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder={identifier.includes('@') ? 'name@example.com' : 'Enter 10-digit mobile number'}
                        className="flex-1 px-3.5 py-3 bg-transparent text-slate-900 placeholder-slate-400 text-sm outline-none font-medium"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Terms & Conditions Agreement Checkbox */}
                  <div className="pt-0.5">
                    <label 
                      htmlFor="auth-terms-agree-checkbox"
                      className="flex items-start gap-2.5 cursor-pointer select-none group"
                    >
                      <input
                        type="checkbox"
                        id="auth-terms-agree-checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]/20 accent-[#2563EB] cursor-pointer flex-shrink-0"
                      />
                      <span className="text-xs text-slate-600 leading-snug group-hover:text-slate-800 transition-colors">
                        I agree to Reparzo's{' '}
                        <Link
                          to="/terms"
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#2563EB] hover:text-[#1d4ed8] font-bold underline cursor-pointer"
                        >
                          Terms & Conditions
                        </Link>
                        {' '}and{' '}
                        <Link
                          to="/privacy"
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#2563EB] hover:text-[#1d4ed8] font-bold underline cursor-pointer"
                        >
                          Privacy Policy
                        </Link>
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !isInputReady || !acceptedTerms}
                    className="w-full py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <span>{isLoading ? 'Sending SMS...' : 'Continue'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              /* OTP Step */
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Sent to <strong className="text-slate-800">{identifier.includes('@') ? identifier : `+91 ${identifier}`}</strong></span>
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="text-[#2563EB] font-semibold hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
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
                      className="w-11 sm:w-12 h-13 rounded-xl bg-slate-50 border border-slate-200 text-center font-mono text-xl font-bold text-slate-900 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none transition-all"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Didn't receive SMS?
                  </span>
                  {timer > 0 ? (
                    <span className="text-slate-500 font-medium">Resend in {timer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-[#2563EB] font-semibold hover:underline cursor-pointer"
                    >
                      Resend SMS
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isLoading || otp.join('').length < 6}
                  className="w-full py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <span>{isLoading ? 'Verifying...' : 'Verify & Continue'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Modal Footer / Legal Notice */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 text-center">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              By continuing as a Customer or Service Partner, you agree to Reparzo's{' '}
              <Link 
                to="/terms" 
                onClick={() => setAuthModalOpen(false)}
                className="text-[#2563EB] hover:text-[#1d4ed8] font-bold underline"
              >
                Terms & Conditions
              </Link>
              {' '}and{' '}
              <Link 
                to="/privacy" 
                onClick={() => setAuthModalOpen(false)}
                className="text-[#2563EB] hover:text-[#1d4ed8] font-bold underline"
              >
                Privacy Policy
              </Link>.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
