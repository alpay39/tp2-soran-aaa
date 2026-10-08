import { spawnSync } from 'node:child_process';
import { appendFileSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

function runCheck(strict, cwd) {
  const command = strict ? ['run', 'verify'] : ['run', 'check:advisory'];
  const result = spawnSync('npm', command, { cwd, encoding: 'utf8', timeout: 120000 });
  return { code: result.status ?? 1, output: (result.stdout || '') + (result.stderr || ''), command: ['npm', ...command] };
}

/** Traite un événement Codex ; le runner injectable sert aux tests de contrat isolés. */
export function handleEvent(event, runner = runCheck) {
  const name = event.hook_event_name;
  const command = event.tool_input?.command || '';
  if (name === 'PreToolUse') {
    if (/\bgit\b[^\n;&|]*\b(push|commit|reset\s+--hard|clean)\b|\bsudo\b|\brm\s+-[^\n]*r/.test(command)) {
      return { hookSpecificOutput: { hookEventName: name, permissionDecision: 'deny', permissionDecisionReason: 'Livraison/destruction interdite dans la session TP ; autorisation humaine requise hors de cette exécution.' } };
    }
    return {};
  }
  const tool = event.tool_name || '';
  if (name === 'PostToolUse') {
    const patch = /apply_patch|Edit|Write/.test(tool);
    const shellWrite = /Bash|exec_command/.test(tool) && /\b(tee|cp|mv|python3?|node)\b|>|apply_patch/.test(command);
    if (!patch && !shellWrite) return {};
    // Pas de boucle à travers les propres contrôles.
    if (/npm run (verify|check)|scripts\/codex-hooks/.test(command)) return {};
    const result = runner(false, event.cwd);
    return { hookSpecificOutput: { hookEventName: name, additionalContext: 'Contrôles informatifs post-écriture (une sortie verte ne remplace pas verify) :\n' + result.output.slice(-9000) } };
  }
  if (name === 'Stop') {
    const result = runner(true, event.cwd);
    if (result.code !== 0) return { decision: 'block', reason: 'Validation finale échouée ; corriger ou rapporter précisément le blocage.\n' + result.output.slice(-9000) };
    return { systemMessage: 'Validation finale bloquante réussie : npm run verify.' };
  }
  return {};
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const event = JSON.parse(readFileSync(0, 'utf8') || '{}');
  const result = handleEvent(event);
  const root = event.cwd || process.cwd();
  mkdirSync(resolve(root, '.codex/scratch'), { recursive: true });
  appendFileSync(resolve(root, '.codex/scratch/hook-events.jsonl'), JSON.stringify({ time: new Date().toISOString(), event: event.hook_event_name, tool: event.tool_name, outcome: result.decision || result.hookSpecificOutput?.permissionDecision || 'reported' }) + '\n');
  console.log(JSON.stringify(result));
}
