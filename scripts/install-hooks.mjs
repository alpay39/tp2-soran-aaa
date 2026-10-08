import { spawnSync } from 'node:child_process';
import { chmodSync } from 'node:fs';
if (!process.env.CI) {
  const result = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' });
  if (result.status === 0 && result.stdout.trim() === process.cwd()) {
    const existing = spawnSync('git', ['config', '--local', '--get', 'core.hooksPath'], { encoding: 'utf8' }).stdout.trim();
    if (existing && existing !== '.githooks') throw new Error(`hooksPath existant conservé : ${existing}`);
    chmodSync('.githooks/pre-commit', 0o755);
    const installed = spawnSync('git', ['config', '--local', 'core.hooksPath', '.githooks'], { stdio: 'inherit' });
    if (installed.status !== 0) process.exit(installed.status || 1);
    console.log('Hook pre-commit installé : .githooks (aucun commit effectué).');
  }
}
