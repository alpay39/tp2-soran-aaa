# TP2 — Le repo malade

**Binôme : SORAN / AAA** · Travail du 7 octobre 2026 · Dépôt source : <https://github.com/0xaitox/ai-tools-repo-malade>

Référence initiale : `ab57521d04c1ed026be1440bc4e4d58c61788a2a`.
Le TP est effectué entièrement avec Codex, conformément à l'autorisation donnée.
Le moteur OpenCode n'a pas été exécuté. Les démonstrations de ses contrats sont
identifiées comme des tests isolés ; elles ne sont pas présentées comme des sessions
OpenCode. Aucun commit ni push effectué. Le push demandé dans le sujet reste soumis
à l'autorisation de l'utilisateur.

## 1. Expérience initiale, avant l'audit

Le PDF a été lu entièrement avant l'expérience. Le dépôt a été cloné, ses dépendances
existantes installées et son API démarrée. Avant ce lancement, l'observateur n'a ouvert
ni `AGENTS.md`, ni `opencode.json`, ni les prompts, hooks ou configurations du dépôt.
La session de travail a ensuite reçu uniquement la consigne suivante, sans conseil ni
reformulation :

> Ajoute un endpoint GET /rooms/:id/availability?date=YYYY-MM-DD qui renvoie les créneaux libres d'une salle sur la journée demandée, avec ses tests.

La chaîne n'a reçu aucune correction de l'observateur pendant l'expérience. La lecture
et l'audit directs des configurations ont commencé après sa réponse finale. Le processus
Codex a naturellement lu les fichiers nécessaires pendant son propre travail. Une
lecture intermédiaire de la trace de progression a affiché notamment package.json ;
cela n'a donné lieu à aucun conseil ou changement de la session.

Les premières tentatives ont été bloquées par l'environnement, avant le travail :
serveur local interdit par le sandbox, base de session en lecture seule, puis modèle
CLI par défaut `gpt-6.1-sol` refusé par le compte. La session effective utilise `gpt-5.5`.
Ces erreurs sont conservées et ne sont pas attribuées au dépôt. Le sandbox et les
approbations des actions sont restés actifs.

### Ce qui a réellement été observé

- L'API initiale répond `{"ok":true}` ; l'endpoint demandé est absent de ce processus initial.
- Un agent Codex général lit, implémente et teste. Aucun subagent n'est appelé.
  Les six agents OpenCode ne sont pas chargés automatiquement par Codex.
- Le premier contrôle ne découvre que **5 tests réussis et 4 ignorés**.
- Codex ajoute la route, un calcul pur et six tests, puis annonce **11 réussis / 4 ignorés**,
  lint et types verts. Les tests de réservation et de prix restent exclus.
- Les premiers tests HTTP échouent à cause du sandbox. Codex remplace le transport
  HTTP par un double de requête/réponse pour terminer sa vérification. Ces erreurs et
  les corrections successives apparaissent dans la trace, sans intervention extérieure.
- La réponse de disponibilité choisie est `{ room, date, slots }`, journée en UTC.

Preuves : [API initiale](captures/01-avant-health.png),
[endpoint initial absent](captures/01-avant-endpoint-original.png),
[session en cours](captures/02-avant-en-cours.png),
[réponse initiale brute](preuves/avant/02-avant-reponse.md),
[trace complète](preuves/avant/02-avant-session.jsonl),
[code initial produit](preuves/avant/02-avant-source/),
[patch initial](preuves/avant/02-avant-changements.patch).

## 2. Audit, démonstrations et réparations

Les contrôles initiaux sont rejoués sur une copie extraite du commit de référence.
Cette copie conserve le code initial ; les sondes et configurations d'audit temporaires
n'affectent pas le dépôt livré. Les tests sont lancés, les sorties et codes de retour
conservés. Les captures sont de vraies captures du navigateur : sorties reçues directement
des processus locaux ou réponses HTTP, sans fabriquer d'image de terminal.

### Matrice des problèmes et briques du cours

Cette matrice explicite les quatre éléments du rendu. Les démonstrations et justifications détaillées suivent.

