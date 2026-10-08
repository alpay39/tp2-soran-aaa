# Preuves techniques — TP2 SORAN / AAA

Les captures visuelles sont dans [captures/](../captures/README.md) et le rapport principal dans [DIAGNOSTIC.md](../DIAGNOSTIC.md).

Les **181 fichiers techniques** auparavant mêlés aux captures ont été déplacés sans changement de contenu. L’ancien index documentaire des captures est aussi conservé en TXT, octet pour octet. Les résultats nouveaux du seul contrôle final du rendu sont dans validation/.

| Dossier | Contenu |
|---|---|
| [avant/](avant/) | Référence, consigne exacte, session initiale, réponse, patch et sources produits avant l’audit |
| [audit/](audit/) | Résultats initiaux, sondes types/lint, permissions, MCP, vulnérabilités et mutations AVANT |
| [apres/](apres/) | Sessions neuves, essais et verdicts successifs, métadonnées, sources et documents de comparaison |
| [validation/](validation/) | Contrôles du dépôt réparé, couverture, mutations, états Git, manifestes et outils historiques |

## Points d’entrée

- [Consigne exacte](avant/02-consigne-exacte.txt), [trace AVANT](avant/02-avant-session.jsonl), [réponse AVANT](avant/02-avant-reponse.md).
- [Audit des tests cachés](audit/03-original-tous-les-tests.json), [mutations AVANT](audit/03-mutation-avant.json), [audit npm](audit/03-npm-audit.json).
- [Protocole APRÈS](apres/09-apres-protocole.json), [session neuve](apres/09-apres-chaine.txt), [sources produites](apres/09-code-produit/), [sessions et métadonnées](apres/09-metadonnees-sessions.json).
- [Revue finale](apres/13-revue-finale.txt), [résultat final structuré](apres/13-resultat-final.json), [verify après revue](apres/13-validation-apres.txt).
- [Verify du dépôt principal](validation/09-final-verify.txt), [couverture](validation/09-final-coverage.txt), [relais du hook vérifié](validation/12-hook-legacy-validation.txt).
- [Table de correspondance et empreintes](validation/organisation-rendu.json).

## Conservation des preuves brutes

Les noms, dates, valeurs et références internes des JSON, JSONL, logs, réponses d’agents, patches et copies de code restent ceux de leur création. Les anciens chemins `captures/...` et les chemins absolus de sessions temporaires sont des références historiques : ils ne sont pas réécrits. La table de correspondance permet de retrouver chaque fichier déplacé et de vérifier son empreinte.

Les manifestes et états Git historiques décrivent leur date de collecte ; ils ne sont pas remplacés par l’état actuel. L’ancien index est [index-captures-original.txt](validation/index-captures-original.txt). Les outils sous [validation/outils/](validation/outils/) sont des archives de provenance ; ils ne sont pas le harness fonctionnel et ne doivent pas servir à relancer les expériences pour préparer le rendu.

Les preuves distinguent les 51 tests réussis du dépôt principal et les 43 de la copie APRÈS. Les verdicts bloquants 08 à 12 sont conservés ; leur clôture est documentée avec la revue 13 et sa validation. Aucun succès ancien n’est réécrit.


## Contrôles finaux du rendu propre

- [npm run verify](validation/controle-final-verify.txt).
- [npm run test:coverage](validation/controle-final-coverage.txt).
- [Liens Markdown](validation/controle-liens-markdown.json).
- [Intégrité des preuves, images et fichiers fonctionnels ; recherche de secrets](validation/controle-integrite-et-secrets.json).
