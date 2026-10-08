# TP2 — Le repo malade

**Binôme : SORAN / AAA** · Réalisation entièrement avec Codex.

API de réservation de salles en Express et TypeScript, avec dépôt et harness réparés.

## Installation

Node.js 24 recommandé.

```bash
npm ci
```

## Lancer et vérifier

```bash
npm start                 # API : http://localhost:3000
npm run verify            # types, lint, build, tests, contrats et mutations
npm run test:coverage     # couverture native V8
git diff --check
```

Le diagnostic, les réparations et la comparaison AVANT/APRÈS sont dans
[DIAGNOSTIC.md](DIAGNOSTIC.md).
Les captures d’écran sont indexées dans [captures/](captures/README.md) ;
les preuves techniques sont archivées dans [preuves/](preuves/README.md).
