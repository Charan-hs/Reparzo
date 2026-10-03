// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  User as FirebaseUser
} from "firebase/auth";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyB3UV8d9fHM42FsuFYDn8MB7NUBRl-otmg",
  authDomain: "reparzo.firebaseapp.com",
  projectId: "reparzo",
  storageBucket: "reparzo.firebasestorage.app",
  messagingSenderId: "176474097735",
  appId: "1:176474097735:web:764b36251da560884d8962",
  measurementId: "G-GEZ9NM6S5G"
};

// Initialize Firebase (safely singleton)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Firebase Analytics safely
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {});
}

/**
 * Sign in with Google Popup using Firebase Auth
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Format phone number to strict E.164 standard (e.g. +919876543210)
 */
export function formatToE164(rawPhone: string): string {
  const clean = rawPhone.trim();
  if (clean.startsWith('+')) {
    return `+${clean.replace(/\D/g, '')}`;
  }
  const digits = clean.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  return `+${digits}`;
}

/**
 * Setup RecaptchaVerifier for Web Phone Authentication
 * Follows official guide: https://firebase.google.com/docs/auth/web/phone-auth
 * Prevents "reCAPTCHA has already been rendered in this element" errors.
 */
export function setupRecaptcha(containerId: string = 'recaptcha-container'): RecaptchaVerifier {
  if (typeof window === 'undefined') {
    throw new Error('Recaptcha must be initialized in browser');
  }

  // 1. If an existing verifier is already initialized and valid, reuse it
  if ((window as any).recaptchaVerifier) {
    return (window as any).recaptchaVerifier;
  }

  // 2. Ensure container exists in DOM and clean any stale widget nodes
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  } else {
    container.innerHTML = '';
  }

  const verifier = new RecaptchaVerifier(auth, container, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved - will proceed with phone auth
    },
    'expired-callback': () => {
      resetRecaptcha();
    }
  });

  (window as any).recaptchaVerifier = verifier;
  return verifier;
}

/**
 * Reset active reCAPTCHA verifier and clean container DOM
 */
export function resetRecaptcha(): void {
  if (typeof window !== 'undefined') {
    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch (_) {}
      (window as any).recaptchaVerifier = null;
    }
    const container = document.getElementById('recaptcha-container');
    if (container) {
      container.innerHTML = '';
    }
  }
}

/**
 * Send real SMS verification code to phone number via Firebase Phone Auth
 * Returns ConfirmationResult for code confirmation
 */
export async function sendPhoneOtp(
  rawPhone: string,
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  const formattedPhone = formatToE164(rawPhone);
  return await signInWithPhoneNumber(auth, formattedPhone, verifier);
}

/**
 * Verify 6-digit SMS OTP code against Firebase ConfirmationResult
 */
export async function verifyOtpCode(
  confirmationResult: ConfirmationResult,
  code: string
): Promise<FirebaseUser> {
  const credential = await confirmationResult.confirm(code);
  return credential.user;
}

/**
 * Sign out from Firebase Auth
 */
export async function signOutFirebase(): Promise<void> {
  await firebaseSignOut(auth);
}

export type { FirebaseUser, ConfirmationResult };
