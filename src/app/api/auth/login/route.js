import { NextResponse } from 'next/server';

import { findUserByEmail } from 'src/server/db/users';

import { createLoginResponse } from '../_mock-auth';

// ----------------------------------------------------------------------

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const email = body.email?.trim?.().toLowerCase();
  const password = body.password?.trim?.();

  const user = await findUserByEmail(email);

  if (!user || user.password !== password) {
    return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
  }

  return NextResponse.json(createLoginResponse(user));
}
