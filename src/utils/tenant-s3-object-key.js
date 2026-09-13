/**
 * Tenant-scoped S3 object keys returned by presigned/direct upload (e.g. `items/...`).
 * Folder names must stay aligned with `getPresignedUrls` / multipart `folder` in
 * `src/store/api/s3-upload-api.js` (items).
 */

/** @readonly */
export const TENANT_S3_OBJECT_KEY_PREFIXES = Object.freeze([
  'items/'
]);

/**
 * @param {unknown} value
 * @returns {boolean}
 */
export function isTenantS3ObjectKey(value) {
  return (
    typeof value === 'string' &&
    TENANT_S3_OBJECT_KEY_PREFIXES.some((prefix) => value.startsWith(prefix))
  );
}