| Symptôme | Cause / fichier | Brique du cours | Réparation |
|---|---|---|---|
| Commandes annoncées absentes | package.json et AGENTS.md | Rules / Commands | Scripts test/build ajoutés et instructions alignées |
| Convention Result annoncée mais exceptions utilisées | AGENTS.md, src/lib/validate.ts | Rules | Règle alignée sur ValidationError et réponses HTTP 400 |
| Exports ne respectant pas la règle locale | src/lib/AGENTS.md et modules lib | Rules | Default export de la fonction principale conservant les exports nommés |
| Livraison sans contrôles ni autorisation | .opencode/command/ship.md | Commands / Git | Préparation contrôlée, sans commit/push automatique |
| Planner non délégable et tester omis | .opencode/agent/planner.md, architect.md | Subagents | Mode subagent et équipe complète |
| Finder ne peut pas lire | .opencode/agent/finder.md, wildcard deny en dernier | Permissions | Wildcard placé avant les permissions particulières |
| Rôles pouvant écrire/revoir leur propre changement ou redéléguer | .opencode/agent/architect.md, dev.md, reviewer.md | Subagents / Permissions | Séparation coordination, implémentation et revue |
| Brief finder trop long et ambigu | .opencode/agent/finder.md | Context | Sortie courte limitée à la localisation |
| Profils Codex déclarés mais non sélectionnés par le CLI | .codex/config.toml, .codex/agents/, interface spawn_agent | Subagents / Permissions | Lanceur de sessions avec instructions et sandbox explicites |
| Consigne de délégation ignorée par une session générale | AGENTS.md et trace 07 | Rules / Subagents | Pipeline déterministe dev, tester, reviewer et contrôle des verdicts |
| Base MCP injoignable et Sentry non authentifié | opencode.json, déclarations MCP | MCP | Désactivation justifiée ; aucun secret ni base fictive |
| Patchs/configurations non contrôlés et branchement de plugin ambigu | .opencode/plugin/checks.js, opencode.json | Hooks | Couverture des outils concernés, chemin explicite et prévention des boucles |
| Hook informatif pris comme feu vert de livraison | scripts/checks.sh et filet de validation absent | Hooks / Commands | Mode informatif conservé, contrôle strict partagé avec Stop/Git/CI |
| Ancien hook dépendant d’un fichier absent | .husky/pre-commit | Hooks / Git | Relais vers .githooks/pre-commit sans dépendance Husky |
| Lint vert malgré any et variables inutilisées | eslint.config.js, aucune règle | Lint | Règles recommandées et contrôles utiles activés |
| Types verts malgré un prix string | tsconfig.json, src/lib/price.ts et @ts-nocheck | Types | Strict activé, suppression nocheck retirée et surcharge numérique |
| Prix week-end "5020" au lieu de 70 | src/lib/price.ts, surcharge string | Tests / Types | Constante numérique et tests exécutés |
| Réservation adjacente refusée | src/lib/overlap.ts, comparaisons <= | Tests | Intervalles semi-ouverts avec comparaisons strictes |
| Tests de prix/réservation exclus | vitest.config.ts et anciens fichiers *.test.ts | Tests | Fichiers renommés en *.spec.ts, convention conservée |
| Tests ignorés sans assertion utile | test/overlap.spec.ts | Tests | Assertions réelles et réactivation ; seul legacy justifié reste ignoré |
| Tests verts sur un double de store | test/store.spec.ts | Tests / Mutation | Tests du vrai module sans modifier le store |
| Dates impossibles ou non UTC acceptées | src/lib/validate.ts et validation de la route | Types / Tests | Validation calendaire et canonisation UTC |
| Tests HTTP remplacés par des mocks lors d’un blocage | Tests produits pendant AVANT, absence d’accès loopback | Tests / Permissions | Tests sur vrai serveur avec autorisations distinctes et fermeture propre |
| Fonctions non exercées et mutants survivants | Suite originale, test/store.spec.ts et filtre Vitest | Coverage / Mutation | Mesure V8 explicite et six mutations ciblées réellement détectées |
| CI ne protège pas contre les bugs reproduits | .github/workflows/ci.yml | CI | Types, lint, build, tests, contrats, mutations et couverture configurés |
| Paquet de comparaison incomplet ou documentation incohérente | Protocole de copie 09, README.md et DIAGNOSTIC.md de la copie | Rules / Commands / Review | Fichiers complétés, documents propres à la copie et revue finale indépendante |
| Dépendance à un lien node_modules extérieur | Copie de comparaison et .gitignore | Git / Reproducibility | Copie des dépendances existantes et exclusion Git adaptée |
| Sept vulnérabilités d’outillage mesurées | Lockfile installé ; preuve d’audit npm | Dependencies / CI | Signalées, sans mise à jour non autorisée ; limite conservée et justifiée |

### Rules, commandes et conventions

