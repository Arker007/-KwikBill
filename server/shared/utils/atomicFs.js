import fs from 'fs';
import path from 'path';

/**
 * Writes data to a temporary file `<filePath>.tmp` then renames it synchronously over the target.
 * Ensures mid-write crashes or power interruptions do not leave truncated or corrupt files on disk.
 * @param {string} filePath
 * @param {string|Buffer} contents
 * @param {string} [encoding='utf-8']
 */
export function writeFileAtomic(filePath, contents, encoding = 'utf-8') {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const tmpPath = `${filePath}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}.tmp`;
  fs.writeFileSync(tmpPath, contents, encoding);
  fs.renameSync(tmpPath, filePath);
}

/**
 * Writes data to a temporary file then renames it asynchronously over the target.
 * @param {string} filePath
 * @param {string|Buffer} contents
 * @param {string} [encoding='utf-8']
 * @returns {Promise<void>}
 */
export async function writeFileAtomicAsync(filePath, contents, encoding = 'utf-8') {
  const dir = path.dirname(filePath);
  await fs.promises.mkdir(dir, { recursive: true });

  const tmpPath = `${filePath}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}.tmp`;
  await fs.promises.writeFile(tmpPath, contents, encoding);
  await fs.promises.rename(tmpPath, filePath);
}

/**
 * Safely reads and parses a JSON file synchronously.
 * Returns `fallback` if file does not exist or fails to parse.
 * @param {string} filePath
 * @param {*} [fallback=null]
 * @returns {*}
 */
export function readJsonSafe(filePath, fallback = null) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return fallback;
  }
}

/**
 * Safely reads and parses a JSON file asynchronously.
 * Returns `fallback` if file does not exist or fails to parse.
 * @param {string} filePath
 * @param {*} [fallback=null]
 * @returns {Promise<*>}
 */
export async function readJsonSafeAsync(filePath, fallback = null) {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return fallback;
  }
}

/**
 * Safely writes a JSON object atomically with 2-space indentation synchronously.
 * @param {string} filePath
 * @param {*} data
 */
export function writeJsonAtomic(filePath, data) {
  const serialized = JSON.stringify(data, null, 2);
  writeFileAtomic(filePath, serialized, 'utf-8');
}

/**
 * Safely writes a JSON object atomically with 2-space indentation asynchronously.
 * @param {string} filePath
 * @param {*} data
 * @returns {Promise<void>}
 */
export async function writeJsonAtomicAsync(filePath, data) {
  const serialized = JSON.stringify(data, null, 2);
  await writeFileAtomicAsync(filePath, serialized, 'utf-8');
}

/**
 * Deletes a file synchronously without throwing if the file does not exist.
 * @param {string} filePath
 */
export function deleteFileSafe(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // Suppress unlink error
  }
}

/**
 * Deletes a file asynchronously without throwing if the file does not exist.
 * @param {string} filePath
 * @returns {Promise<void>}
 */
export async function deleteFileSafeAsync(filePath) {
  try {
    await fs.promises.unlink(filePath);
  } catch {
    // Suppress unlink error
  }
}
