Résumé :
- Ajout de `GET /rooms/:id/availability?date=YYYY-MM-DD`.
- La réponse renvoie `{ room, date, available }` avec les créneaux libres UTC de la journée.
- Gestion des cas `404` salle inconnue, `400` date absente/invalide, réservations qui chevauchent la journée, et créneaux semi-ouverts `[début, fin[`.

Fichiers modifiés :
- [src/routes/rooms.ts](/private/tmp/tp2-apres-soran-aaa/src/routes/rooms.ts:11)
- [test/rooms.spec.ts](/private/tmp/tp2-apres-soran-aaa/test/rooms.spec.ts:1)

Comment tester :
- `npm run verify` : OK, code `0`
- `git diff --check` : OK, code `0`
- Résultat global : `44 passed | 1 skipped`
- Reviewer agent : `VERDICT: NOTHING FOUND`

À vérifier :
- Le repo était déjà très modifié avant mon intervention.
- `npm run verify` a généré `dist/` et `coverage/` en non suivis ; je ne les ai pas supprimés sans confirmation.
- Le test ignoré existant reste dans `test/overlap.spec.ts`.

Prochaine étape conseillée :
- Commit possible : `feat: add room availability endpoint`