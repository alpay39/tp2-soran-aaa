import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { randomUUID } from 'node:crypto';

const task = process.argv.slice(2).join(' ');
if (!task) throw new Error('Consigne exacte manquante');
const root = resolve('.');
const directory = join(root, '.codex/scratch/chains', randomUUID());
mkdirSync(directory, { recursive: true });
const results = [];
function delegate(role, brief) {
  console.log(`\n=== ${role} : session Codex neuve ===`);
  const run = spawnSync(process.execPath, ['scripts/agent.mjs', role, brief], { cwd: root, encoding: 'utf8', timeout: 660000, maxBuffer: 12 * 1024 * 1024 });
  const output = (run.stdout || '') + (run.stderr || '');
  writeFileSync(join(directory, role + '.txt'), output);
  console.log(output);
  results.push({ role, exitCode: run.status, output });
  if (run.status !== 0) throw new Error(`${role} a échoué ; arrêt sans annoncer de succès`);
  return output;
}
try {
  // La tâche métier est transmise littéralement à dev, sans aide ni reformulation.
  delegate('dev', task);
  const qa = delegate('tester', `Vérifie la tâche suivante sur le code présent : ${task}\nExécute les tests existants et le parcours HTTP correspondant. Ne corrige aucun fichier. Rapporte les résultats et limites réels.`);
  if (!/^VERDICT:\s*PASS\s*$/m.test(qa)) throw new Error('Le tester n’a pas prouvé la réussite ; arrêt avant livraison');
  const review = delegate('reviewer', `Examine indépendamment l'implémentation de cette tâche : ${task}\nLis les fichiers concernés et leurs tests, puis git diff et git status --short (incluant les nouveaux fichiers). La livraison évaluée est le dossier complet, sans commit ni push autorisé. Ne corrige aucun fichier. Donne un scénario concret pour chaque défaut et termine par le verdict prévu dans ton profil.`);
  if (!/^VERDICT:\s*NOTHING FOUND\s*$/m.test(review)) throw new Error('Revue non concluante ou bloquante ; nouvelle étape dev requise');
  const verify = spawnSync('npm', ['run', 'verify'], { cwd: root, encoding: 'utf8', timeout: 180000 });
  console.log((verify.stdout || '') + (verify.stderr || ''));
  results.push({ role: 'validation', exitCode: verify.status });
  if (verify.status !== 0) throw new Error('Validation finale rouge');
  console.log('CHAINE VALIDEE : dev, tester, reviewer indépendants, puis verify réel.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  writeFileSync(join(directory, 'result.json'), JSON.stringify({ task, root, freshSessions: true, results }, null, 2));
  console.log('PREUVES CHAINE : ' + directory);
}
