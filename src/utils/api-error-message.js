/**
 * Fixed copy for HTTP 403 (and permission-like 5xx) in toasts and inline error UI.
 * Not overridable via getApiErrorMessage options — keeps permission messaging consistent app-wide.
 */
export const API_FORBIDDEN_MESSAGE = "You don't have permission to perform this action.";

/**
 * Generic API error message helper for RTK Query / API errors.
 * Use in list views (mutation catch), form dialogs (submit catch), and details dialogs (query error).
 *
 * BE message wins when present; otherwise generic/options are used.
 * Exception: HTTP 403 always returns {@link API_FORBIDDEN_MESSAGE} (BE body and forbidden/noContext options ignored).
 * Supported BE response keys (in order): message, detail, error, title, raw string, errors (object/array).
 *
 * @param {unknown} err - RTK Query / API error (from .unwrap() catch or query error)
 * @param {{ defaultMessage?: string, notFoundMessage?: string, validationMessage?: string, noContextMessage?: string }} [options]
 * @returns {{ message: string, isRetryable: boolean }}
 */
export function getApiErrorMessage(err, options = {}) {
  const {
    defaultMessage = 'An error occurred',
    notFoundMessage,
    validationMessage,
    noContextMessage,
  } = options;

  const networkMessage = 'Network error. Please check your connection.';
  const serverMessage = 'Server error. Please try again later.';

  // 1. Offline (SSR-safe)
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { message: networkMessage, isRetryable: true };
  }

  // 2. RTK no-response (FETCH_ERROR, TIMEOUT, PARSING_ERROR)
  const rtkNoResponse =
    !err?.data &&
    ['FETCH_ERROR', 'TIMEOUT', 'PARSING_ERROR'].includes(err?.status);
  if (rtkNoResponse) {
    return { message: networkMessage, isRetryable: true };
  }

  const status = err?.status ?? err?.data?.status;

  const raw =
    err?.data?.message ??
    err?.data?.detail ??
    err?.data?.error ??
    err?.data?.title ??
    (typeof err?.data === 'string' ? err.data : err?.data?.errors);

  const dataMessage = normalizeToMessage(raw);
  const rethrowMessage =
    typeof err?.message === 'string' && err.message.trim()
      ? err.message.trim()
      : null;
  const fallbackMessage = dataMessage || rethrowMessage;

  // 3. 404
  if (status === 404) {
    return {
      message: fallbackMessage || notFoundMessage || defaultMessage,
      isRetryable: false,
    };
  }

  // 4. 400
  if (status === 400) {
    return {
      message: fallbackMessage || validationMessage || defaultMessage,
      isRetryable: false,
    };
  }

  // 4b. 401 (e.g. invalid credentials, disabled account, session expired)
  if (status === 401) {
    return {
      message: fallbackMessage || defaultMessage,
      isRetryable: false,
    };
  }

  // 4b2. 429 Too Many Requests (e.g. global rate limiter on Print API per IP/method/path)
  if (status === 429) {
    return {
      message:
        fallbackMessage ||
        'Too many requests. Please wait a minute and try again.',
      isRetryable: true,
    };
  }

  // 4c. 403 Forbidden (permission denied or missing context e.g. no tenant/tenant master)
  if (status === 403) {
    return {
      message: API_FORBIDDEN_MESSAGE,
      isRetryable: false,
    };
  }

  // 4d. 503 Service Unavailable (e.g. S3 not configured or unavailable)
  if (status === 503) {
    return {
      message: fallbackMessage || defaultMessage,
      isRetryable: true,
    };
  }

  // 5. 5xx
  if (typeof status === 'number' && status >= 500) {
    const lowerMessage =
      (fallbackMessage && String(fallbackMessage).toLowerCase()) || '';
    const isTenantContext = lowerMessage.includes('tenant context');
    const isNotFound = lowerMessage.includes('not found');
    const isPermissionLike =
      lowerMessage.includes('permission') ||
      lowerMessage.includes('access denied') ||
      lowerMessage.includes('do not have access');
    if (isTenantContext && noContextMessage) {
      return { message: noContextMessage, isRetryable: false };
    }
    if (isNotFound && notFoundMessage) {
      return { message: notFoundMessage, isRetryable: false };
    }
    if (isPermissionLike) {
      return {
        message: API_FORBIDDEN_MESSAGE,
        isRetryable: false,
      };
    }
    return { message: fallbackMessage || serverMessage, isRetryable: true };
  }

  // 6. Else
  return {
    message: fallbackMessage || defaultMessage,
    isRetryable: false,
  };
}

/**
 * Normalize BE response value to a single display string.
 * Handles: string (skip HTML), array of strings/objects, object (e.g. errors by field).
 *
 * @param {unknown} raw - Value from err.data (message, detail, error, title, errors)
 * @returns {string | null} Safe string or null
 */
function normalizeToMessage(raw) {
  if (raw == null) return null;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('<')) return null;
    return trimmed || null;
  }
  if (Array.isArray(raw)) {
    const first = raw[0];
    if (first == null) return null;
    if (typeof first === 'string') return first.trim() || null;
    if (typeof first === 'object' && first !== null && typeof first.message === 'string') {
      return first.message.trim() || null;
    }
    const joined = raw
      .map((x) => (typeof x === 'string' ? x : x?.message))
      .filter(Boolean)
      .join('; ');
    return joined || null;
  }
  if (typeof raw === 'object') {
    const keys = Object.keys(raw);
    for (let i = 0; i < keys.length; i += 1) {
      const val = raw[keys[i]];
      if (Array.isArray(val) && val[0] != null) {
        const first = val[0];
        const str = typeof first === 'string' ? first : first?.message;
        if (typeof str === 'string' && str.trim()) return str.trim();
      }
    }
    return 'Validation failed';
  }
  return null;
}
