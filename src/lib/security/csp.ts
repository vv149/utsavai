import crypto from "node:crypto";

/** CSP nonce context for a single request. */
export interface CspNonce {
  value: string;
  attribute: string;
}

/** Generates a fresh 128-bit nonce for CSP. */
export function generateNonce(): CspNonce {
  const bytes = crypto.randomBytes(16);
  const value = bytes.toString("base64");
  return { value, attribute: `nonce="${value}"` };
}

/** Builds the Content-Security-Policy header value. */
export function buildCspHeader(nonce: string, isDev: boolean): string {
  if (isDev) {
    return [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`,
      `style-src 'self' 'unsafe-inline'`,
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; ");
  }

  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

/** Returns CSP header for API routes (deny all). */
export function buildApiCspHeader(): string {
  return "default-src 'none'";
}

/** Returns all security response headers. */
export function securityHeaders(nonce: string, isDev: boolean): Record<string, string> {
  return {
    "Content-Security-Policy": buildCspHeader(nonce, isDev),
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Permissions-Policy": "accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), camera=(), cross-origin-isolated=(), display-capture=(), document-domain=(), encrypted-media=(), execution-while-not-rendered=(), execution-while-out-of-viewport=(), fullscreen=(), geolocation=(), gyroscope=(), keyboard-map=(), magnetometer=(), microphone=(), midi=(), navigation-override=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), usb=(), web-share=(), xr-spatial-tracking=()",
  };
}
