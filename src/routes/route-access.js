import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------
// Single source of truth for route access: protected / moderate / public.
// Key-based config; all path values come from paths.js (no raw path strings).
// ----------------------------------------------------------------------

const ROUTE_ACCESS_CONFIG = {
  protectedPathKeys: ['dashboard'],
  moderatePathKeys: ['comingSoon', 'page403', 'page404', 'page500'],
};

function getResolvedRouteAccess() {
  const protectedPrefixes = ROUTE_ACCESS_CONFIG.protectedPathKeys
    .map((key) => paths[key]?.root)
    .filter(Boolean);

  const moderatePaths = ROUTE_ACCESS_CONFIG.moderatePathKeys
    .map((key) => paths[key])
    .filter(Boolean);

  return { protectedPrefixes, moderatePaths };
}

const { protectedPrefixes, moderatePaths } = getResolvedRouteAccess();

/**
 * Normalize pathname for consistent matching: trim trailing slash, ensure leading slash.
 * @param {string} pathname
 * @returns {string}
 */
export function normalizePathname(pathname) {
  if (typeof pathname !== 'string') return '/';
  const trimmed = pathname.trim().replace(/\/+$/, '') || '/';
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

/**
 * @param {string} pathname
 * @returns {'protected' | 'moderate' | 'public'}
 */
export function getRouteAccess(pathname) {
  const normalized = normalizePathname(pathname);

  const isProtected = protectedPrefixes.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`)
  );
  if (isProtected) return 'protected';

  const isModerate = moderatePaths.includes(normalized);
  if (isModerate) return 'moderate';

  return 'public';
}

/**
 * @param {string} pathname
 * @returns {boolean}
 */
export function isProtectedPath(pathname) {
  return getRouteAccess(pathname) === 'protected';
}

/**
 * @param {string} pathname
 * @returns {boolean}
 */
export function isModeratePath(pathname) {
  return getRouteAccess(pathname) === 'moderate';
}
