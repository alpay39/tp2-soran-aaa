# salles-api

API interne de reservation de salles.

```bash
npm install
npm start          # http://localhost:3000
```

## Endpoints

| Methode | Route | Role |
|---|---|---|
| GET | `/health` | sonde de vie |
| GET | `/rooms` | catalogue des salles |
| GET | `/rooms/:id` | une salle et ses reservations |
| GET | `/rooms/:id/availability?date=YYYY-MM-DD` | creneaux libres d’une salle |
| GET | `/bookings?roomId=` | les reservations |
| POST | `/bookings` | creer une reservation |
| DELETE | `/bookings/:id` | annuler une reservation |

Exemple :

```bash
curl -s localhost:3000/rooms | jq
curl -s -X POST localhost:3000/bookings \
  -H 'content-type: application/json' \
  -d '{"roomId":"salle-a","who":"moi","people":4,
       "startsAt":"2026-11-02T09:00:00Z","endsAt":"2026-11-02T11:00:00Z"}' | jq
```

## Outillage agent

Le depot embarque une chaine d'agents OpenCode (`.opencode/`) : un agent principal
`architect` et six subagents specialises. `opencode agent` les liste.

## Etat du projet

L'equipe qui a monte ce service est partie. Le service tourne en production depuis
huit mois. La chaine d'agents a ete installee en juin et personne ne l'a revue depuis.

## Contrôles et harness Codex — TP2 SORAN / AAA

Node 24 recommandé (Node 22.8 installé localement déclenche un avertissement
sur certaines dépendances de lint). Aucun secret n'est nécessaire pour cette API.

```bash
npm install             # dépendances du lockfile ; installe aussi le hook Git local
npm run verify          # types, lint, build, tests, contrats de hooks, six mutations
npm run test:coverage   # couverture native V8, rapport coverage/native-summary.json
npm start
```

`npm test` est l'alias de `npm run test:unit`. Les tests sont nommés `*.spec.ts`.
La fixture legacy absente INFRA-198 explique le seul skip conservé.
`npm run build` émet le JavaScript ESM dans `dist/`. Pour lancer la version compilée :
`node dist/server.js`.

Le travail utilise **Codex uniquement**, comme autorisé pour ce TP. Six profils
sont déclarés dans `.codex/agents/`, avec responsabilités dans `AGENTS.md`.
Le CLI local ne sélectionnant pas ces profils dans spawn_agent, le lanceur
`node scripts/agent.mjs <rôle> "<brief>"` crée une vraie session Codex indépendante
et force le sandbox du rôle. Les traces sont conservées dans .codex/scratch/agents/.
`node scripts/chain.mjs "<consigne exacte>"` orchestre dev, tester, reviewer et verify
dans cet ordre, avec sessions indépendantes et arrêt sur échec.
Démarrer une nouvelle session Codex dans ce dossier pour charger cette configuration.
Le skill `$salles-verify` prépare la livraison. Il ne commit ni ne pousse le dépôt.
Les fichiers OpenCode d'origine restent présents pour expliquer et corriger leurs
contrats ; leur moteur n'a pas été exécuté.

Les hooks de `.codex/hooks.json` s'exécutent après édition et à la fin d'un tour.
Dans une utilisation interactive, ouvrir `/hooks`, lire puis approuver les définitions
locales pour les activer. Les expériences automatisées du TP ont utilisé la confiance
ponctuelle des seuls hooks audités (`--dangerously-bypass-hook-trust`), en conservant
le sandbox et les approbations normales. Ce flag ne désactive pas le contrôle final.
Le hook Git `.githooks/pre-commit` exécute `npm run verify` et bloque en cas d'échec.
`npm run hooks:install` l'installe localement sans écraser un hooksPath différent.
CI : les mêmes vérifications et la couverture tournent sur PR et push vers main.

Le script post-écriture garde son mode **informatif** (INFRA-231). Le contrôle
**bloquant** est `npm run check`, repris par verify, Git, CI et le hook Codex Stop.
Un échec d'un test réseau dû au sandbox doit être signalé, pas masqué par un mock.

### Disponibilité

Les journées vont de 00:00 UTC à 00:00 UTC le lendemain ; chaque slot contient
`startsAt` et `endsAt` en ISO UTC. Une salle inconnue renvoie 404, une date absente,
impossible, répétée ou mal formée renvoie 400. Les réservations contiguës et
chevauchantes sont fusionnées ; celles qui traversent minuit sont bornées au jour.

Voir `DIAGNOSTIC.md` et `captures/README.md` pour l'ordre des étapes, les preuves,
les métriques et les limites de l'adaptation. Aucun push effectué.
