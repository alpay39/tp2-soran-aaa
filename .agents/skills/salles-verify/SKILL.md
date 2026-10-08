---
name: salles-verify
description: Valide une modification de salles-api avec ses contrôles, avant une livraison demandée.
---

Exécuter `npm run verify` depuis la racine. Rapporter les contrôles exécutés et leurs
codes de sortie, les limites de la couverture/mutation et les éventuels tests ignorés.
Le hook informatif post-écriture ne remplace pas cette validation bloquante.
Consulter `git diff --check` et `git status --short`, puis proposer un message de commit.
Ce skill prépare une livraison ; un commit ou push nécessite une instruction explicite
de l'utilisateur. Ne jamais exécuter `git add -A`, commit ou push implicitement.
