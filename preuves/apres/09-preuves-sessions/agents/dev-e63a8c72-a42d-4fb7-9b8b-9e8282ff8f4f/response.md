**Résumé :**
- Endpoint ajouté : `GET /rooms/:id/availability?date=YYYY-MM-DD`.
- Il renvoie les créneaux libres UTC de la journée, avec validation stricte de `date`, 404 si salle inconnue, fusion des réservations contiguës/chevauchantes, et bornage des réservations qui traversent minuit.
- Je n’ai pas lu `captures/`, pas de commit, pas de push.
- Plan local : `.opencode/plans` ne contient que `.gitkeep`.

**Fichiers modifiés :**
- [src/routes/rooms.ts](/private/tmp/tp2-apres-final09-soran-aaa/src/routes/rooms.ts:1)
- [test/rooms.spec.ts](/private/tmp/tp2-apres-final09-soran-aaa/test/rooms.spec.ts:1)

**Contrôles :**
- `npm run check` sandbox : code `1`
  - Erreurs : tests HTTP avec `Server is not running`, puis `EPERM` sur `node_modules/.vite/vitest/results.json`.
- `npm run check` hors sandbox : code `0`
  - `typecheck`, `lint`, `build`, `test` verts.
  - Tests : `43 passed | 1 skipped`.
- `npm run verify` hors sandbox : code `0`
  - `check` vert.
  - Harness : `9 passed`.
  - Mutations : 6/6 tuées.
- `git diff --check` : code `0`.

**À vérifier :**
- Le repo était déjà très sale avant mon intervention. `npm run verify` a aussi généré `dist/` et `coverage/` en non suivis.
- Test ignoré conservé : fixture legacy INFRA-198.

**Prochaine étape conseillée :**
- Message de commit proposé si tu veux ensuite committer : `feat: add room availability endpoint`