from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from datetime import datetime,timezone
import subprocess,json
ROOT=Path('/Users/altan/Desktop/tp-ia/tp2-soran-aaa')
RUNS={
 'avant':('/private/tmp/tp2-original',['npm','run','test:unit']),
 'tests-exclus':('/private/tmp/tp2-original',['./node_modules/.bin/vitest','run','--config','vitest.audit.config.ts']),
 'apres':(str(ROOT),['npm','run','verify']),
 'couverture':(str(ROOT),['npm','run','test:coverage']),
 'hooks':(str(ROOT),['npm','run','test:harness'])}
PAGE='''<!doctype html><meta charset="utf-8"><title>TP2 · Preuve d'exécution</title><style>body{background:#10141c;color:#e6ecf5;font:16px system-ui;margin:28px}h1{font-size:25px}pre{white-space:pre-wrap;font:14px monospace;background:#171f2c;padding:16px;border:1px solid #4b5d7b}#status{color:#9fccff}</style><h1>TP2 — SORAN / AAA · Exécution réelle</h1><p>Sortie reçue en direct du processus lancé localement. Aucun copier-coller de terminal.</p><p id="status">Démarrage…</p><pre id="terminal"></pre><script>async function run(){let q=new URLSearchParams(location.search), name=q.get('run')||'avant';document.getElementById('status').textContent='Contrôle : '+name+' · '+new Date().toISOString();let res=await fetch('/stream?run='+encodeURIComponent(name));let reader=res.body.getReader(),decoder=new TextDecoder(),out=document.getElementById('terminal');for(;;){let {done,value}=await reader.read();if(done)break;out.textContent+=decoder.decode(value,{stream:true});}document.getElementById('status').textContent+=' · Terminé';}run()</script>'''
class Handler(BaseHTTPRequestHandler):
 def do_GET(self):
  url=urlparse(self.path);q=parse_qs(url.query)
  if url.path=='/stream':
   name=q.get('run',['avant'])[0]
   if name not in RUNS:self.send_error(400);return
   cwd,args=RUNS[name];self.send_response(200);self.send_header('Content-Type','text/plain; charset=utf-8');self.send_header('Cache-Control','no-store');self.end_headers()
   start=datetime.now(timezone.utc).isoformat();header=f'UTC : {start}\nDossier : {cwd}\n$ '+ ' '.join(args)+'\n\n'
   self.wfile.write(header.encode());self.wfile.flush()
   log=ROOT/'captures'/('05-live-'+name+'.txt')
   with log.open('w') as f:
    f.write(header);p=subprocess.Popen(args,cwd=cwd,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True)
    for line in p.stdout:f.write(line);f.flush();self.wfile.write(line.encode());self.wfile.flush()
    code=p.wait();end=f'\nCODE SORTIE : {code}\n';f.write(end);self.wfile.write(end.encode());self.wfile.flush()
  else:
   self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8');self.end_headers();self.wfile.write(PAGE.encode())
 def log_message(self,*args):pass
ThreadingHTTPServer(('127.0.0.1',8763),Handler).serve_forever()
