import http from 'node:http';
import path from 'node:path';
import {open,readFile,access} from 'node:fs/promises';
import {constants} from 'node:fs';
const args=Object.fromEntries(process.argv.slice(2).map(arg=>{const at=arg.indexOf('=');return [arg.slice(0,at).replace(/^--/,''),arg.slice(at+1)];}));
const root=path.resolve(args.dir||'dist-ecossistema');
const base=args.base||'/';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.pdf':'application/pdf','.csv':'text/csv; charset=utf-8'};
http.createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,'http://localhost');
    if(!url.pathname.startsWith(base)) {res.writeHead(404).end('Fora da base');return;}
    let file=path.resolve(root,decodeURIComponent(url.pathname.slice(base.length)));
    const relative=path.relative(root,file);
    if(relative.startsWith('..')||path.isAbsolute(relative)) {res.writeHead(403).end();return;}
    if(args['fault-marker']&&url.pathname.endsWith('/dashboard-data.json')) {
      try {await access(args['fault-marker']);res.writeHead(503).end('Falha simulada de homologação');return;} catch {}
    }
    if(url.pathname.endsWith('/')) file=path.join(file,'index.html');
    else if(!path.extname(file)) {
      const index=await open(path.join(file,'index.html'),constants.O_RDONLY|(constants.O_NOFOLLOW||0));
      await index.close();
      res.writeHead(301,{Location:url.pathname+'/'+url.search}).end();return;
    }
    const handle=await open(file,constants.O_RDONLY|(constants.O_NOFOLLOW||0));
    try {
      if(!(await handle.stat()).isFile()) throw Error('Recurso não é arquivo');
      const content=await handle.readFile();
      res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
      res.end(content);
    } finally {await handle.close();}
  } catch {res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'}).end(await readFile(path.join(root,'404.html')).catch(()=>Buffer.from('Não encontrado')));}
}).listen(Number(args.port||4173),'127.0.0.1',()=>console.log(`Prévia: http://127.0.0.1:${args.port||4173}${base}`));
