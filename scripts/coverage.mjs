import { mkdtempSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, relative } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve('.');
const destination = process.argv[2] || 'coverage/native-summary.json';
const directory = mkdtempSync(join(tmpdir(), 'salles-coverage-'));
const run = spawnSync(process.execPath, [join(root, 'node_modules/vitest/vitest.mjs'), 'run'], {
  cwd: root, env: { ...process.env, SALLES_COVERAGE_DIR: directory }, stdio: 'inherit'
});
if (run.status !== 0) process.exit(run.status || 1);
const scripts = new Map();
for (const file of readdirSync(directory)) {
  for (const entry of JSON.parse(readFileSync(join(directory, file))).result || []) {
    const url = entry.url.replace(/^file:\/\//, '').split('?')[0];
    if (!url.startsWith(join(root, 'src') + '/')) continue;
    const key = relative(root, url);
    if (!scripts.has(key)) scripts.set(key, new Map());
    const functions = scripts.get(key);
    for (const fn of entry.functions) {
      if (!fn.functionName || fn.functionName === 'get' || fn.functionName === 'set') continue;
      const id = `${fn.functionName}:${fn.ranges[0].startOffset}`;
      const previous = functions.get(id);
      functions.set(id, { name: fn.functionName, hit: Boolean(previous?.hit || fn.ranges[0].count > 0) });
    }
  }
}
const files = [];
function walk(path) {
  for (const item of readdirSync(path, { withFileTypes: true })) {
    const p = join(path, item.name);
    if (item.isDirectory()) walk(p);
    else if (p.endsWith('.ts')) files.push(relative(root, p));
  }
}
walk(join(root, 'src'));
const rows = files.map((file) => {
  const functions = [...(scripts.get(file)?.values() || [])];
  return { file, loaded: scripts.has(file), namedFunctions: functions.length, hitFunctions: functions.filter((fn) => fn.hit).length, functions };
});
const report = {
  method: 'V8 Profiler.takePreciseCoverage avant destruction des workers ; fonctions nommées du code transpilé. Pas un pourcentage Istanbul de lignes/branches TS.',
  filesLoaded: rows.filter((row) => row.loaded).length, filesTotal: rows.length,
  functionsHit: rows.reduce((n, row) => n + row.hitFunctions, 0), functionsTotal: rows.reduce((n, row) => n + row.namedFunctions, 0), rows
};
mkdirSync(resolve(destination, '..'), { recursive: true });
writeFileSync(destination, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (report.filesLoaded === 0) process.exitCode = 1;
