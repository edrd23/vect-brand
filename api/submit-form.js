/**
 * VECT — Secure Form Submission Proxy
 *
 * Purpose:
 * 1. Hide Web3Forms API key from client-side exposure
 * 2. Validate Cloudflare Turnstile CAPTCHA token
 * 3. Forward legitimate submissions to Web3Forms
 *
 * Deploy: Vercel Serverless Function (automatic)
 */

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const WEB3FORMS_API_KEY = process.env.WEB3FORMS_API_KEY;

// ═══════ RATE LIMITING IN-MEMORY CACHE ═══════
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 Ora
const MAX_REQUESTS_PER_WINDOW = 3; // Max 3 submissions per IP per hour

// CORS & Security headers
const CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://www.vect-rf.it',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Max-Age': '86400',
    // Security headers
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-XSS-Protection': '1; mode=block'
};

/**
 * Validate Turnstile token with Cloudflare
 */
async function verifyTurnstile(token, remoteIp) {
  if (!TURNSTILE_SECRET_KEY) {
    console.error('[VECT] TURNSTILE_SECRET_KEY not configured');
    return { success: false, error: 'Server misconfiguration' };
  }

  const verificationUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
  
  const params = new URLSearchParams();
  params.append('secret', TURNSTILE_SECRET_KEY);
  params.append('response', token);
  if (remoteIp) params.append('remoteip', remoteIp);

  try {
    const response = await fetch(verificationUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[VECT] Turnstile verification failed:', error.message);
    return { success: false, error: 'Verification service unavailable' };
  }
}

/**
 * Forward form data to Web3Forms
 */
async function forwardToWeb3Forms(formData) {
  if (!WEB3FORMS_API_KEY) {
    console.error('[VECT] WEB3FORMS_API_KEY not configured');
    return { success: false, error: 'Email service misconfiguration' };
  }

  const payload = {
    ...formData,
    access_key: WEB3FORMS_API_KEY,
    subject: formData.subject || 'Nuova richiesta da VECT [WEB]',
    from_name: formData.from_name || 'VECT Website',
  };

  // Remove Turnstile token before forwarding
  delete payload.turnstile_token;

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return { success: result.success, data: result };
  } catch (error) {
    console.error('[VECT] Web3Forms forwarding failed:', error.message);
    return { success: false, error: 'Email delivery failed' };
  }
}

/**
 * Extract real IP from request (supports proxies)
 */
function getClientIp(req) {
  return (
    req.headers['cf-connecting-ip'] ||       // Cloudflare
    req.headers['x-real-ip'] ||              // Vercel/NGINX
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    'unknown'
  );
}

/**
 * Main handler — Vercel Serverless Function
 */
export default async function handler(req, res) {
  // Set CORS and security headers
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  // Estrai l'indirizzo IP del client per il Rate Limiting e Turnstile
  const clientIp = getClientIp(req);

  // ═══════ VERIFICA RATE LIMIT ═══════
  const now = Date.now();
  if (rateLimitMap.has(clientIp)) {
    const rateData = rateLimitMap.get(clientIp);
    if (now > rateData.resetTime) {
      // Finestra temporale scaduta, resetta
      rateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    } else {
      if (rateData.count >= MAX_REQUESTS_PER_WINDOW) {
        console.warn(`[VECT] Rate limit exceeded by IP: ${clientIp}`);
        return res.status(429).json({
          success: false,
          message: 'Troppe richieste. Riprova più tardi.',
        });
      }
      rateData.count++;
    }
  } else {
    // Primo accesso di questo IP
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
  }

  // Parse body
  let body;
  try {
    body = req.body;
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload',
    });
  }

  // Validate required fields
  if (!body.name || !body.email || !body.message || !body.privacyConsent) {
    return res.status(422).json({
      success: false,
      message: 'Missing required fields: name, email, message, or privacy consent.',
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    return res.status(422).json({
      success: false,
      message: 'Invalid email format',
    });
  }

  // Validate Turnstile token
  const turnstileToken = body.turnstile_token;
  if (!turnstileToken) {
    return res.status(403).json({
      success: false,
      message: 'Human verification required',
    });
  }

  // Verify Turnstile
  const turnstileResult = await verifyTurnstile(turnstileToken, clientIp);

  if (!turnstileResult.success) {
    console.warn('[VECT] Turnstile verification failed:', turnstileResult);
    return res.status(403).json({
      success: false,
      message: 'Human verification failed. Please try again.',
      details: turnstileResult['error-codes'] || [],
    });
  }

  console.log('[VECT] Turnstile verified for:', body.email);

  // Forward to Web3Forms
  const formResult = await forwardToWeb3Forms(body);

  if (formResult.success) {
    return res.status(200).json({
      success: true,
      message: 'Form submitted successfully',
    });
  }

  return res.status(502).json({
    success: false,
    message: formResult.error || 'Failed to send email',
  });
}
