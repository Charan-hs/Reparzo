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
 * Setup RecaptchaVerifier for Phone Authentication
 */
export function setupRecaptcha(containerId: string): RecaptchaVerifier {
  if (typeof window === 'undefined') {
    throw new Error('Recaptcha must be initialized in browser');
  }

  // Clear existing verifier if any
  if ((window as any).recaptchaVerifier) {
    try {
      (window as any).recaptchaVerifier.clear();
    } catch (_) {}
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved - will proceed with phone auth
    },
    'expired-callback': () => {
      // reCAPTCHA expired
    }
  });

  (window as any).recaptchaVerifier = verifier;
  return verifier;
}

/**
 * Send real SMS OTP to phone number via Firebase Phone Auth
 */
export async function sendPhoneOtp(
  rawPhone: string,
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  const digits = rawPhone.replace(/\D/g, '');
  const formattedPhone = rawPhone.startsWith('+') 
    ? rawPhone 
    : (digits.length === 10 ? `+91${digits}` : `+${digits}`);

  return await signInWithPhoneNumber(auth, formattedPhone, verifier);
}

/**
 * Verify 6-digit SMS OTP code
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
