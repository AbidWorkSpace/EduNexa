import {
  JWT_STORAGE_KEY,
  USER_STORAGE_KEY,
  EXPIRES_AT_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
} from './constant';

// ----------------------------------------------------------------------

const AUTH_KEYS = [
  JWT_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  EXPIRES_AT_STORAGE_KEY,
  USER_STORAGE_KEY,
];

// ----------------------------------------------------------------------

export function getAuthItem(key) {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
}

export function setAuthItem(key, value) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value);
}

export function removeAuthItem(key) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}

export function clearAuthStorage() {
  if (typeof window === 'undefined') return;
  AUTH_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}

export function getAccessToken() {
  return getAuthItem(JWT_STORAGE_KEY);
}

/**
 * Copy legacy per-tab sessionStorage auth into localStorage (one-time per browser).
 * Avoids split-brain where Tab A still has sessionStorage but Tab B reads localStorage.
 */
export function migrateSessionStorageAuth() {
  if (typeof window === 'undefined') return;

  const hasLocalAuth =
    getAuthItem(JWT_STORAGE_KEY) || getAuthItem(REFRESH_TOKEN_STORAGE_KEY);

  if (hasLocalAuth) {
    AUTH_KEYS.forEach((key) => sessionStorage.removeItem(key));
    return;
  }

  const hasSessionAuth = AUTH_KEYS.some((key) => sessionStorage.getItem(key));
  if (!hasSessionAuth) return;

  AUTH_KEYS.forEach((key) => {
    const value = sessionStorage.getItem(key);
    if (value != null) {
      localStorage.setItem(key, value);
    }
    sessionStorage.removeItem(key);
  });
}

export { AUTH_KEYS, JWT_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY };
