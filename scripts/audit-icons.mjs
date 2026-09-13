import fs from 'fs';
import path from 'path';

const registered = new Set();
const sets = fs.readFileSync('src/components/iconify/icon-sets.js', 'utf8');
for (const m of sets.matchAll(/^  '([^']+)':/gm)) registered.add(m[1]);

const knownPrefixes = new Set([...registered].map((key) => key.split(':')[0]));

const iconRe =
  /icon=["']([^"']+)["']|icon:\s*["']([^"']+)["']|startIcon:\s*["']([^"']+)["']|icon\(\s*['"]([^'"]+)['"]\s*\)|['"]([a-z0-9-]+:[a-z0-9-]+)['"]/gi;

const used = new Map();

function isLikelyIconifyName(icon) {
  if (!icon || !icon.includes(':')) return false;
  const [prefix] = icon.split(':');
  return knownPrefixes.has(prefix);
}

function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (f.name === 'node_modules' || f.name === '.next') continue;
      walk(p);
    } else if (/\.(jsx|js|tsx|ts)$/.test(f.name)) {
      const rel = p.replace(/\\/g, '/');
      if (rel.includes('sections/_examples')) continue;
      if (rel.includes('components/iconify/icon-sets.js')) continue;
      const c = fs.readFileSync(p, 'utf8');
      let m;
      while ((m = iconRe.exec(c))) {
        const icon = m[1] || m[2] || m[3] || m[4] || m[5];
        if (
          !icon ||
          icon.includes('${') ||
          icon.startsWith('icon.') ||
          icon.includes('assets/') ||
          icon.includes('.svg') ||
          !isLikelyIconifyName(icon)
        ) {
          continue;
        }
        if (!used.has(icon)) used.set(icon, new Set());
        used.get(icon).add(rel);
      }
    }
  }
}

walk('src');

const missing = [...used.keys()].filter((i) => !registered.has(i)).sort();

console.log(
  JSON.stringify(
    {
      registered: registered.size,
      used: used.size,
      missingCount: missing.length,
      missing,
      missingDetails: Object.fromEntries(missing.map((icon) => [icon, [...used.get(icon)]])),
    },
    null,
    2
  )
);
