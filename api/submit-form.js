/**
 * VECT — Secure Form Submission Proxy
 */

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const WEB3FORMS_API_KEY = process.env.WEB3FORMS_API_KEY;

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 3;

function getAllowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGIN || 'https://www.vect-rf.it';
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

function resolveCorsOrigin(req) {
  const origin = req.headers.origin;
  const allowed = getAllowedOrigins();

  if (origin && allowed.includes(origin)) return origin;

  if (
    origin &&
    process.env.VERCEL_ENV === 'preview' &&
    /^https:\/\/[\w-]+\.vercel\.app$/.test(origin)
  ) {
    return origin;
  }

  return allowed[0] || 'https://www.vect-rf.it';
}

function applyCorsHeaders(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', resolveCorsOrigin(req));
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Access-Control-Max-Age', '86400');
}

async function verifyTurnstile(token, remoteIp) {
  if (!TURNSTILE_SECRET_KEY) {
    console.error('[VECT] TURNSTILE_SECRET_KEY not configured');
    return { success: false, error: 'Server misconfiguration' };
  }

  const params = new URLSearchParams();
  params.append('secret', TURNSTILE_SECRET_KEY);
  params.append('response', token);
  if (remoteIp) params.append('remoteip', remoteIp);

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    return await response.json();
  } catch (error) {
    console.error('[VECT] Turnstile verification failed:', error.message);
    return { success: false, error: 'Verification service unavailable' };
  }
}

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

  delete payload.turnstile_token;
  delete payload.cf_turnstile;

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
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

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    const ip = forwarded.split(',')[0].trim();
    if (ip) return ip;
  }
  return req.headers['cf-connecting-ip'] || req.headers['x-real-ip'] || null;
}

function getRateLimitKey(req) {
  const ip = getClientIp(req);
  if (ip) return `ip:${ip}`;

  const fingerprint = [
    req.headers['user-agent'],
    req.headers['accept-language'],
    req.headers['sec-ch-ua'],
  ].filter(Boolean).join('|');

  if (!fingerprint) return null;

  let hash = 0;
  for (let i = 0; i < fingerprint.length; i += 1) {
    hash = ((hash << 5) - hash) + fingerprint.charCodeAt(i);
    hash |= 0;
  }
  return `fp:${hash >>> 0}`;
}

function checkRateLimit(key) {
  if (!key) return true;

  const now = Date.now();
  const existing = rateLimitMap.get(key);

  if (!existing || now > existing.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (existing.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  existing.count += 1;
  return true;
}

export default async function handler(req, res) {
  applyCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  const rateLimitKey = getRateLimitKey(req);
  if (!checkRateLimit(rateLimitKey)) {
    console.warn('[VECT] Rate limit exceeded:', rateLimitKey);
    return res.status(429).json({
      success: false,
      message: 'Troppe richieste. Riprova più tardi.',
    });
  }

  const clientIp = getClientIp(req);

  let body;
  try {
    body = req.body;
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload',
    });
  }

  if (!body || typeof body !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'Empty or invalid request body',
    });
  }

  if (!body.name || !body.email || !body.message || !body.privacyConsent) {
    return res.status(422).json({
      success: false,
      message: 'Missing required fields: name, email, message, or privacy consent.',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    return res.status(422).json({
      success: false,
      message: 'Invalid email format',
    });
  }

  const turnstileToken = body.turnstile_token || body.cf_turnstile;
  if (!turnstileToken) {
    return res.status(403).json({
      success: false,
      message: 'Human verification required',
    });
  }

  const turnstileResult = await verifyTurnstile(turnstileToken, clientIp);

  if (!turnstileResult.success) {
    console.warn('[VECT] Turnstile verification failed:', turnstileResult);
    return res.status(403).json({
      success: false,
      message: 'Human verification failed. Please try again.',
      details: turnstileResult['error-codes'] || [],
    });
  }

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
