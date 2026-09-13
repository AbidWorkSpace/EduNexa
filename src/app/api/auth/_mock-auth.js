import { sanitizeUser } from 'src/server/db/users';

// ----------------------------------------------------------------------
// DEMO-ONLY mock JWT issuer. Tokens are unsigned (the "signature" segment is
// a fixed string) and are only ever verified for shape + expiry, both here
// and in src/server/auth/verify-request.js. Replace with a real auth backend
// before this app handles real data.
//
// schoolId is embedded directly in the access token's claims (not only in
// the response body) so that server-side API routes can authorize a request
// against its owning school on every call, not only at login time.
// ----------------------------------------------------------------------

function base64UrlEncode(value) {
  return Buffer.from(JSON.stringify(value))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function createMockToken(payload = {}) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const body = {
    iat: now,
    exp: now + 60 * 60 * 24,
    ...payload,
  };

  return `${base64UrlEncode(header)}.${base64UrlEncode(body)}.demo-signature`;
}

/**
 * Builds a full login/refresh response for a given user record (from the
 * users store). schoolId is included both in the access token's claims and
 * in the response body's user fields.
 */
export function createLoginResponse(user) {
  const expiresAt = new Date(Date.now() + 60 * 60 * 24 * 1000).toISOString();

  const accessToken = createMockToken({
    sub: user.userId,
    email: user.email,
    name: user.userName,
    schoolId: user.schoolId,
  });

  const refreshToken = createMockToken({
    sub: user.userId,
    type: 'refresh',
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  });

  return {
    ...sanitizeUser(user),
    accessToken,
    refreshToken,
    expiresAt,
  };
}
