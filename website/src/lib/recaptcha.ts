/**
 * Google reCAPTCHA Enterprise Integration
 * Site Key: 6LeKwt8tAAAAAK00ZtJ77gSSXaNKWezSXqrNfSwo
 */

export const RECAPTCHA_ENTERPRISE_SITE_KEY = '6LeKwt8tAAAAAK00ZtJ77gSSXaNKWezSXqrNfSwo';

declare global {
  interface Window {
    grecaptcha?: {
      enterprise?: {
        ready: (callback: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
      // Classic Firebase v2 container methods for phone verification fallback
      render?: (...args: any[]) => any;
      reset?: (...args: any[]) => any;
    };
  }
}

/**
 * Executes a Google reCAPTCHA Enterprise score assessment action.
 * Returns the generated token (valid for 2 minutes) or null if bypassed/unavailable.
 *
 * @param action The name of the action to protect (e.g. 'LOGIN', 'SEND_OTP', 'BOOKING', 'CUSTOM_REQUEST')
 */
export async function executeRecaptcha(action: string): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    const grecaptcha = window.grecaptcha;
    if (!grecaptcha?.enterprise?.execute) {
      // If the script is still downloading or blocked by an ad-blocker, log notice and gracefully allow flow
      return null;
    }

    return await new Promise<string | null>((resolve) => {
      try {
        grecaptcha.enterprise!.ready(async () => {
          try {
            const token = await grecaptcha.enterprise!.execute(RECAPTCHA_ENTERPRISE_SITE_KEY, {
              action,
            });
            resolve(token);
          } catch (err) {
            console.warn(`[reCAPTCHA Enterprise] execute failed for action "${action}":`, err);
            resolve(null);
          }
        });
      } catch (err) {
        console.warn(`[reCAPTCHA Enterprise] ready failed for action "${action}":`, err);
        resolve(null);
      }
    });
  } catch (err) {
    console.warn('[reCAPTCHA Enterprise error]:', err);
    return null;
  }
}
