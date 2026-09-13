import axios from 'src/lib/axios';

import {
  getAuthItem,
  setAuthItem,
  removeAuthItem,
  clearAuthStorage,
} from './auth-storage';
import {
  JWT_STORAGE_KEY,
  USER_STORAGE_KEY,
  EXPIRES_AT_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
} from './constant';

// ----------------------------------------------------------------------

export function jwtDecode(token) {
  try {
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length < 2) {
      throw new Error('Invalid token!');
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(base64));

    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

export function isValidToken(accessToken) {
  if (!accessToken) {
    return false;
  }

  try {
    const decoded = jwtDecode(accessToken);

    if (!decoded || !('exp' in decoded)) {
      return false;
    }

    const currentTime = Date.now() / 1000;

    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Error during token validation:', error);
    return false;
  }
}

// ----------------------------------------------------------------------

export function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  return getAuthItem(REFRESH_TOKEN_STORAGE_KEY);
}

// ----------------------------------------------------------------------

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = getAuthItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ----------------------------------------------------------------------

export function replaceStoredUser(user) {
  if (typeof window === 'undefined' || !user || typeof user !== 'object') return;
  setAuthItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function updateStoredUser(partial) {
  if (typeof window === 'undefined' || !partial || typeof partial !== 'object') return;
  const user = getStoredUser();
  if (!user) return;
  setAuthItem(USER_STORAGE_KEY, JSON.stringify({ ...user, ...partial }));
}

// ----------------------------------------------------------------------

export function getExpiresAt() {
  if (typeof window === 'undefined') return null;
  return getAuthItem(EXPIRES_AT_STORAGE_KEY);
}

export function parseExpiresAtToMs(expiresAt) {
  if (!expiresAt) return null;
  const t = new Date(expiresAt).getTime();
  return Number.isFinite(t) ? t : null;
}

export function getAccessTokenExpiryMsForScheduling() {
  if (typeof window === 'undefined') return null;
  const accessToken = getAuthItem(JWT_STORAGE_KEY);
  if (accessToken) {
    try {
      const decoded = jwtDecode(accessToken);
      if (decoded?.exp != null && Number.isFinite(Number(decoded.exp))) {
        return Number(decoded.exp) * 1000;
      }
    } catch {
      // fall through to expiresAt
    }
  }
  return parseExpiresAtToMs(getExpiresAt());
}

// ----------------------------------------------------------------------

export function clearSession() {
  clearAuthStorage();
  delete axios.defaults.headers.common.Authorization;
}

// ----------------------------------------------------------------------

function mergeUserOnTokenRefresh(existingUser, loginUser) {
  if (!existingUser || !loginUser) return loginUser;

  return {
    ...existingUser,
    ...loginUser,
    permissions: existingUser.permissions ?? loginUser.permissions ?? [],
  };
}

/**
 * Set session from login/refresh response or from single accessToken (legacy).
 *
 * @param {string|object} accessTokenOrResponse - Access token string or full LoginResponse
 * @param {object} [opts] - If first arg is string: { refreshToken?, expiresAt?, user? }
 */
export async function setSession(accessTokenOrResponse, opts = {}) {
  try {
    if (!accessTokenOrResponse) {
      clearSession();
      return;
    }

    let accessToken;
    let refreshToken;
    let expiresAt;
    let user;

    if (typeof accessTokenOrResponse === 'string') {
      accessToken = accessTokenOrResponse;
      refreshToken = opts.refreshToken ?? null;
      expiresAt = opts.expiresAt ?? null;
      user = opts.user ?? null;
    } else {
      const res = accessTokenOrResponse;
      accessToken = res.accessToken ?? res.AccessToken;
      refreshToken = res.refreshToken ?? res.RefreshToken ?? null;
      expiresAt = res.expiresAt ?? res.ExpiresAt ?? null;
      const userId = res.userId ?? res.UserId;
      const email = res.email ?? res.Email;
      const userName = res.userName ?? res.UserName;
      const roles = res.roles ?? res.Roles ?? [];
      const permissions = res.permissions ?? res.Permissions ?? [];
      const schoolId = res.schoolId ?? res.SchoolId ?? null;
      user = {
        id: userId,
        userId,
        email,
        displayName: userName ?? email,
        userName,
        roles,
        permissions,
        schoolId,
      };
    }

    if (!accessToken) {
      clearSession();
      return;
    }

    setAuthItem(JWT_STORAGE_KEY, accessToken);
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

    if (refreshToken != null) {
      setAuthItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    } else {
      removeAuthItem(REFRESH_TOKEN_STORAGE_KEY);
    }

    if (expiresAt != null) {
      setAuthItem(EXPIRES_AT_STORAGE_KEY, expiresAt);
    } else {
      removeAuthItem(EXPIRES_AT_STORAGE_KEY);
    }

    if (user != null) {
      const existingUser = getStoredUser();
      const userToStore =
        existingUser && typeof accessTokenOrResponse === 'object'
          ? mergeUserOnTokenRefresh(existingUser, user)
          : user;
      setAuthItem(USER_STORAGE_KEY, JSON.stringify(userToStore));
    } else {
      removeAuthItem(USER_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error during set session:', error);
    throw error;
  }
}
