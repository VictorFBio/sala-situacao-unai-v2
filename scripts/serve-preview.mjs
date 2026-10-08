import http from 'node:http';
import path from 'node:path';
import {stat,readFile,access} from 'node:fs/promises';
const args=Object.fromEntries(process.argv.slice(2).map(arg=>{const at=arg.indexOf('=');return [arg.slice(0,at).replace(/^--/,''),arg.slice(at+1)];}));
const root=path.resolve(args.dir||'dist-ecossistema');
const base=args.base||'/';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.pdf':'application/pdf','.csv':'text/csv; charset=utf-8'};
http.createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,'http://localhost');
    if(!url.pathname.startsWith(base)) {res.writeHead(404).end('Fora da base');return;}
    let file=path.resolve(root,decodeURIComponent(url.pathname.slice(base.length))||'index.html');
    const relative=path.relative(root,file);
    if(relative.startsWith('..')||path.isAbsolute(relative)) {res.writeHead(403).end();return;}
    if(args['fault-marker']&&url.pathname.endsWith('/dashboard-data.json')) {
      try {await access(args['fault-marker']);res.writeHead(503).end('Falha simulada de homologação');return;} catch {}
    }
    const info=await stat(file);
    if(info.isDirectory()) {
      if(!url.pathname.endsWith('/')) {res.writeHead(301,{Location:url.pathname+'/'+url.search}).end();return;}
      file=path.join(file,'index.html');
    }
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
    res.end(await readFile(file));
  } catch {res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'}).end(await readFile(path.join(root,'404.html')).catch(()=>Buffer.from('Não encontrado')));}
}).listen(Number(args.port||4173),'127.0.0.1',()=>console.log(`Prévia: http://127.0.0.1:${args.port||4173}${base}`));
