# Captures d’écran — TP2 SORAN / AAA

Ce dossier contient **15 captures PNG originales, inchangées**. Le diagnostic principal est [DIAGNOSTIC.md](../DIAGNOSTIC.md). Les traces et résultats complémentaires sont dans [preuves/](../preuves/README.md).

## AVANT

| Capture | Ce qu’elle montre |
|---|---|
| [01-avant-health.png](01-avant-health.png) | API initiale joignable |
| [01-avant-endpoint-original.png](01-avant-endpoint-original.png) | Endpoint absent avant implémentation |
| [02-avant-en-cours.png](02-avant-en-cours.png) | Expérience initiale sans aide, en cours |
| [05-avant-suite.png](05-avant-suite.png) | Suite réellement découverte dans le dépôt original |
| [05-avant-tests-exclus-bugs.png](05-avant-tests-exclus-bugs.png) | Bugs de prix et de réservation révélés par les tests exclus |

## APRÈS — preuves finales à consulter en priorité

| Capture | Ce qu’elle montre |
|---|---|
| [13-revue-et-validation-apres.png](13-revue-et-validation-apres.png) | Revue NOTHING FOUND puis verify réel de la copie neuve : 43 réussis, 1 ignoré, 9 contrats, 6 mutations détectées |
| [13-hook-legacy-verification.png](13-hook-legacy-verification.png) | Vérification du dépôt principal via le hook : 51 réussis, 1 ignoré, 9 contrats, 6 mutations détectées |
| [09-verification-finale.png](09-verification-finale.png) | Vérification complète du dépôt principal |
| [09-api-disponibilite.png](09-api-disponibilite.png) | Réponse réelle de l’API compilée réparée |
| [09-couverture-finale.png](09-couverture-finale.png) | Mesure native V8 ; ce n’est pas un taux de lignes/branches TypeScript |

## Audit et contrôles intermédiaires

- [05-audit-demonstrations.png](05-audit-demonstrations.png) : commandes, types, permissions et MCP.
- [05-apres-verification.png](05-apres-verification.png) : première vérification après réparations.
- [05-apres-contrats-hooks.png](05-apres-contrats-hooks.png) : six contrats historiques ; le total final est neuf.
- [05-apres-couverture-v8.png](05-apres-couverture-v8.png) : couverture après réparations.

## Relecture du résultat initial

[13-avant-relecture-resultat.png](13-avant-relecture-resultat.png) a été prise à la finalisation pour afficher le résultat AVANT déjà conservé. Son bandeau le signale. Elle ne remplace pas la capture initiale et n’est pas présentée comme une capture ancienne retrouvée.

Les images sont de vraies captures prises dans Chrome DevTools, montrant des réponses HTTP, des sorties de processus ou des traces Codex conservées. Aucune image n’a été retouchée. Les contrôles n’ont pas été rejoués pour organiser le présent rendu.
