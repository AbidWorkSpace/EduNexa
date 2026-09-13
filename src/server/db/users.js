import { readJsonFile, writeJsonFile } from './json-store';

// ----------------------------------------------------------------------
// DEMO-ONLY: passwords are stored and compared in plaintext. This mirrors the
// pre-existing mock auth backend (a single hardcoded password) and must be
// replaced by a real backend with proper password hashing before any real use.
// ----------------------------------------------------------------------

const FILE = 'users.json';

export async function listUsers() {
  return readJsonFile(FILE, []);
}

export async function findUserByEmail(email) {
  if (!email) return null;
  const users = await listUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function findUserById(userId) {
  if (!userId) return null;
  const users = await listUsers();
  return users.find((user) => user.userId === userId) ?? null;
}

export async function createUser({ userId, email, password, userName, roles, permissions, schoolId }) {
  const users = await listUsers();

  if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('A user with this email already exists');
  }

  const user = { userId, email, password, userName, roles, permissions, schoolId };
  await writeJsonFile(FILE, [...users, user]);
  return user;
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}
