from http.server import ThreadingHTTPServer,BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse,parse_qs
import json
ROOT=Path('/Users/altan/Desktop/tp-ia/tp2-soran-aaa/captures')
PAGE='''<!doctype html><meta charset="utf-8"><title>TP2 · Session finale Codex</title><style>body{background:#10141c;color:#e6ecf5;font:16px system-ui;margin:28px}h1{font-size:25px}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#192333;padding:16px;border:1px solid #4b617b;font:14px monospace}.hint{color:#afbed6}#status{color:#a6d1ff}</style><h1 id="title">TP2 — SORAN / AAA · Observateur de session</h1><p>Consigne exacte : Ajoute un endpoint GET /rooms/:id/availability?date=YYYY-MM-DD qui renvoie les créneaux libres d'une salle sur la journée demandée, avec ses tests.</p><p class="hint">Affichage direct des événements et sorties réels. L'observateur ne fournit aucun conseil à la session.</p><p id="status"></p><div id="events"></div><script>async function update(){const phase=new URLSearchParams(location.search).get('phase')||'07';document.getElementById('title').textContent='TP2 — SORAN / AAA · '+(phase==='02'?'AVANT':'APRÈS FINAL');const d=await(await fetch('/state?phase='+phase)).json();document.getElementById('status').textContent=d.state;document.getElementById('events').replaceChildren(...d.events.map(e=>{const p=document.createElement('pre');p.textContent=e;return p}));}update();setInterval(update,2000)</script>'''
class Handler(BaseHTTPRequestHandler):
 def do_GET(self):
  url=urlparse(self.path);q=parse_qs(url.query)
  if url.path=='/state':
   phase=q.get('phase',['07'])[0];file=ROOT/('02-avant-session.jsonl' if phase=='02' else '07-apres-session.jsonl');events=[];state=[]
   for line in file.read_text().splitlines():
    try:d=json.loads(line)
    except ValueError:continue
    i=d.get('item',{})
    if d['type']=='thread.started':state.append('Thread : '+d['thread_id'])
    if i.get('type')=='command_execution' and d['type']=='item.completed':
     if 'scripts/agent.mjs' in i.get('command','') or 'npm run verify' in i.get('command',''):events.append('$ '+i['command']+'\n'+i.get('aggregated_output','')+'\nCode sortie : '+str(i.get('exit_code')))
    if i.get('type')=='agent_message' and d['type']=='item.completed':events.append(i.get('text',''))
    if d['type']=='turn.completed':state.append('Terminé · Usage : '+json.dumps(d.get('usage',{})))
   data=json.dumps({'state':' | '.join(state),'events':events[-6:]},ensure_ascii=False).encode();ct='application/json'
  else:data=PAGE.encode();ct='text/html; charset=utf-8'
  self.send_response(200);self.send_header('Content-Type',ct);self.end_headers();self.wfile.write(data)
 def log_message(self,*args):pass
ThreadingHTTPServer(('127.0.0.1',8765),Handler).serve_forever()
