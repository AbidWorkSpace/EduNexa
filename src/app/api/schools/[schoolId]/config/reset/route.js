import { NextResponse } from 'next/server';

import { getSchoolById } from 'src/server/db/schools';
import { getAuthenticatedClaims } from 'src/server/auth/verify-request';
import { resetConfigurationToDefault } from 'src/server/db/school-configurations';

// ----------------------------------------------------------------------
// Resets the authenticated user's OWN school back to the platform default
// design tokens. Same tenant-authorization rule as the config resource: the
// [schoolId] segment is checked against the token's claim, never trusted.
// ----------------------------------------------------------------------

export async function POST(request, { params }) {
  const { schoolId } = await params;

  const claims = getAuthenticatedClaims(request);
  if (!claims) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  if (claims.schoolId !== schoolId) {
    return NextResponse.json({ message: 'You do not have access to this school.' }, { status: 403 });
  }

  const updated = await resetConfigurationToDefault(schoolId);
  if (!updated) {
    return NextResponse.json({ message: 'School not found.' }, { status: 404 });
  }

  const school = await getSchoolById(schoolId);
  return NextResponse.json({ school, configuration: updated });
}
