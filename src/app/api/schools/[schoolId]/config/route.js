import { NextResponse } from 'next/server';

import { SchoolConfigurationUpdateSchema } from 'src/schemas/school-configuration';

import { getSchoolById } from 'src/server/db/schools';
import { getAuthenticatedClaims } from 'src/server/auth/verify-request';
import { getConfigBySchoolId, updateConfiguration } from 'src/server/db/school-configurations';

// ----------------------------------------------------------------------
// Tenant-scoped configuration resource.
//
// The [schoolId] segment is client-supplied (it's in the URL), but it is
// NEVER trusted on its own: every request must carry a valid access token,
// and the token's own `schoolId` claim (set by the server at login, see
// src/app/api/auth/_mock-auth.js) is what's compared against the requested
// schoolId. A School A token requesting School B's config is rejected with
// 403 regardless of what the client asked for.
// ----------------------------------------------------------------------

async function authorizeSchoolRequest(request, schoolId) {
  const claims = getAuthenticatedClaims(request);
  if (!claims) {
    return { error: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) };
  }

  if (claims.schoolId !== schoolId) {
    return {
      error: NextResponse.json(
        { message: 'You do not have access to this school.' },
        { status: 403 }
      ),
    };
  }

  return { claims };
}

export async function GET(request, { params }) {
  const { schoolId } = await params;

  const { error } = await authorizeSchoolRequest(request, schoolId);
  if (error) return error;

  const [school, configuration] = await Promise.all([
    getSchoolById(schoolId),
    getConfigBySchoolId(schoolId),
  ]);

  if (!school || !configuration) {
    return NextResponse.json({ message: 'School not found.' }, { status: 404 });
  }

  return NextResponse.json({ school, configuration });
}

export async function PUT(request, { params }) {
  const { schoolId } = await params;

  const { error } = await authorizeSchoolRequest(request, schoolId);
  if (error) return error;

  const body = await request.json().catch(() => ({}));

  // Ignore any schoolId the client tries to smuggle into the body — the URL
  // segment (already authorized above) is the only source of truth here.
  const { schoolId: _ignored, ...rest } = body ?? {};

  const parsed = SchoolConfigurationUpdateSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? 'Invalid configuration payload.' },
      { status: 400 }
    );
  }

  const updated = await updateConfiguration(schoolId, parsed.data);
  if (!updated) {
    return NextResponse.json({ message: 'School not found.' }, { status: 404 });
  }

  const school = await getSchoolById(schoolId);
  return NextResponse.json({ school, configuration: updated });
}
