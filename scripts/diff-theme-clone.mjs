/**
 * Compare key shared paths between this theme clone and PROJECT_NAME.
 * Run from clone root: node scripts/diff-theme-clone.mjs
 */
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLONE_ROOT = path.resolve(__dirname, '..');
const POS_ROOT = path.resolve(CLONE_ROOT, '..', 'PROJECT_NAME');

const WATCH_PATHS = [
  'src/components/custom-table',
  'src/components/hook-form/custom-form-elements.jsx',
  'src/components/image-preview',
  'src/components/iconify/icon-sets.js',
  'src/utils/api-error-message.js',
  'src/utils/format-number.js',
  'src/utils/tenant-s3-object-key.js',
  'src/schemas/fields.js',
  'src/store/api/base-api.js',
  'src/layouts/hooks',
  'src/layouts/sidebar/components',
  'src/auth/context/jwt/auth-storage.js',
  'eslint.config.mjs',
];

function hashFile(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex').slice(0, 12);
}

function collectFiles(root, relPath) {
  const abs = path.join(root, relPath);
  if (!fs.existsSync(abs)) return [];

  const stat = fs.statSync(abs);
  if (stat.isFile()) return [relPath.replace(/\\/g, '/')];

  const files = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const child = path.join(relPath, entry.name).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      files.push(...collectFiles(root, child));
    } else {
      files.push(child);
    }
  }
  return files.sort();
}

function statusFor(rel) {
  const posPath = path.join(POS_ROOT, rel);
  const clonePath = path.join(CLONE_ROOT, rel);

  if (!fs.existsSync(posPath)) return { rel, status: 'NO_POS' };
  if (!fs.existsSync(clonePath)) return { rel, status: 'MISSING_CLONE' };

  const posHash = hashFile(posPath);
  const cloneHash = hashFile(clonePath);
  if (posHash === cloneHash) return { rel, status: 'SAME' };
  return { rel, status: 'DIFF', posHash, cloneHash };
}

if (!fs.existsSync(POS_ROOT)) {
  console.error(`POS repo not found at ${POS_ROOT}`);
  process.exit(1);
}

const allFiles = new Set();
for (const watch of WATCH_PATHS) {
  for (const rel of collectFiles(POS_ROOT, watch)) {
    allFiles.add(rel);
  }
  for (const rel of collectFiles(CLONE_ROOT, watch)) {
    allFiles.add(rel);
  }
}

const rows = [...allFiles].sort().map(statusFor);
const counts = rows.reduce(
  (acc, row) => {
    acc[row.status] = (acc[row.status] || 0) + 1;
    return acc;
  },
  {}
);

console.log(`POS:   ${POS_ROOT}`);
console.log(`Clone: ${CLONE_ROOT}\n`);

for (const row of rows) {
  if (row.status === 'DIFF') {
    console.log(`DIFF  ${row.rel}  pos=${row.posHash} clone=${row.cloneHash}`);
  } else if (row.status !== 'SAME') {
    console.log(`${row.status.padEnd(14)} ${row.rel}`);
  }
}

console.log('\nSummary:', counts);
const drift = (counts.DIFF || 0) + (counts.MISSING_CLONE || 0);
if (drift === 0) {
  console.log('All watched paths match POS.');
} else {
  console.log(`${drift} path(s) still differ from POS.`);
  process.exitCode = 1;
}
