import { NextResponse } from 'next/server';

import { SchoolCreateSchema } from 'src/schemas/school';

import { createUser } from 'src/server/db/users';
import { createSchool } from 'src/server/db/schools';
import { createConfiguration, buildDefaultConfiguration } from 'src/server/db/school-configurations';

// ----------------------------------------------------------------------
// School onboarding (minimal, per POC scope): create School -> create its
// default SchoolConfiguration -> create its admin user, in that order, so a
// school is never left without a configuration or without an owner.
//
// There is no UI for this endpoint yet (out of scope for this task) — it
// exists so the backend foundation for registration is real and testable.
// ----------------------------------------------------------------------

function slugToId(slug) {
  return `sch_${slug.replace(/-/g, '_')}`;
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const parsed = SchoolCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? 'Invalid school payload.' },
      { status: 400 }
    );
  }

  const { name, slug, contactEmail, contactPhone, adminEmail, adminPassword, adminName } = parsed.data;

  const schoolId = slugToId(slug);

  let school;
  try {
    school = await createSchool({ id: schoolId, name, slug, contactEmail, contactPhone });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 409 });
  }

  const configuration = buildDefaultConfiguration(schoolId, { schoolName: name });
  await createConfiguration(configuration);

  try {
    await createUser({
      userId: `usr_${slug.replace(/-/g, '_')}_admin`,
      email: adminEmail,
      password: adminPassword,
      userName: adminName,
      roles: ['school_admin'],
      permissions: ['school:read', 'school:update'],
      schoolId,
    });
  } catch (error) {
    // School + configuration were already created; surface the admin-creation
    // failure distinctly so the caller knows the school exists but has no
    // working login yet (acceptable for this POC's minimal onboarding flow).
    return NextResponse.json(
      { message: `School created, but admin account could not be created: ${error.message}`, school },
      { status: 207 }
    );
  }

  return NextResponse.json({ school, configuration }, { status: 201 });
}
