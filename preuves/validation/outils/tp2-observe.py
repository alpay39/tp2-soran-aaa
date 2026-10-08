from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
import json, html
ROOT=Path('/Users/altan/Desktop/tp-ia/tp2-soran-aaa/captures')
PAGE='''<!doctype html><meta charset="utf-8"><title>TP2 · Observateur Codex</title><style>body{background:#10141c;color:#e6ecf5;font:16px system-ui;margin:28px}header{border-bottom:1px solid #53617b;padding-bottom:16px}h1{font-size:25px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:14px monospace;background:#1b2230;padding:18px;border:1px solid #3b4961;border-radius:8px}small{color:#a9b7cd}</style><header><h1>TP2 — SORAN / AAA · Session Codex AVANT</h1><p>Consigne exacte : Ajoute un endpoint GET /rooms/:id/availability?date=YYYY-MM-DD qui renvoie les créneaux libres d'une salle sur la journée demandée, avec ses tests.</p><small>Observateur local en direct des événements JSONL produits par le processus Codex. Aucun événement inventé, aucune correction de la session.</small></header><p id="state"></p><div id="events"></div><script>async function refresh(){let d=await(await fetch('/state')).json();document.getElementById('state').textContent=d.summary;document.getElementById('events').replaceChildren(...d.events.map(e=>{let p=document.createElement('pre');p.textContent=e;return p}));}refresh();setInterval(refresh,2000)</script>'''
class Handler(BaseHTTPRequestHandler):
 def do_GET(self):
  if self.path=='/state':
   events=[];sessions=[];usage=[]
   for line in (ROOT/'02-avant-session.jsonl').read_text().splitlines():
    try:d=json.loads(line)
    except ValueError:continue
    if d.get('type')=='thread.started':sessions.append(d.get('thread_id'))
    if d.get('type')=='turn.completed':usage.append(d.get('usage'))
    it=d.get('item',{})
    if it.get('type')=='command_execution' and d['type']=='item.completed':events.append('$ '+it.get('command','')+'\n'+it.get('aggregated_output','')+'\nCode sortie : '+str(it.get('exit_code')))
    if it.get('type')=='agent_message':events.append(it.get('text',''))
    if d.get('type') in ('turn.completed','turn.failed'):events.append(json.dumps(d,ensure_ascii=False))
   body=json.dumps({'summary':f'Sessions : {sessions} | Événements affichés : {len(events)} | Usage : {usage}','events':events[-4:]},ensure_ascii=False).encode();ct='application/json'
  else:body=PAGE.encode();ct='text/html; charset=utf-8'
  self.send_response(200);self.send_header('Content-Type',ct);self.end_headers();self.wfile.write(body)
 def log_message(self,*args):pass
ThreadingHTTPServer(('127.0.0.1',8762),Handler).serve_forever()
