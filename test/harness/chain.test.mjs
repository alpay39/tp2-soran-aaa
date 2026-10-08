import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, cpSync, writeFileSync, chmodSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve('.');
test('le lanceur refuse un rôle qui pourrait sortir du dossier des profils', () => {
  const result = spawnSync(process.execPath, ['scripts/agent.mjs', '../dev', 'brief'], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Rôle requis/);
});
test('pipeline : un double CLI en échec arrête la chaîne avant tester et reviewer', () => {
  const directory = mkdtempSync(join(tmpdir(), 'salles-chain-contract-'));
  cpSync(join(root, 'scripts'), join(directory, 'scripts'), { recursive: true });
  cpSync(join(root, '.codex/agents'), join(directory, '.codex/agents'), { recursive: true });
  cpSync(join(root, '.codex/config.toml'), join(directory, '.codex/config.toml'));
  const bin = join(directory, 'bin');
  mkdirSync(bin);
  const calls = join(directory, 'calls.txt');
  const fake = join(bin, 'codex');
  writeFileSync(fake, '#!/bin/sh\necho invoked >> "$TP2_TEST_INVOCATIONS"\necho "Echec CLI volontaire 42" >&2\nexit 42\n');
  chmodSync(fake, 0o755);
  const result = spawnSync(process.execPath, ['scripts/chain.mjs', 'Consigne de test'], {
    cwd: directory, encoding: 'utf8', env: { ...process.env, PATH: bin + ':' + process.env.PATH, TP2_TEST_INVOCATIONS: calls }
  });
  assert.equal(result.status, 1);
  assert.equal(readFileSync(calls, 'utf8').trim(), 'invoked');
  assert.match(result.stderr, /dev a échoué/);
  assert.doesNotMatch(result.stdout, /CHAINE VALIDEE/);
  assert.ok(existsSync(join(directory, '.codex/scratch/chains')));
});

test('pipeline : un CLI vert sans verdict QA ne déclenche pas la revue', () => {
  const directory = mkdtempSync(join(tmpdir(), 'salles-verdict-contract-'));
  cpSync(join(root, 'scripts'), join(directory, 'scripts'), { recursive: true });
  cpSync(join(root, '.codex/agents'), join(directory, '.codex/agents'), { recursive: true });
  cpSync(join(root, '.codex/config.toml'), join(directory, '.codex/config.toml'));
  const bin = join(directory, 'bin');
  mkdirSync(bin);
  const calls = join(directory, 'calls.txt');
  const fake = join(bin, 'codex');
  writeFileSync(fake, `#!/bin/sh
out=''
while [ "$#" -gt 0 ]; do
  if [ "$1" = '-o' ]; then shift; out="$1"; fi
  shift
done
echo invoked >> "$TP2_TEST_INVOCATIONS"
echo 'Réponse sans verdict explicite' > "$out"
exit 0
`);
  chmodSync(fake, 0o755);
  const result = spawnSync(process.execPath, ['scripts/chain.mjs', 'Consigne de test'], {
    cwd: directory, encoding: 'utf8', env: { ...process.env, PATH: bin + ':' + process.env.PATH, TP2_TEST_INVOCATIONS: calls }
  });
  assert.equal(result.status, 1);
  assert.equal(readFileSync(calls, 'utf8').trim().split('\n').length, 2);
  assert.match(result.stderr, /tester n’a pas prouvé/);
  assert.doesNotMatch(result.stdout, /=== reviewer|CHAINE VALIDEE/);
});
