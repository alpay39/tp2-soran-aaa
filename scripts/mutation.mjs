import { mkdtempSync, cpSync, symlinkSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

const root = resolve(process.argv[2] || '.');
const destination = process.argv[3] || 'coverage/mutation.json';
const definitions = [
  ['overlap-faux', 'src/lib/overlap.ts', /return a1 < b2 && b1 < a2;/, 'return false;'],
  ['prix-base-zero', 'src/lib/price.ts', /const base = room.hourlyRate \* hoursBetween\(startsAt, endsAt\);/, 'const base = 0;'],
  ['prix-sans-majoration', 'src/lib/price.ts', /return base \+ WEEKEND_SURCHARGE;/, 'return base;'],
  ['store-premiere-salle', 'src/store.ts', /return rooms.find\(\(r\) => r.id === id\);/, 'return rooms[0];'],
  ['store-reservations-vides', 'src/store.ts', /return bookings.filter\(\(b\) => b.roomId === roomId\);/, 'return [];'],
  ['validation-zero-accepte', 'src/lib/validate.ts', / \|\| value <= 0/, '']
];
const results = [];
for (const [name, file, pattern, replacement] of definitions) {
  const directory = mkdtempSync(join(tmpdir(), 'salles-mutant-'));
  for (const path of ['src', 'test', 'package.json', 'vitest.config.ts', 'tsconfig.json']) cpSync(join(root, path), join(directory, path), { recursive: true });
  symlinkSync(join(root, 'node_modules'), join(directory, 'node_modules'), 'dir');
  const target = join(directory, file);
  const before = readFileSync(target, 'utf8');
  if (!pattern.test(before)) throw new Error(`mutation introuvable : ${name}`);
  writeFileSync(target, before.replace(pattern, replacement));
  const run = spawnSync(process.execPath, [join(root, 'node_modules/vitest/vitest.mjs'), 'run'], { cwd: directory, encoding: 'utf8', timeout: 60000 });
  // Une erreur d'infrastructure n'est jamais comptée comme une mutation tuée.
  const combined = (run.stdout || '') + (run.stderr || '');
  const killed = run.status !== 0 && /AssertionError|expected .* to|toThrow/.test(combined);
  const verdict = killed ? 'TUE' : run.status === 0 ? 'SURVIT' : 'ERREUR';
  results.push({ name, file, verdict, exitCode: run.status, output: combined });
  console.log(`${name}: ${verdict}`);
}
mkdirSync(resolve(destination, '..'), { recursive: true });
writeFileSync(destination, JSON.stringify({ method: 'Six mutations ciblées, copies isolées ; score limité à ces six erreurs', killed: results.filter((r) => r.verdict === 'TUE').length, total: results.length, results }, null, 2));
if (results.some((r) => r.verdict !== 'TUE')) process.exitCode = 1;
