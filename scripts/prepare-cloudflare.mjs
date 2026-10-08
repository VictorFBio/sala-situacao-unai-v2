import {readFile,writeFile,readdir,lstat,mkdir,cp,rename,rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash,randomUUID} from 'node:crypto';
import {validateBuildOutput} from './publication-policy.mjs';
import {verifyStaticLinks} from './compose-site.mjs';

const routes=['painel-de-monitoramento','mapas-de-saude','rede-de-saude','boletins','dados','analises','sobre'];
const dataNames=['dashboard-data.json','fontes.json','imagem-satelite.json','indicadores-resumo.json','mapa-servicos.json'];
function nested(parent,child) {const rel=path.relative(parent,child);return !rel||(!rel.startsWith('..')&&!path.isAbsolute(rel));}
async function filesIn(directory,prefix='') {
  const files=[];
  for(const entry of await readdir(directory,{withFileTypes:true})) {
    const absolute=path.join(directory,entry.name),relative=prefix+entry.name;
    const info=await lstat(absolute);
    if(info.isSymbolicLink()||(!info.isDirectory()&&!info.isFile())) throw Error(`Arquivo proibido: ${relative}`);
    if(['functions','_worker.js','_routes.json','_headers','_redirects'].includes(entry.name)) throw Error(`Configuração de servidor não autorizada: ${relative}`);
    if(info.isDirectory()) files.push(...await filesIn(absolute,relative+'/'));
    else files.push({relative,size:info.size});
  }
  return files;
}

export async function prepareCloudflare({source,output}) {
  source=path.resolve(source);output=path.resolve(output);
  if(nested(source,output)||nested(output,source)) throw Error('Diretório de saída precisa ser separado da origem');
  const info=JSON.parse(await readFile(path.join(source,'build-info.json'),'utf8'));
  if(info.basePath!=='/') throw Error('Cloudflare requer base / para o domínio e pages.dev');
  if(!['homologacao','producao'].includes(info.environment)) throw Error('Ambiente desconhecido');
  const files=await filesIn(source);
  await validateBuildOutput(source,info.publicationReviews||[]);
  if(files.length+2>20000) throw Error('Limite gratuito de 20 mil arquivos excedido');
  if(files.some(file=>file.size>25*1024*1024)) throw Error('Arquivo acima do limite gratuito de 25 MiB');
  for(const required of ['index.html','404.html',...routes.map(route=>`${route}/index.html`)]) {
    if(!files.some(file=>file.relative===required)) throw Error(`Página obrigatória ausente: ${required}`);
  }
  for(const name of dataNames) {
    const bytes=await readFile(path.join(source,'painel-de-monitoramento/data',name));
    if(createHash('sha256').update(bytes).digest('hex')!==info.dataHashes?.[name]) throw Error(`Dados divergentes: ${name}`);
  }
  await verifyStaticLinks(source,'/');
  // Pages soma cabeçalhos de regras coincidentes; remover no-cache antes de
  // aplicar immutable somente aos JS/CSS com hash gerados pelo Vite.
  const hashedAssets=files.filter(file=>/^(?:painel-de-monitoramento\/)?assets\/[-a-zA-Z0-9_]+-[a-zA-Z0-9_-]{8,32}\.(?:js|css)$/.test(file.relative)).slice(0,99);
  const headers=`/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Cache-Control: no-cache
${info.environment==='homologacao'?'  X-Robots-Tag: noindex, nofollow\n':''}
`+hashedAssets.map(file=>`/${file.relative}\n  ! Cache-Control\n  Cache-Control: public, max-age=31536000, immutable\n`).join('\n');
  const redirects='# Pastas reais; sem proxy, funções ou fallback SPA global.\n'+routes.map(route=>`/${route} /${route}/ 301`).join('\n')+'\n';
  const stage=path.join(path.dirname(output),`.cloudflare-stage-${randomUUID()}`);
  const previous=path.join(path.dirname(output),`.cloudflare-previous-${randomUUID()}`);
  await mkdir(path.dirname(output),{recursive:true});
  try {
    await cp(source,stage,{recursive:true});
    await writeFile(path.join(stage,'_headers'),headers);
    await writeFile(path.join(stage,'_redirects'),redirects);
    await writeFile(path.join(stage,'build-info.json'),JSON.stringify({...info,hosting:{provider:'cloudflare-pages',mode:'static-direct-upload',functions:false}},null,2)+'\n');
    let moved=false;
    try {await rename(output,previous);moved=true;} catch(error) {if(error.code!=='ENOENT') throw error;}
    try {await rename(stage,output);} catch(error) {if(moved) await rename(previous,output);throw error;}
    if(moved) await rm(previous,{recursive:true,force:true});
    return {output,files:files.length+2,bytes:files.reduce((sum,file)=>sum+file.size,0),environment:info.environment};
  } finally {await rm(stage,{recursive:true,force:true});}
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const args=Object.fromEntries(process.argv.slice(2).map(value=>{const index=value.indexOf('=');if(index<3) throw Error('Use --opcao=valor');return [value.slice(2,index),value.slice(index+1)];}));
  console.log(JSON.stringify(await prepareCloudflare({source:args.source||'dist-ecossistema',output:args.out||'dist-ecossistema-cloudflare'})));
}
