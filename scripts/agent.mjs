import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const root = resolve('.');
const roles = new Set(['finder', 'explorer', 'planner', 'dev', 'tester', 'reviewer']);
const role = process.argv[2];
if (!roles.has(role)) throw new Error('Rôle requis : finder, explorer, planner, dev, tester ou reviewer');
const profile = readFileSync(join(root, '.codex/agents', role + '.toml'), 'utf8');
const sandbox = profile.match(/^sandbox_mode = "([\w-]+)"$/m)?.[1];
const instructions = profile.match(/developer_instructions = """\n([\s\S]*?)\n"""/m)?.[1];
if (!['read-only', 'workspace-write'].includes(sandbox) || !instructions) throw new Error('Profil invalide');
if (process.argv[3] === '--validate') {
  console.log(JSON.stringify({ role, sandbox, profile: '.codex/agents/' + role + '.toml' }));
  process.exit(0);
}
const brief = process.argv.slice(3).join(' ');
if (!brief) throw new Error('Brief autonome manquant');
const id = randomUUID();
const directory = join(root, '.codex/scratch/agents', role + '-' + id);
mkdirSync(directory, { recursive: true });
const project = readFileSync(join(root, '.codex/config.toml'), 'utf8');
const model = project.match(/^model = "([^"]+)"$/m)?.[1] || 'gpt-5.5';
const args = ['exec', '--strict-config', '--ignore-user-config',
  '-c', 'approval_policy="on-request"', '-c', 'approvals_reviewer="auto_review"',
  '--dangerously-bypass-hook-trust', '--json', '-m', model, '-s', sandbox,
  '-c', 'projects.' + JSON.stringify(root) + '.trust_level="trusted"',
  '-c', 'developer_instructions=' + JSON.stringify(instructions),
  '-C', root, '-o', join(directory, 'response.md'),
  `Dossier de travail : ${root}. Rôle : ${role}.\n${brief}\nNe lis pas captures/. Aucun commit ni push.`];
console.log(`Session Codex indépendante · rôle=${role} · sandbox=${sandbox}`);
const started = new Date().toISOString();
const run = spawnSync('codex', args, { cwd: root, encoding: 'utf8', timeout: 600000, maxBuffer: 12 * 1024 * 1024, input: '' });
writeFileSync(join(directory, 'events.jsonl'), run.stdout || '');
writeFileSync(join(directory, 'stderr.txt'), run.stderr || '');
writeFileSync(join(directory, 'invocation.json'), JSON.stringify({ role, sandbox, model, profile: '.codex/agents/' + role + '.toml', started, ended: new Date().toISOString(), exitCode: run.status, freshSession: true, parentResumed: false }, null, 2));
console.log('Preuves : ' + directory);
if (run.error) console.error(run.error.message);
try { console.log(readFileSync(join(directory, 'response.md'), 'utf8')); }
catch { console.error('Aucune réponse finale. Voir les événements et stderr.'); }
if (run.status !== 0) process.exitCode = run.status || 1;
