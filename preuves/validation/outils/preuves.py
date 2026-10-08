"""Serveur local de preuves : sorties de processus et traces Codex réelles."""
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from datetime import datetime, timezone
import subprocess, os
ROOT=Path(__file__).resolve().parents[2]
PAGE='''<!doctype html><meta charset="utf-8"><title>TP2 SORAN / AAA · Preuves finales</title><style>body{background:#10141c;color:#e6ecf5;font:16px system-ui;margin:28px}h1{font-size:25px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:14px monospace;background:#171f2c;padding:16px;border:1px solid #4b5d7b}p{color:#b9cce6}</style><h1>TP2 — SORAN / AAA · Preuve réelle</h1><p id="status"></p><pre id="out"></pre><script>let mode=new URLSearchParams(location.search).get('run')||'session';async function refresh(){document.querySelector('#status').textContent=mode+' · '+new Date().toISOString();if(mode==='session'||mode==='review'||mode==='before'||mode==='legacy'){let r=await fetch('/trace?run='+mode);document.querySelector('#out').textContent=await r.text();}else{let r=await fetch('/stream?run='+mode),rd=r.body.getReader(),dec=new TextDecoder();for(;;){let v=await rd.read();if(v.done)break;document.querySelector('#out').textContent+=dec.decode(v.value,{stream:true});}document.querySelector('#status').textContent+=' · terminé';}}refresh();if(mode==='session'||mode==='review'||mode==='before'||mode==='legacy')setInterval(refresh,4000)</script>'''
class Handler(BaseHTTPRequestHandler):
 def do_GET(self):
  url=urlparse(self.path)
  if url.path=='/trace':
   mode=parse_qs(url.query).get('run',['session'])[0]
   filename={'review':'13-revue-finale.txt','before':'02-avant-reponse.md','legacy':'12-hook-legacy-validation.txt'}.get(mode,'09-apres-chaine.txt')
   data='Source réelle : '+filename+'\n\n'+(ROOT/'captures'/filename).read_text()
   if mode=='before':data='Relecture prise à la finalisation ; contenu de la session AVANT conservé, pas une capture contemporaine de sa fin.\n\n'+data
   if mode=='review' and (ROOT/'captures/13-validation-apres.txt').exists():data+='\n'+(ROOT/'captures/13-validation-apres.txt').read_text()
   # L'observateur n'envoie aucune instruction à la chaîne.
   self.send_response(200);self.end_headers();self.wfile.write(data.encode());return
  if url.path=='/stream':
   mode=parse_qs(url.query).get('run',[''])[0]
   if mode not in ('verify','coverage'):self.send_error(400);return
   args=['npm','run','verify' if mode=='verify' else 'test:coverage']
   env=dict(os.environ);env['PATH']='/Users/altan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:'+env['PATH']
   self.send_response(200);self.send_header('Content-Type','text/plain; charset=utf-8');self.end_headers()
   log=ROOT/'captures'/('09-final-'+mode+'.txt')
   with log.open('w') as f:
    header=f'UTC : {datetime.now(timezone.utc).isoformat()}\nDossier : {ROOT}\nCommande : {args}\n'
    f.write(header);self.wfile.write(header.encode());self.wfile.flush()
    p=subprocess.Popen(args,cwd=ROOT,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True)
    for line in p.stdout:
     f.write(line);f.flush();self.wfile.write(line.encode());self.wfile.flush()
    end=f'\nCODE SORTIE : {p.wait()}\n';f.write(end);self.wfile.write(end.encode());self.wfile.flush()
   return
  self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8');self.end_headers();self.wfile.write(PAGE.encode())
 def log_message(self,*args):pass
ThreadingHTTPServer(('127.0.0.1',8766),Handler).serve_forever()
