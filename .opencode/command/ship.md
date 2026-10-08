---
description: Prépare une livraison contrôlée, sans commit ni push automatique
agent: architect
---

Exécute `npm run verify`, demande une revue indépendante, puis rapporte le résultat,
`git status --short` et un message de commit proposé. Le hook post-écriture est
informatif ; il ne prouve pas que la livraison est valide. Ne stage, commit ou push
que si l'utilisateur l'a explicitement demandé. Respecte les fichiers déjà modifiés.
