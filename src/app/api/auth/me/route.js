import { NextResponse } from 'next/server';

import { findUserById, sanitizeUser } from 'src/server/db/users';
import { getAuthenticatedClaims } from 'src/server/auth/verify-request';

// ----------------------------------------------------------------------

export async function GET(request) {
  const claims = getAuthenticatedClaims(request);
  if (!claims?.sub) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const user = await findUserById(claims.sub);
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(sanitizeUser(user));
}
