"""Conserver les seules sessions créées par le pipeline final, sans exporter les rollouts internes."""
from pathlib import Path
import json, shutil, re
ROOT=Path(__file__).resolve().parents[2]
SNAPSHOT=Path('/private/tmp/tp2-apres-final09-soran-aaa')
DEST=ROOT/'captures/09-preuves-sessions'
for name in ('agents','chains'):
 src=SNAPSHOT/'.codex/scratch'/name
 if src.exists():shutil.copytree(src,DEST/name,dirs_exist_ok=True)
origins={}
for phase, filename in [("09","09-apres-chaine.txt"),("10","10-revue-apres.txt"),("11","11-revue-finale.txt"),("12","12-revue-finale.txt"),("13","13-revue-finale.txt")]:
 for match in re.findall(r"Preuves : ([^\s]+)", (ROOT/"captures"/filename).read_text()):origins[Path(match).name]=phase
rows=[]
for folder in sorted((DEST/'agents').glob('*')):
 if not (folder/'invocation.json').exists():continue
 inv=json.loads((folder/'invocation.json').read_text())
 events=[json.loads(l) for l in (folder/'events.jsonl').read_text().splitlines() if l.startswith('{')]
 ids=[e['thread_id'] for e in events if e.get('type')=='thread.started']
 usage=[e['usage'] for e in events if e.get('type')=='turn.completed']
 policy=None
 if ids:
  paths=list(Path('/Users/altan/.codex/sessions').rglob('*'+ids[0]+'.jsonl'))
  if paths:
   entries=[json.loads(l) for l in paths[0].read_text().splitlines()]
   contexts=[e['payload'] for e in entries if e.get('type')=='turn_context']
   if contexts:policy=contexts[-1].get('sandbox_policy')
 phase=origins.get(folder.name,'inconnue')
 rows.append({'phase':phase,'invocation':inv,'thread_id':ids[0] if ids else None,'actual_sandbox':policy,'usage':usage[-1] if usage else None,'evidence_directory':str(folder.relative_to(ROOT))})
before=[]
for l in (ROOT/'captures/02-avant-session.jsonl').read_text().splitlines():
 try:e=json.loads(l)
 except ValueError:continue
 if e.get('type')=='turn.completed':before.append(e['usage'])
report={'method':'usage turn.completed des sessions CLI et sandbox_policy du dernier turn_context réel ; les inputs agrégés répètent le contexte et ne sont pas une taille unique de contexte','before_usage':before,'after_sessions':rows}
(ROOT/'captures/09-metadonnees-sessions.json').write_text(json.dumps(report,indent=2,ensure_ascii=False))
print(json.dumps([{'role':r['invocation']['role'],'sandbox':r['actual_sandbox'],'usage':r['usage']} for r in rows],ensure_ascii=False))