| Symptôme / cause | Brique | Réparation et démonstration |
|---|---|---|
| `npm test` et `npm run build` échouent : scripts absents, alors que `AGENTS.md` les annonce. | Rules / commands | Ajout des deux scripts, compilation ESM réelle dans dist/ ; `npm run verify` les exécute. |
| `AGENTS.md` annonce une convention Result alors que `src/lib/validate.ts` lève ValidationError et que les routes l'interceptent. | Rules | Instructions alignées sur la stratégie réellement utilisée, sans réécrire toute l'API. Les tests valident les erreurs HTTP 400. |
| Les modules initiaux de src/lib/ ne respectent pas le default export demandé par leur règle locale. | Rules | Ajout du default export de la fonction principale, conservation des exports nommés utilisés par les routes. |
| `.opencode/command/ship.md` ordonne add -A, commit et push sans checks ni revue. | Commands / Git | Commande transformée en préparation contrôlée ; skill Codex `salles-verify` disponible. Aucun de ces actes de livraison n'est exécuté implicitement. |

Capture : [audit des commandes, types et permissions](captures/05-audit-demonstrations.png).
Les règles locales de src/lib/ ont priorité sur les règles générales : leur exception
à la JSDoc n'est pas comptée comme un défaut. Les nouveaux exports hors de ce dossier
sont documentés. Le store existant reste inchangé.

### Subagents, droits et contexte

Le dépôt d'origine possède sept fichiers d'agents : architect + six rôles annoncés.
Mais planner est en mode primary ; il n'est donc pas déclaré comme subagent.
La table de l'architect omet tester. Finder demande un récit de conception malgré son
rôle de localisation ; architect autorise la lecture directe et l'écriture du code ;
dev peut redéléguer ; reviewer peut corriger le diff qu'il doit examiner indépendamment.
Ces contradictions sont dans `.opencode/agent/*.md`.

