# Diagnostic du dossier de comparaison — SORAN / AAA

Ce dossier est la copie de la session neuve APRÈS. Il conserve le code produit par dev, puis exercé par tester ; les sources et tests n’ont pas été modifiés depuis ces sessions. Le dépôt principal et son diagnostic complet du TP sont à `/Users/altan/Desktop/tp-ia/tp2-soran-aaa`.

## Résultat propre à cette copie

- Endpoint GET /rooms/:id/availability?date=YYYY-MM-DD.
- Réponse : roomId, date, slots ; slots contient startsAt et endsAt en ISO UTC avec millisecondes.
- Journée UTC, bornage à minuit, fusion des occupations contiguës ou chevauchantes ; salle inconnue 404 et date invalide 400.
- Suite réellement exécutée : 43 tests réussis, 1 ignoré, 6 fichiers.
- verify : types stricts, lint, build, tests, 9 contrats du harness et 6 mutations ciblées.
- Tester indépendant : VERDICT: PASS ; vrai parcours HTTP sur loopback.

## Défauts du paquet corrigés après les revues

- DIAGNOSTIC.md et captures initialement omis par la préparation : ajoutés sans toucher au code métier.
- Workflow CI, .gitignore et ancien hook oubliés : copiés depuis le dépôt principal.
- Ancien hook Husky source un fichier absent : remplacé par un relais .githooks/pre-commit sans dépendance.
- Lien absolu vers node_modules : remplacé par un dossier de dépendances existantes copié localement, sans installation. Motif Git adapté aux dossiers et aux liens.
- Table des routes et diagnostic incohérents : table complétée, présent diagnostic spécifique à cette copie.

Les résultats de 51 tests réussis dans 7 fichiers et la réponse room/date/slots décrivent le dépôt principal, pas cette copie. Le rapport complet les compare explicitement. Aucun commit ou push ; fichier .env volontairement absent de la copie, aucune clé nécessaire ou utilisée. Les tests ignorés legacy, le store en mémoire, la convention spec.ts et le hook informatif restent les choix documentés du TP.

Les traces de chaque verdict bloquant sont conservées dans captures/ du dépôt principal. Elles ne sont pas remplacées par un succès fictif. Le code métier final est celui de dev, pas une correction de l’observateur.
