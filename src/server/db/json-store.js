import path from 'node:path';
import { promises as fs } from 'node:fs';

// ----------------------------------------------------------------------
// POC-ONLY persistence: flat JSON files under /data, read/written with Node's
// fs module from Route Handlers (Node.js runtime, not Edge).
//
// This stands in for a real database until one is introduced. No schema
// migrations, no transactions, no concurrent-writer safety beyond the
// single-process write queue below. Swap for a real ORM/DB by reimplementing
// the functions in src/server/db/*.js — callers (API routes) do not need to
// change, since they only depend on the repository functions, not on how
// the data is stored.
// ----------------------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), 'data');

// Per-file write queues, so concurrent writes to the same file serialize
// instead of racing and corrupting the JSON (a real DB would give us this
// for free via transactions).
const writeQueues = new Map();

function queueWrite(filePath, task) {
  const previous = writeQueues.get(filePath) ?? Promise.resolve();
  const next = previous.then(task, task);
  writeQueues.set(
    filePath,
    next.catch(() => {})
  );
  return next;
}

export async function readJsonFile(fileName, fallback = []) {
  const filePath = path.join(DATA_DIR, fileName);
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    if (error?.code === 'ENOENT') return fallback;
    throw error;
  }
}

export async function writeJsonFile(fileName, data) {
  const filePath = path.join(DATA_DIR, fileName);
  return queueWrite(filePath, async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  });
}