Une évaluation **isolée** des motifs de permission, suivant la règle officielle du
dernier motif correspondant ([documentation officielle](https://opencode.ai/docs/permissions/)), démontre que le `"*": deny` placé en dernier dans finder
écrase ses autorisations de lecture/recherche. Ce résultat est une démonstration du
contrat de configuration, pas une exécution de l'agent OpenCode.
[Résultats par agent](preuves/audit/03-permissions-modele.json).

Réparations des fichiers d'origine : wildcard en premier pour finder, sorties courtes,
planner en subagent, architect sans édition de code, dev sans redélégation et livraison,
reviewer sans édition, explorer limité aux notes prévues dans plans/, tester intégré à
la vérification. Le droit d'explorer d'écrire ses notes et le droit de planner d'écrire
son plan sont légitimes : ils ne constituent pas une autorisation de modifier le code.

**Adaptation Codex et limite découverte pendant le TP :** les fichiers
TOML et leur registre ne suffisent pas dans ce CLI à sélectionner un rôle dans
spawn_agent. Les essais ont répondu au brief, mais leurs métadonnées montrent un
sandbox workspace-write et aucun rôle sélectionné. Le test v2 a confirmé l'absence
du champ de sélection ; ces essais ne sont pas dissimulés.

Une session intermédiaire 07 a ignoré la délégation et implémenté directement ;
sa trace est conservée, sans la présenter comme une chaîne validée.

Le pipeline `scripts/chain.mjs` impose dev, tester et reviewer, puis la validation locale. Il exige les verdicts explicites PASS et NOTHING FOUND : un code de sortie 0 du CLI n’est pas une preuve suffisante.

Le lanceur `scripts/agent.mjs` charge maintenant un profil puis lance une session Codex
indépendante avec `-s read-only` pour finder, explorer, planner, tester et reviewer,
ou `-s workspace-write` pour dev, et les instructions explicites du rôle. Les actions
nécessitant une escalation restent soumises à l'auto-review. Les briefs sont autonomes ;
l'historique du parent n'est pas copié. Les traces et métadonnées effectives permettent
de vérifier le sandbox réellement reçu.

### MCP : déclarés, joignables, utiles

| MCP d'origine | Vérification effectuée | Décision |
|---|---|---|
| salles-db | DNS et curl : hôte non résolu ; variable SALLES_MCP_TOKEN absente. | Désactivé. La vraie base n'est pas disponible et le store actuel est en mémoire. Syntaxe d'expansion env corrigée, sans secret. |
| sentry | Requête HTTP réelle : 401, authentification OAuth requise. | Désactivé par défaut ; aucun accès Sentry autorisé/configuré pour ce TP. |
| github | Déclaration npx inspectée ; présence de la variable d'authentification vérifiée sans lire sa valeur. Serveur non initialisé. | Optionnel, désactivé ; aucun travail GitHub externe nécessaire pour l'API. |
| notion | Déclaration inspectée ; jeton non configuré dans l'environnement. Serveur non initialisé. | Optionnel, désactivé. |
| slack | Déclaration inspectée ; jeton non configuré. Serveur non initialisé, aucun message envoyé. | Optionnel, désactivé. |
| playwright | Déclaration inspectée ; son lancement de projet n'a pas été imposé. | Optionnel, désactivé ; les captures utilisent Chrome DevTools déjà connecté dans Codex. |

Ne pas conclure que les quatre serveurs locaux sont « cassés » : leur réponse au
protocole MCP n'a pas été testée. Un curl 401 établit une réponse HTTP, pas une connexion
MCP fonctionnelle. Aucun npx susceptible d'installer un paquet supplémentaire ni aucune
clé n'a été utilisé pour forcer leur démarrage. L'API ne dépend d'aucun de ces MCP.

Preuves : [audit MCP](preuves/audit/03-mcp-audit.json),
[réponse Sentry](preuves/audit/03-mcp-sentry-http.json),
[DNS de la base](preuves/audit/03-mcp-db-http.json),
[capture de l'audit](captures/05-audit-demonstrations.png).

### Hooks : informer après édition, bloquer à la validation

Le commentaire de scripts/checks.sh annonce un branchement experimental absent de
opencode.json. Le plugin local utilise néanmoins un événement post-outil : l'absence
de cette ancienne clé ne prouve pas que le plugin ne tourne jamais. Pour éviter une
dépendance à la découverte des dossiers par version, son chemin est maintenant déclaré
explicitement dans opencode.json ([contrat des plugins](https://opencode.ai/docs/plugins/)).

Le filtre initial ne traite que edit/write sur .ts. Les patchs et modifications de
configuration échappent donc à ce contrat. Le plugin réparé couvre ces outils ; ses
tests de contrat démontrent le déclenchement et l'absence de boucle. Le moteur OpenCode
n'ayant pas été lancé, on ne prétend pas démontrer sa découverte automatique.

Le `exit 0` initial est **volontaire**, ticket INFRA-231 : notre sonde avec un faux npm
qui échoue montre les erreurs dans stdout et un code 0. Il est conservé pour le mode
informatif. Le défaut était de se servir de ce hook comme seul feu vert de livraison.

Les hooks Codex suivent le [contrat officiel](https://learn.chatgpt.com/docs/hooks).
Le filet bloquant ajouté est partagé :

- `npm run check` appelle checks.sh --strict et retourne une erreur si un contrôle échoue ;
- Codex PostToolUse ajoute les sorties après édition ; Stop lance verify et empêche une
  réponse finale verte lorsque les contrôles sont rouges ;
- PreToolUse interdit les commandes de livraison/destruction dans les sessions du TP ;
- `.githooks/pre-commit`, installé par prepare / hooks:install, appelle verify ;
- CI appelle verify puis la couverture.

Neuf tests de contrat passent (six hooks et trois contrôles du lanceur/pipeline), dont un faux contrôle rouge qui bloque Stop et une
interdiction de push sans lancer le push. Les événements de hooks ont également été
observés dans une vraie session Codex. Les hooks locaux sont soumis à la confiance
Codex ; les expériences automatisées utilisent le flag ponctuel de confiance de hooks
**déjà audités**, sans désactiver sandbox ou approbations. Utilisation interactive :
ouvrir /hooks et vérifier/approuver les définitions.

Capture initiale : [six contrats des hooks](captures/05-apres-contrats-hooks.png).
Validation finale des neuf contrats : [verify complet](captures/09-verification-finale.png).
Le hook Git a été installé, mais aucun commit n'a été créé pour le tester. La revue du paquet a aussi révélé
que l’ancien `.husky/pre-commit` source `.husky/_/husky.sh`, absent du
projet : l’exécution manuelle de ce hook échouait avant les contrôles. Ce hook n’est
pas celui activé par core.hooksPath, mais le fichier livré était incohérent. Il est
maintenant un simple relais du hook `.githooks/pre-commit`, sans dépendance Husky.
`sh .husky/pre-commit` a été exécuté réellement ; il appelle verify et ne crée aucun
commit. Sa sortie complète est conservée dans preuves/validation/12-hook-legacy-validation.txt.


### Lint, types et compilation

`eslint.config.js` ne contient initialement aucune règle. `eslint --print-config`
renvoie `rules: {}` ; une sonde syntaxiquement valide avec any et une variable inutilisée
passe. « Lint vert » ne prouvait donc rien sur ces erreurs.
Les règles recommandées de typescript-eslint sont maintenant actives ; les variables
inutilisées, any explicites et @ts-nocheck sont contrôlés.

`tsconfig.json` désactive strict, noImplicitAny et strictNullChecks. L'audit renforce les
options dans une copie puis retire temporairement le @ts-nocheck de price.ts : TypeScript
signale alors qu'une string n'est pas assignable à number. Les types stricts sont activés,
la suppression nocheck retirée, la surcharge numérique corrigée. Le build réel émet du
JS ESM via tsconfig.build.json, tout en conservant le typecheck sans émission.

Preuves : [lint effectif initial](preuves/audit/03-original-eslint-effective.json),
[sonde lint](preuves/audit/03-lint-sonde.json),
[erreur de type démasquée](preuves/audit/03-types-sans-nocheck.json),
[audit en capture](captures/05-audit-demonstrations.png),
[contrôles réparés](captures/05-apres-verification.png).

### Tests, couverture et mutations

La convention `*.spec.ts` est explicitement voulue (INFRA-205). Le filtre Vitest est
conservé ; les deux anciens fichiers *.test.ts sont **renommés** au lieu d'élargir le
filtre silencieusement. En forçant leur découverte uniquement dans la copie d'audit,
les tests existants démasquent les bugs ci-dessous.

- Chevauchements : `src/lib/overlap.ts` utilise <= malgré des intervalles [début, fin[.
  Une réservation adjacente reçoit 409 au lieu de 201. Correction : comparaisons strictes.
- Prix : `src/lib/price.ts` ajoute la chaîne "20" ; le résultat observé est "5020" au
  lieu du nombre 70. Correction : constante numérique, types effectivement contrôlés.
- Deux tests ignorés d'overlap étaient de simples `expect(true)`. Ils deviennent de
  vraies assertions ; le test bout à bout est réactivé.
- `test/store.spec.ts` interroge son propre double. Les mutations de findRoom et
  bookingsForRoom survivent. Les nouveaux tests interrogent le module réel ; store.ts
  reste inchangé conformément à INFRA-140.
- Le validateur acceptait la normalisation de dates impossibles par Date.parse et les
  chaînes locales sans UTC. Les entrées sont maintenant validées et canonisées en ISO UTC.
- Les tests HTTP du dépôt livré utilisent un vrai serveur local, attendent son ouverture
  et le ferment. Ils couvrent catalogue, disponibilité, validations, conflits, prix et
  annulation. Les états sont remis en place entre tests de réservation.

La fixture legacy INFRA-198 n'existe pas. Son test reste ignoré avec sa justification.
Il n'est pas remplacé par une fixture inventée.

| Mesure | Dépôt original | Dépôt réparé |
|---|---:|---:|
| Fichiers Vitest exécutés | 2 | 7 |
| Tests applicatifs réussis | 5 | 51 |
| Tests ignorés | 4 | 1 justifié |
| Contrats du harness | aucun | 9 réussis |
| Mutations ciblées détectées | 1 / 6 | 6 / 6 |
| Fichiers source chargés, mesure V8 | 2 / 8 | 8 / 9 |
| Fonctions nommées exécutées parmi les fichiers chargés | 1 / 4 | 18 / 18 |

La couverture V8 utilise Profiler.takePreciseCoverage avant la destruction des workers.
Elle ne prétend pas être un pourcentage de lignes ou branches TypeScript. Les fichiers
non chargés sont indiqués ; server.ts reste hors suite et est vérifié au démarrage HTTP.
Le ratio de fonctions n'inclut pas les fonctions des fichiers non chargés. Les six
mutations sont un échantillon annoncé, pas un score exhaustif Stryker. Une erreur
d'infrastructure n'est pas comptée comme une mutation tuée par le runner réparé.
Le module officiel de couverture n'a pas été ajouté sans autorisation.

Preuves : [suite originale](captures/05-avant-suite.png),
[tests exclus et bugs démasqués](captures/05-avant-tests-exclus-bugs.png),
[vérification réparée](captures/05-apres-verification.png),
[couverture V8](captures/05-apres-couverture-v8.png),
[mutations avant](preuves/audit/03-mutation-avant.json),
[mutations après](preuves/validation/04-mutation-apres.json).

### CI, Git et dépendances

La CI initiale n'exécute que le lint sans règles ; les tests sont commentés, les types
et le build absents. Elle ne protège pas les PR contre les deux bugs effectivement
reproduits. La CI réparée utilise Node 24, npm ci, verify et la couverture, sur PR et
push vers main. Ses permissions sont limitées à contents: read. Les commandes sont
vérifiées localement ; aucun résultat GitHub Actions distant n'est inventé sans push.

Le hooksPath local est `.githooks`. Le script d'installation respecte un hooksPath
préexistant différent. Le lockfile source est conservé sans mise à jour forcée.
Le dépôt est resté au commit de référence ; aucun commit, push ou merge n'a été lancé.

`npm audit` a également mesuré 7 vulnérabilités dans l'outillage installé : 3 modérées,
2 hautes et 2 critiques. Elles sont signalées séparément. Une mise à jour de Vitest et
l'ajout de son module officiel ont été proposés ; en l'absence d'autorisation explicite,
aucune nouvelle dépendance ni mise à jour majeure n'a été appliquée. La couverture
native est l'alternative sans ajout. Node 24 est recommandé : Node 22.8 local déclenche
un avertissement d'engine pour un paquet de lint. Ce point ne doit pas être présenté
comme une réparation de dépendances achevée.

## 3. Session neuve et comparaison AVANT / APRÈS

La session initiale et les tentatives de vérification restent séparées. Une première
session APRÈS a produit une implémentation avec trois agents génériques, une revue
indépendante et verify vert ; elle a surtout démasqué la limite de sélection des profils.
Elle est conservée en préfixe 06 et n'est pas confondue avec la comparaison finale.

La comparaison finale est exécutée dans une nouvelle copie réparée, sans reprise de
session. L'endpoint et ses tests AVANT sont retirés **uniquement de cette copie** pour
éviter une relance triviale sur une fonctionnalité déjà présente. Les autres corrections,
le lanceur de rôles et le filet de vérification sont disponibles. La consigne est exactement
la même ; aucun conseil d'implémentation n'est ajouté par l'observateur.

La chaîne 08 a réellement arrêté la livraison sur BLOCKING : la revue considérait
les nouveaux fichiers non suivis comme absents d’un futur commit. Le profil de revue
examine désormais git status et le dossier complet. Aucun commit n’a été fait pour
obtenir un verdict vert. Un contrat vérifie aussi qu’un CLI sortant en 0 sans verdict
PASS du tester bloque la chaîne avant la revue.

La session neuve finale 09 a exécuté dev, puis tester et reviewer dans des sessions
Codex indépendantes. Le tester a rendu PASS après 43 tests réussis / 1 ignoré et un
parcours HTTP réel. Le reviewer a rendu BLOCKING : la copie de comparaison ne
contenait pas DIAGNOSTIC.md pourtant référencé par son README. Ce fichier était
présent dans le dépôt principal, mais le protocole de copie l’avait omis. C’est une
incohérence réelle du paquet de comparaison, pas un défaut de l’endpoint.
La trace 09 et son code de sortie 1 sont conservés, sans les renommer en succès.

La documentation de cette copie est complétée après ce verdict. Le code de dev est
figé et conservé dans preuves/apres/09-code-produit/. Une revue indépendante supplémentaire
10 a encore bloqué sur le workflow CI absent de la copie, alors qu’il était présent
dans le dépôt principal. L’inventaire systématique des fichiers suivis a ensuite permis
de compléter .github/workflows/ci.yml, .gitignore et .husky/pre-commit. La revue 11 a encore identifié le hook Husky historique et le lien absolu vers
node_modules utilisé par la copie. Le hook est réparé comme décrit plus haut ; les
dépendances déjà installées sont copiées dans un vrai dossier de la copie, sans
installation ni mise à jour. Le motif node_modules de .gitignore couvre maintenant
les dossiers et les liens. L’ancien lien temporaire est conservé séparément.
Ces corrections concernent le paquet et le harness, pas l’algorithme de disponibilité.
La revue intermédiaire 12 porte sur le même code métier, empreintes inchangées ; tous les
verdicts précédents restent conservés.
La revue 12 a enfin relevé la table d’endpoints incomplète et l’ambiguïté créée par
la copie du diagnostic principal dans un paquet aux chiffres différents. La table
est complétée et la copie reçoit son propre diagnostic (roomId/date/slots,
43 réussis, 1 ignoré, 6 fichiers), tandis que ce rapport décrit clairement le dépôt
principal et la comparaison. Le résultat final est **revue 13 : NOTHING FOUND**, puis
**verify après revue : code 0**, neuf contrats et six mutations détectées. Les 19 fichiers
source/test figurant dans l’inventaire figé restent inchangés ; la vérification par
empreintes est conservée dans le résultat final. Aucun code métier n’a été corrigé
par l’observateur après dev/tester.

Preuves de clôture : [revue et vérification réelles](captures/13-revue-et-validation-apres.png),
[verdict brut](preuves/apres/13-revue-finale.txt),
[verify après revue](preuves/apres/13-validation-apres.txt),
[résultat final structuré](preuves/apres/13-resultat-final.json),
[documents propres à la copie](preuves/apres/13-paquet-comparaison/),
[hook historique réellement vérifié](captures/13-hook-legacy-verification.png).
La chaîne 09 reste enregistrée en échec : la clôture 13 est une suite de revue et
réparation documentaire du même travail, pas une réécriture de sa trace ni une
nouvelle implémentation cachée.
La copie reste un artefact de comparaison : elle n’écrase pas le dépôt
principal et sa suite de régression plus complète.

| Observation | AVANT, session effective | APRÈS, session neuve 09 |
|---|---|---|
| Tâche | consigne littérale | même consigne littérale |
| Modèle CLI | gpt-5.5 | gpt-5.5 |
| Implémentation | agent général seul | dev autonome en workspace-write |
| Vérification indépendante | aucune | tester puis reviewer en read-only |
| Tests découverts en fin de tâche | 11 réussis / 4 ignorés | 43 réussis / 1 ignoré, 6 fichiers |
| Transport HTTP | doubles après blocage du sandbox | vrai serveur loopback, autorisations distinctes |
| Contrôle final | lint et types peu contraignants | types stricts, lint, build, contrats et mutations |
| Réponse de l’endpoint | room, date, slots | roomId, date, slots |
| Résultat de la chaîne | tâche annoncée terminée malgré les tests cachés | arrêt sur incohérence documentaire, même avec tests verts |

Le schéma précis du JSON n’était pas imposé par la consigne : les deux réponses
expriment les mêmes créneaux UTC. La variante APRÈS utilise les millisecondes ISO ;
le dépôt livré conserve room/date/slots et sa suite de 51 tests réussis / 1 ignoré,
7 fichiers. Ne pas comparer 43 et 51 comme deux résultats de la même suite.
La préparation a retiré les anciens tests de disponibilité uniquement dans la copie ;
les nouveaux tests y sont écrits par dev sans consulter les preuves AVANT.

Les sandboxes effectifs et tokens sont exportés dans
[preuves/apres/09-metadonnees-sessions.json](preuves/apres/09-metadonnees-sessions.json).
Pour les sessions effectives seulement (hors essais de configuration et travail de
l’observateur), les compteurs sont :

| Compteur agrégé | AVANT, une session | APRÈS 09, trois sessions |
|---|---:|---:|
| Tokens d’entrée | 1 038 476 | 1 246 887 |
| Tokens d’entrée en cache, inclus dans la ligne précédente | 930 944 | 1 122 944 |
| Tokens de sortie | 11 523 | 14 660 |

Ces compteurs répètent le contexte entre requêtes : ils ne mesurent pas une fenêtre
unique de plus d’un million de tokens. Ils ne comprennent pas le coût de tous les
essais du TP ni les revues supplémentaires 10, 11, 12 et 13. On n’observe pas une économie totale
sur cet échantillon : trois sessions indépendantes ajoutent du travail de contrôle.
L’environnement change aussi (MCP globaux exclus par --ignore-user-config après,
contrôles renforcés et autorisations réseau), donc aucune causalité de coût n’est
attribuée au seul changement des prompts. Les sorties de rôle restent courtes et
les historiques sont séparés ; c’est une règle de contexte vérifiée, pas une promesse
d’économie chiffrée. Le total des sept sessions 09 à 13, en incluant les
revues correctives, est 3 041 691 tokens d’entrée (dont
2 748 672 en cache) et 34 574 tokens de sortie.
Il reste distinct des essais 06/07/08 et du travail de l’observateur.


Les métadonnées prouvent les modes reçus ; les contrôles nécessitant une écriture
temporaire ou loopback peuvent être autorisés séparément par auto-review.
Read-only n’est donc pas présenté comme une interdiction absolue de toute opération
exceptionnelle. Les briefs autonomes évitent de recopier l’historique du parent.

Preuves : [protocole 09](preuves/apres/09-apres-protocole.json),
[trace 09](preuves/apres/09-apres-chaine.txt),
[sessions 09](preuves/apres/09-preuves-sessions/),
[code complet de comparaison](preuves/apres/09-code-produit/),
[validation du dépôt principal](captures/09-verification-finale.png),
[API compilée](captures/09-api-disponibilite.png),
[réponses HTTP réelles](preuves/apres/09-api-controles.json).


## Choix volontairement conservés et limites du rendu

- Stockage en mémoire et absence de base réelle : décision documentée, pas un défaut
  à corriger en inventant une migration. Aucun changement de store.ts.
- Filtre *.spec.ts : convention voulue, les anciens noms de tests ont été corrigés.
- Skip legacy : absence réelle de fixture, justification conservée.
- Hook post-écriture informatif : comportement voulu, complété par un filet bloquant.
- Exceptions locales JSDoc et écriture de notes/plans par les rôles concernés : scope
  explicite ; ne pas les compter comme permissions de modifier le code.
- Absence de MCP de projet actifs et absence initiale de skills : défendables pour
  cette API locale. L'absence seule ne constitue pas une erreur.
- Authentifications/services distants non utilisés ; CI distante non exécutée ;
  publication non faite sans autorisation.
- Dépendances vulnérables mesurées mais non mises à jour sans accord.
- Les profils Codex sont lancés par le wrapper parce que le sélecteur natif du CLI
  utilisé ne les applique pas. Les essais infructueux et les limites sont conservés.

## Reproduire les vérifications

```bash
npm run check
npm run test:harness
npm run test:mutation
npm run test:coverage
npm run verify
git diff --check
npm start
# Dans un autre terminal :
curl 'http://localhost:3000/rooms/salle-a/availability?date=2026-10-05'
```

Le rendu contient le code réparé, ce diagnostic et l'index `captures/README.md` avec
les images, complété par [preuves/README.md](preuves/README.md) pour les traces et protocoles. La préparation du commit/push pourra être faite
après autorisation ; l'origine actuelle reste le dépôt fourni en séance.


## Organisation et clôture du rendu

Le TP est terminé techniquement. Aucun commit ni push n’a été effectué. Aucun secret
n’est nécessaire au fonctionnement de l’API. Les captures visuelles sont dans
[captures/](captures/README.md) ; les traces brutes, résultats, copies de code et
métadonnées sont dans [preuves/](preuves/README.md), classés par phase. Les preuves
et les images sont déplacées ou conservées sans changement de contenu ; une
[table de correspondance avec empreintes](preuves/validation/organisation-rendu.json)
permet de retrouver leurs anciens chemins, mentionnés dans les sorties historiques.
Ces références historiques ne sont pas réécrites dans les preuves brutes.

Les sessions finder, explorer et planner déjà exécutées sont conservées sous le
préfixe 06 dans preuves/apres/. Le test du finder a confirmé son sandbox read-only ;
les sorties d’explorer et planner sont archivées sans inventer de métadonnées absentes.
Les informations importantes de REPRISE_TP2.md (états des sessions, réparations,
résultats, limites et absence de publication) figurent ici et dans les preuves associées.
Ce fichier temporaire est retiré du rendu ; aucune expérience n’est à recommencer.

### Repères visuels pour le correcteur

- **AVANT :** [session initiale en cours](captures/02-avant-en-cours.png),
  [endpoint initial absent](captures/01-avant-endpoint-original.png).
- **APRÈS :** [revue finale et validation](captures/13-revue-et-validation-apres.png),
  [API réparée](captures/09-api-disponibilite.png).
- **Dépôt principal :** [vérification complète et hook](captures/13-hook-legacy-verification.png).
- [Toutes les captures et leur portée](captures/README.md).

La relecture du résultat AVANT prise à la finalisation est identifiée comme telle ;
elle n’est pas présentée comme une capture contemporaine de la fin de la session.
coverage/, dist/ et node_modules/ sont générés et exclus du Git : aucun fichier de
ces dossiers n’était suivi au commit d’origine. Les traces .log sous preuves/ restent
incluses pour ne pas perdre les preuves historiques. Le prochain acte éventuel est
la publication, uniquement après autorisation explicite.


### Contrôles du rendu après classement

Aucune expérience AVANT/APRÈS, aucun changement du comportement applicatif et aucun
changement du harness fonctionnel n’ont été effectués pour préparer le rendu. Les seuls
contrôles d’exécution relancés sont [npm run verify](preuves/validation/controle-final-verify.txt),
[npm run test:coverage](preuves/validation/controle-final-coverage.txt) et git diff --check.
Les trois réussissent : 51 tests applicatifs réussis, 1 legacy ignoré, 9 contrats et
6 mutations détectées ; couverture native de 8 modules sur 9 et 18 fonctions nommées
exercées sur 18 dans les modules chargés. Les définitions et limites de ces mesures
restent celles indiquées plus haut.

L’[intégrité et la recherche de secrets](preuves/validation/controle-integrite-et-secrets.json)
confirment les preuves/images inchangées, les 58 fichiers fonctionnels inchangés,
aucun candidat secret détecté dans les textes versionnables inspectés et le fichier
.env original inchangé. La [vérification des liens](preuves/validation/controle-liens-markdown.json)
recense tous les liens locaux Markdown et les références historiques conservées.
Les copies brutes ne sont pas réécrites pour moderniser leurs chemins.
