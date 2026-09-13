import { readJsonFile, writeJsonFile } from './json-store';

// ----------------------------------------------------------------------

const FILE = 'schools.json';

export async function listSchools() {
  return readJsonFile(FILE, []);
}

export async function getSchoolById(schoolId) {
  const schools = await listSchools();
  return schools.find((school) => school.id === schoolId) ?? null;
}

export async function getSchoolBySlug(slug) {
  const schools = await listSchools();
  return schools.find((school) => school.slug === slug) ?? null;
}

export async function createSchool({ id, name, slug, logoUrl = null, faviconUrl = null, contactEmail, contactPhone = null }) {
  const schools = await listSchools();

  if (schools.some((school) => school.id === id || school.slug === slug)) {
    throw new Error('A school with this id or slug already exists');
  }

  const now = new Date().toISOString();
  const school = {
    id,
    name,
    slug,
    logoUrl,
    faviconUrl,
    status: 'active',
    contactEmail,
    contactPhone,
    createdAt: now,
    updatedAt: now,
  };

  await writeJsonFile(FILE, [...schools, school]);
  return school;
}
