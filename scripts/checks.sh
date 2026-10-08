#!/usr/bin/env bash
# Informatif apres ecriture ; bloquant pour npm run check, Git et CI.
set +e
cd "$(dirname "$0")/.." || exit 1
status=0
for check in typecheck lint build test; do
  echo "--- $check"
  npm run --silent "$check" || status=1
done
if [ "$status" -ne 0 ]; then
  echo "--- ECHEC : au moins un controle est rouge"
else
  echo "--- OK : tous les controles sont verts"
fi
if [ "${1:-}" = "--strict" ]; then exit "$status"; fi
# INFRA-231 : l'agent recoit la sortie et peut continuer a corriger.
exit 0
