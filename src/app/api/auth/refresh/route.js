import { NextResponse } from 'next/server';

import { findUserById } from 'src/server/db/users';
import { decodeTokenPayload } from 'src/server/auth/verify-request';

import { createLoginResponse } from '../_mock-auth';

// ----------------------------------------------------------------------

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const refreshToken = body.refreshToken;

  const claims = refreshToken ? decodeTokenPayload(refreshToken) : null;
  const isExpired = !claims?.exp || claims.exp * 1000 <= Date.now();

  if (!claims?.sub || claims.type !== 'refresh' || isExpired) {
    return NextResponse.json({ message: 'Invalid or expired refresh token.' }, { status: 401 });
  }

  const user = await findUserById(claims.sub);
  if (!user) {
    return NextResponse.json({ message: 'User not found.' }, { status: 401 });
  }

  return NextResponse.json(createLoginResponse(user));
}
