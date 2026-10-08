import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ChecksPlugin } from '../../.opencode/plugin/checks.js';
import { handleEvent } from '../../scripts/codex-hooks.mjs';

test('post-écriture informatif : contrôle exécuté et erreur visible', () => {
  let called = false;
  const output = handleEvent({ hook_event_name: 'PostToolUse', tool_name: 'apply_patch', cwd: '/tmp' }, (strict) => {
    called = true; assert.equal(strict, false); return { code: 1, output: 'ECHEC types' };
  });
  assert.ok(called);
  assert.match(output.hookSpecificOutput.additionalContext, /ECHEC types/);
  assert.equal(output.decision, undefined);
});
test('Stop bloque un faux résultat vert annoncé par un agent', () => {
  const result = handleEvent({ hook_event_name: 'Stop', cwd: '/tmp' }, (strict) => {
    assert.equal(strict, true); return { code: 1, output: '1 failed' };
  });
  assert.equal(result.decision, 'block');
  assert.match(result.reason, /1 failed/);
});
test('Stop accepte les contrôles effectivement verts', () => {
  assert.equal(handleEvent({ hook_event_name: 'Stop' }, () => ({ code: 0, output: 'OK' })).decision, undefined);
});
test('PreToolUse bloque le push sans toucher au réseau', () => {
  const result = handleEvent({ hook_event_name: 'PreToolUse', tool_input: { command: 'git -C /tmp push origin main' } });
  assert.equal(result.hookSpecificOutput.permissionDecision, 'deny');
  assert.deepEqual(handleEvent({ hook_event_name: 'PreToolUse', tool_input: { command: 'git diff' } }), {});
});
test('les lectures seules ne relancent pas les checks', () => {
  assert.deepEqual(handleEvent({ hook_event_name: 'PostToolUse', tool_name: 'Bash', tool_input: { command: 'rg availability src' } }, () => { throw new Error('ne doit pas tourner'); }), {});
});
test('plugin OpenCode : patch et bash passent par le filet, sans boucle', async () => {
  let calls = 0;
  const $ = () => { calls++; return { cwd: () => ({ quiet: async () => ({ stdout: Buffer.from('ECHEC volontaire') }) }) }; };
  const plugin = await ChecksPlugin({ $, directory: '/tmp' });
  const output = { output: 'écrit' };
  await plugin['tool.execute.after']({ tool: 'apply_patch', args: {} }, output);
  assert.equal(calls, 1); assert.match(output.output, /ECHEC volontaire/);
  await plugin['tool.execute.after']({ tool: 'bash', args: { command: 'npm run check' } }, output);
  assert.equal(calls, 1);
});
