// ----------------------------------------------------------------------
// Server-side (Node runtime) verification for the mock JWT issued by
// src/app/api/auth/_mock-auth.js. Deliberately self-contained (no import
// from src/auth/**) so server-only request verification never pulls in
// client-oriented modules (axios instance, localStorage helpers, etc.).
//
// NOTE: this only decodes and checks `exp` — it does not verify a real
// cryptographic signature, because the mock backend does not issue one
// (`demo-signature`). This is a demo/POC stand-in for real JWT verification,
// consistent with the rest of the mock auth backend.
// ----------------------------------------------------------------------

export function getBearerToken(request) {
  const header = request.headers.get('authorization') || request.headers.get('Authorization') || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

export function decodeTokenPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Reads and validates the bearer token on an incoming Request.
 * @returns {{ sub: string, email?: string, schoolId?: string, exp: number } | null}
 */
export function getAuthenticatedClaims(request) {
  const token = getBearerToken(request);
  if (!token) return null;

  const claims = decodeTokenPayload(token);
  if (!claims || typeof claims.exp !== 'number') return null;

  const isExpired = claims.exp * 1000 <= Date.now();
  if (isExpired) return null;

  return claims;
}
