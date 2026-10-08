Défaut bloquant trouvé :

- `README.md:77` annonce que la CI exécute les vérifications et la couverture sur PR/push vers `main`, mais `.github/workflows/ci.yml` est supprimé dans le dossier livré (`git status --short` le marque `D`). Scénario concret : après livraison, une PR ou un push vers `main` ne déclenche plus les contrôles annoncés, donc le paquet documente une garantie de validation qui n’existe plus.

Contrôles lancés : `npm run verify` passe, `git diff --check` passe.

VERDICT: BLOCKING