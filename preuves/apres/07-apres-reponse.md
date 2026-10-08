Résumé :
- Ajout de `GET /rooms/:id/availability?date=YYYY-MM-DD`.
- Réponse : `{ room, date, availableSlots }`.
- Les créneaux sont calculés en UTC sur toute la journée, avec bornes semi-ouvertes, et les réservations qui chevauchent minuit sont correctement bornées.
- Salle inconnue : `404`. Date absente/invalide : `400`.

Fichiers modifiés :
- [src/routes/rooms.ts](/private/tmp/tp2-apres-final-soran-aaa/src/routes/rooms.ts:22)
- [src/lib/availability.ts](/private/tmp/tp2-apres-final-soran-aaa/src/lib/availability.ts:12)
- [test/rooms.spec.ts](/private/tmp/tp2-apres-final-soran-aaa/test/rooms.spec.ts:8)

Comment tester :
- `npm test -- test/rooms.spec.ts` : OK, 5 tests passés.
- `npm run typecheck` : OK.
- `npm run lint` : OK.
- `npm run verify` : OK.
  - `check` : typecheck, lint, build, test OK.
  - Tests : 39 passés, 1 ignoré.
  - Harness : 6 passés.
  - Mutations ciblées : toutes tuées.

À vérifier :
- Le dépôt était déjà très modifié avant mon intervention.
- `npm run verify` a généré `coverage/` et `dist/` en non suivis.
- Je n’ai fait ni commit ni nettoyage destructif.

Prochaine étape conseillée :
- Commit proposé : `feat: add room availability endpoint`