# salles-api — SORAN / AAA

Express + TypeScript ESM, stockage en mémoire (INFRA-140). Dates ISO UTC en string.
Les créneaux sont semi-ouverts : [début, fin[. Le supplément de week-end est 20 euros
par réservation, selon la date UTC de début.

## Commandes vérifiées

- `npm start` : API http://localhost:3000/health.
- `npm test` / `npm run test:unit` : tests nommés `test/**/*.spec.ts`.
- `npm run lint`, `npm run typecheck`, `npm run build` : contrôles et compilation dist/.
- `npm run check` : contrôles bloquants ; `npm run check:advisory` : sortie informative.
- `npm run verify` : contrôles, contrats du harness, mutations ciblées.
- `npm run test:coverage` : couverture native V8, méthode précisée dans le rapport.

## Conventions réelles

- `ValidationError` signale les entrées invalides ; les routes la traduisent en HTTP 400.
  Les erreurs inattendues remontent au middleware. La convention Result annoncée
  auparavant n'était pas implémentée ; pas de refonte générale des signatures.
- Imports relatifs avec `.js`. Un module par responsabilité dans `src/lib/`.
- Documenter les fonctions publiques nouvelles hors de `src/lib/` ; les conventions
  locales de `src/lib/AGENTS.md` priment dans ce dossier.
- Le stockage reste en mémoire ; le tester peut exercer l'API et les tests peuvent
  restaurer leurs fixtures. Pas de remplacement du store pour ce TP.
- Ne pas inventer la fixture legacy INFRA-198. Son test reste explicitement ignoré.
- Aucun commit, push, merge, ajout de dépendance ou usage de secret sans autorisation.

## Chaîne Codex pour une fonctionnalité avec tests

Le CLI utilisé ne sélectionne pas les profils personnalisés dans `spawn_agent`.
Utiliser **le lanceur réel** `node scripts/agent.mjs <rôle> '<brief autonome>'`.
Il ouvre une session Codex neuve avec les instructions du profil et le sandbox explicite.
Profils : finder localise, explorer explique, planner propose un plan, dev implémente,
tester exécute, reviewer vérifie. Lire un profil ou écrire « tu es dev » dans un prompt
ne charge pas ses restrictions : ne pas utiliser une délégation générique à la place.

Pour un endpoint avec tests, exécuter le pipeline déterministe
`node scripts/chain.mjs "<consigne exacte>"`. Il appelle dev, tester, reviewer dans des
sessions neuves puis npm run verify. Il s’arrête sur un échec au lieu d’improviser un
succès. Le parent n’implémente pas lui-même la tâche. Pour une exploration/planification conséquente, utiliser finder/explorer/planner.
Ces trois étapes peuvent être omises pour une tâche bornée, en expliquant pourquoi.
Ne pas lancer deux dev sur les mêmes fichiers. Seul dev écrit du code.
Le parent coordonne et peut enregistrer le plan ; les profils de lecture sont read-only.
Le planner retourne son plan sans écrire. Chaque lancement conserve sa trace dans
`.codex/scratch/agents/`. Transmettre les chemins, pas tout l'historique.

Si le sandbox du parent empêche le lancement du CLI ou les serveurs HTTP des tests,
demander l'exécution avec les permissions nécessaires et rapporter les sorties réelles.
Ne pas remplacer un test HTTP par un mock pour obtenir du vert.
Ne pas lire les traces volumineuses de captures/ pour implémenter la fonctionnalité.
Même si les hooks sont désactivés, la validation finale est `npm run verify`.
