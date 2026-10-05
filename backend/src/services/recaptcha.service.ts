import type { Env } from '../types';

export interface CreateAssessmentOptions {
  projectID?: string;
  recaptchaKey?: string;
  token: string;
  recaptchaAction: string;
}

export interface AssessmentResponse {
  valid: boolean;
  score?: number;
  action?: string;
  reasons?: string[];
  invalidReason?: string;
}

/**
 * Creates an assessment to analyse the risk of a UI action using Google reCAPTCHA Enterprise.
 *
 * projectID: Your Google Cloud project ID (default: 'reparzo')
 * recaptchaKey: The reCAPTCHA key associated with the site/app ('6LeKwt8tAAAAAK00ZtJ77gSSXaNKWezSXqrNfSwo')
 * token: The generated token obtained from client (expires after 2 minutes)
 * recaptchaAction: Action name corresponding to the token (e.g. 'LOGIN', 'BOOKING')
 */
export async function createAssessment(
  {
    projectID = 'reparzo',
    recaptchaKey = '6LeKwt8tAAAAAK00ZtJ77gSSXaNKWezSXqrNfSwo',
    token,
    recaptchaAction,
  }: CreateAssessmentOptions,
  env?: Env
): Promise<AssessmentResponse> {
  if (!token) {
    return { valid: false, invalidReason: 'NO_TOKEN_PROVIDED' };
  }

  const effectiveProjectID = env?.RECAPTCHA_PROJECT_ID || projectID;
  const effectiveKey = env?.RECAPTCHA_SITE_KEY || recaptchaKey;
  const secretKey = env?.RECAPTCHA_SECRET_KEY;
  const apiKey = env?.RECAPTCHA_API_KEY;

  try {
    // 1. Primary verification via Google reCAPTCHA Secret Key API (native & zero-config in Cloudflare Workers)
    if (secretKey) {
      const params = new URLSearchParams();
      params.append('secret', secretKey);
      params.append('response', token);

      const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (verifyRes.ok) {
        const verifyData: any = await verifyRes.json();
        if (verifyData.success) {
          if (verifyData.action && recaptchaAction && verifyData.action !== recaptchaAction) {
            console.warn(`[reCAPTCHA] Action mismatch: expected ${recaptchaAction}, got ${verifyData.action}`);
            return {
              valid: false,
              invalidReason: 'ACTION_MISMATCH',
            };
          }

          const score = typeof verifyData.score === 'number' ? verifyData.score : 1.0;
          return {
            valid: true,
            score,
            action: verifyData.action || recaptchaAction,
            reasons: [],
          };
        } else {
          const errorCodes = verifyData['error-codes'] || [];
          return {
            valid: false,
            invalidReason: errorCodes.join(', ') || 'INVALID_TOKEN',
          };
        }
      }
    }

    // 2. Secondary verification via Google Cloud Enterprise REST API
    const endpoint = apiKey
      ? `https://recaptchaenterprise.googleapis.com/v1/projects/${effectiveProjectID}/assessments?key=${apiKey}`
      : `https://recaptchaenterprise.googleapis.com/v1/projects/${effectiveProjectID}/assessments`;

    const requestBody = {
      event: {
        token,
        siteKey: effectiveKey,
        expectedAction: recaptchaAction,
      },
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      console.warn(`[reCAPTCHA Enterprise] Assessment request returned HTTP ${res.status}:`, errorText);
      return {
        valid: false,
        invalidReason: `HTTP_${res.status}`,
      };
    }

    const response: any = await res.json();

    // Check if the token is valid
    if (!response.tokenProperties?.valid) {
      console.log(
        `The CreateAssessment call failed because the token was: ${response.tokenProperties?.invalidReason}`
      );
      return {
        valid: false,
        invalidReason: response.tokenProperties?.invalidReason,
      };
    }

    // Check if the expected action was executed
    if (response.tokenProperties?.action === recaptchaAction) {
      const score = response.riskAnalysis?.score ?? 1.0;
      const reasons = response.riskAnalysis?.reasons || [];
      console.log(`The reCAPTCHA score is: ${score}`);
      reasons.forEach((reason: string) => {
        console.log(reason);
      });

      return {
        valid: true,
        score,
        action: response.tokenProperties.action,
        reasons,
      };
    } else {
      console.log(
        `The action attribute in your reCAPTCHA tag (${response.tokenProperties?.action}) does not match the action you are expecting to score (${recaptchaAction})`
      );
      return {
        valid: false,
        invalidReason: 'ACTION_MISMATCH',
      };
    }
  } catch (err: any) {
    console.warn('[reCAPTCHA Enterprise] Assessment execution error:', err);
    return {
      valid: false,
      invalidReason: err?.message || 'ASSESSMENT_EXCEPTION',
    };
  }
}
