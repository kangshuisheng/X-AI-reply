#!/usr/bin/env node
// Cross-platform version updater for all package.json files in the monorepo
// Usage: node bash-scripts/update_version.mjs 0.6.0

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fg from 'fast-glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const newVersion = process.argv[2];

const isValidSemver = v => /^(\d+)\.(\d+)\.(\d+)(?:[-+][0-9A-Za-z.-]+)?$/.test(v);

async function readJson(file) {
  const content = await fs.readFile(file, 'utf8');
  return JSON.parse(content);
}

async function writeJson(file, obj) {
  const content = JSON.stringify(obj, null, 2) + '\n';
  await fs.writeFile(file, content, 'utf8');
}

async function main() {
  if (!newVersion) {
    console.error('Usage: pnpm update-version <new_version>');
    process.exit(1);
  }
  if (!isValidSemver(newVersion)) {
    console.error(`Version format <${newVersion}> isn't correct, proper format is <0.0.0>`);
    process.exit(1);
  }

  // Find all package.json files excluding node_modules and build artifacts
  const patterns = ['**/package.json'];
  const ignore = ['**/node_modules/**', '**/dist/**', '**/.turbo/**'];
  const cwd = ROOT;
  const files = await fg(patterns, { cwd, ignore, dot: true, onlyFiles: true });

  let updated = 0;
  for (const rel of files) {
    const file = path.join(cwd, rel);
    try {
      const json = await readJson(file);
      if (json && typeof json === 'object' && 'version' in json) {
        if (json.version !== newVersion) {
          json.version = newVersion;
          await writeJson(file, json);
          updated++;
          // eslint-disable-next-line no-console
          console.log(`Updated ${rel} -> ${newVersion}`);
        }
      }
    } catch (e) {
      console.warn(`Skipped ${rel}: ${e.message}`);
    }
  }

  if (updated === 0) {
    console.log('No package.json files needed updating.');
  } else {
    console.log(`Updated versions to ${newVersion} in ${updated} files`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
