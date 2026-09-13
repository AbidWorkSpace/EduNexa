import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

/**
 * Default post-login / dashboard entry path for this app shell.
 *
 * @returns {string}
 */
export function getDefaultRedirectPath() {
  return CONFIG.auth.redirectPath;
}
