Résumé :
- Ajout de `GET /rooms/:id/availability?date=YYYY-MM-DD`.
- La route renvoie `{ room, date, slots }`, avec des créneaux libres en ISO UTC.
- Les réservations sont bornées à la journée demandée, triées, fusionnées si elles se chevauchent, puis inversées en créneaux libres.
- Validation ajoutée : `404` si la salle n’existe pas, `400` si `date` est absente ou invalide.

Fichiers modifiés :
- [src/routes/rooms.ts](/Users/altan/Desktop/tp-ia/tp2-soran-aaa/src/routes/rooms.ts:11) : nouvelle route `/rooms/:id/availability`.
- [src/lib/availability.ts](/Users/altan/Desktop/tp-ia/tp2-soran-aaa/src/lib/availability.ts:1) : calcul pur des créneaux libres.
- [test/rooms.spec.ts](/Users/altan/Desktop/tp-ia/tp2-soran-aaa/test/rooms.spec.ts:59) : tests de l’endpoint.
- [test/availability.spec.ts](/Users/altan/Desktop/tp-ia/tp2-soran-aaa/test/availability.spec.ts:17) : tests de fusion/bornage des réservations.
- [README.md](/Users/altan/Desktop/tp-ia/tp2-soran-aaa/README.md:14) : endpoint documenté.

Comment tester :
- `npm run test:unit` : OK, 11 tests passés, 4 skipped existants.
- `npm run typecheck` : OK.
- `npm run lint` : OK.

À vérifier :
- Le repo avait déjà `package-lock.json` modifié et `captures/` non suivi avant mon intervention ; je n’y ai pas touché.
- Le format choisi pour la réponse est `slots: [{ startsAt, endsAt }]`. Exemple : `GET /rooms/salle-a/availability?date=2026-10-05`.

Prochaine étape conseillée :
- Si tu veux exposer des créneaux “métier” uniquement sur horaires ouvrés, on pourra ajouter une règle de journée configurable plus tard.