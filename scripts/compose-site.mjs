import { readFile, writeFile, mkdir, cp, readdir, lstat, stat, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { validatePublicationFiles, validateBuildOutput } from './publication-policy.mjs';

const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const sha=value=>/^[a-f0-9]{40}$/.test(value||'');
function within(parent,child) { const relative=path.relative(parent,child); if(!relative||relative.startsWith('..')||path.isAbsolute(relative)) throw new Error('Caminho fora da área de saída'); return child; }
function run(command,args,cwd,env=process.env) {
  const result=spawnSync(command,args,{cwd,env,stdio:'inherit',shell:false});
  if(result.error) throw result.error;
  if(result.status!==0) throw new Error(`Falha no comando ${path.basename(command)} (${result.status})`);
}
function gitHead(directory) {
  const result=spawnSync('git',['rev-parse','HEAD'],{cwd:directory,encoding:'utf8',shell:false});
  if(result.status!==0||!sha(result.stdout?.trim())) throw new Error('Não foi possível identificar o commit');
  return result.stdout.trim();
}
export function validateModuleManifest(manifest) {
  if(manifest.schemaVersion!==1||!Array.isArray(manifest.modules)||manifest.modules.length<2) throw new Error('Manifesto inválido');
  const ids=new Set(),destinations=[];
  for(const module of manifest.modules) {
    if(!/^[a-z][a-z0-9-]*$/.test(module.id||'')||ids.has(module.id)) throw new Error('Identificador inválido');
    ids.add(module.id);
    if(!/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(module.repository||'')) throw new Error('Repositório inválido');
    if(!sha(module.revision)&&!(module.id==='painel'&&module.revision==='self')) throw new Error('Referência precisa ser commit fixado');
    if(!/^\/(?:[a-z0-9-]+\/)*$/.test(module.destination||'')||destinations.includes(module.destination)||module.destination.startsWith('/_')||['/assets/','/data/'].includes(module.destination)) throw new Error('Conflito ou destino inválido');
    if(module.destination==='/'&&module.id!=='portal') throw new Error('Apenas portal pode ocupar o destino raiz');
    if(destinations.some(d=>d!=='/'&&module.destination!=='/'&&(d.startsWith(module.destination)||module.destination.startsWith(d)))) throw new Error('Conflito de destinos');
    destinations.push(module.destination);
    if(!/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(module.output||'')) throw new Error('Diretório de saída inválido');
    if(!Array.isArray(module.buildCommand)||module.buildCommand[0]!=='node'||!module.buildCommand[1]||module.buildCommand.some(arg=>typeof arg!=='string'||/[;&|`\r\n]/.test(arg)||arg.includes('..'))) throw new Error('Comando de compilação inválido; usar comando Node sem shell');
  }
  if(!ids.has('portal')||!ids.has('painel')||manifest.modules.find(m=>m.id==='painel').destination!=='/painel-de-monitoramento/'||manifest.modules.find(m=>m.id==='portal').destination!=='/') throw new Error('Portal e painel são obrigatórios');
  return manifest;
}

async function walk(directory,prefix='') {
  const files=[];
  for(const entry of await readdir(directory,{withFileTypes:true})) {
    const absolute=path.join(directory,entry.name);
    if((await lstat(absolute)).isSymbolicLink()) throw new Error(`Link simbólico não permitido: ${prefix+entry.name}`);
    if(entry.isDirectory()) files.push(...await walk(absolute,prefix+entry.name+'/'));
    else files.push({relative:prefix+entry.name,absolute});
  }
  return files;
}

export async function verifyStaticLinks(outputDir,basePath='/') {
  const files=await walk(outputDir);
  for(const file of files.filter(f=>f.relative.endsWith('.html'))) {
    const html=await readFile(file.absolute,'utf8');
    const pageUrl=new URL(basePath+file.relative,'https://portal.invalid');
    for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const raw=match[1].replace(/&amp;/g,'&');
      if(raw.startsWith('#')) continue;
      const url=new URL(raw,pageUrl);
      if(!['http:','https:'].includes(url.protocol)) throw new Error(`Protocolo de link inválido: ${file.relative}`);
      if(url.origin!==pageUrl.origin) continue;
      if(!url.pathname.startsWith(basePath)) throw new Error(`Link fora da base: ${raw}`);
      const relative=decodeURIComponent(url.pathname.slice(basePath.length));
      const target=path.resolve(outputDir,relative||'index.html');
      within(outputDir,target);
      try {
        const info=await stat(target);
        if(info.isDirectory()) await stat(path.join(target,'index.html'));
      } catch { throw new Error(`Recurso ausente: ${raw} em ${file.relative}`); }
    }
  }
  return {htmlFiles:files.filter(f=>f.relative.endsWith('.html')).length,totalFiles:files.length};
}

export async function composeSite({ portalDir, legacyDir, basePath='/', environment='homologacao', output='dist-ecossistema', skipTests=false }) {
  if(!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(basePath)) throw new Error('Base inválida');
  if(!['homologacao','producao'].includes(environment)) throw new Error('Ambiente inválido');
  if(!/^dist-ecossistema(?:-[a-z0-9-]+)?$/.test(output)) throw new Error('Saída deve ser dist-ecossistema ou variante de homologação');
  const manifest=validateModuleManifest(JSON.parse(await readFile(path.join(root,'modules.json'),'utf8')));
  const panelRevision=gitHead(root);
  await validatePublicationFiles(path.join(root,'public'),JSON.parse(await readFile(path.join(root,'public/publication-manifest.json'),'utf8')));
  if(!legacyDir) throw new Error('Pacote anterior obrigatório para compatibilidade de cache');
  const stage=within(root,path.join(root,`.compose-${randomUUID()}`));
  const destination=within(root,path.join(root,output));
  const previous=within(root,path.join(root,`.compose-previous-${randomUUID()}`));
  const versions=[];
  const outputReviews=[];
  const dataHashes={};
  try {
    await mkdir(stage);
    for(const module of [...manifest.modules].sort((a,b)=>a.id==='portal'?-1:b.id==='portal'?1:0)) {
      let source;
      if(module.id==='painel') source=root;
      else if(module.id==='portal'&&portalDir) source=path.resolve(portalDir);
      else {
        source=path.join(root,'.sources',module.id);
        try { await stat(path.join(source,'.git')); }
        catch { await mkdir(source,{recursive:true}); run('git',['init'],source); }
        run('git',['fetch','--depth=1',`https://github.com/${module.repository}.git`,module.revision],source);
        run('git',['checkout','--detach','FETCH_HEAD'],source);
      }
      const revision=gitHead(source);
      if(module.revision!=='self'&&revision!==module.revision) throw new Error(`Commit divergente: ${module.id}`);
      if(!skipTests) {
        const tests=(await readdir(path.join(source,'tests'))).filter(n=>n.endsWith('.test.mjs')).map(n=>`tests/${n}`);
        run(process.execPath,['--test',...tests],source,{...process.env,PANEL_SOURCE:root});
      }
      const command=module.buildCommand.slice(1);
      if(module.id==='portal') command.push(`--panel=${root}`,`--revision=${panelRevision}`,`--base=${basePath}`,`--environment=${environment}`);
      run(process.execPath,command,source,{...process.env,VITE_PORTAL_BASE:basePath});
      const built=path.join(source,module.output);
      let reviews=[];
      try { reviews=JSON.parse(await readFile(path.join(source,'public/publication-manifest.json'),'utf8')).files; }
      catch(error) { if(error.code!=='ENOENT') throw error; }
      await validateBuildOutput(built,reviews);
      outputReviews.push(...reviews.map(file=>({...file,path:module.destination.slice(1)+file.path})));
      const target=module.destination==='/'?stage:path.join(stage,module.destination.slice(1));
      if(module.id!=='portal') within(stage,target);
      await walk(built); // rejeita links simbólicos antes da cópia
      await cp(built,target,{recursive:true});
      versions.push({id:module.id,repository:module.repository,revision,destination:module.destination});
    }
    const panelData=path.join(stage,'painel-de-monitoramento/data');
    for(const name of ['dashboard-data.json','fontes.json','imagem-satelite.json','indicadores-resumo.json','mapa-servicos.json']) {
      const original=await readFile(path.join(root,'public/data',name));
      const built=await readFile(path.join(panelData,name));
      if(!original.equals(built)) throw new Error(`Dados alterados na composição: ${name}`);
      dataHashes[name]=createHash('sha256').update(original).digest('hex');
    }
    for(const folder of ['assets','data']) {
      const from=path.join(path.resolve(legacyDir),folder);
      const legacyFiles=await walk(from);
      if(legacyFiles.some(f=>!/^[-a-zA-Z0-9/_.]+\.(json|js|css|png|webp|svg|jpe?g)$/.test(f.relative))) throw new Error('Recurso legado inesperado');
      await cp(from,path.join(stage,folder),{recursive:true});
    }
    await writeFile(path.join(stage,'.nojekyll'),'');
    await writeFile(path.join(stage,'build-info.json'),JSON.stringify({schemaVersion:1,environment,basePath,builtAt:new Date().toISOString(),publisherRevision:panelRevision,modules:versions,dataHashes,legacy:{revision:manifest.legacy.revision,retentionDays:14,activationDate:null,note:'Recursos legados mantidos; definir data somente na ativação aprovada em produção.'}},null,2)+'\n');
    await validateBuildOutput(stage,outputReviews);
    const checks=await verifyStaticLinks(stage,basePath);
    const size=(await Promise.all((await walk(stage)).map(f=>stat(f.absolute)))).reduce((sum,s)=>sum+s.size,0);
    if(size>500*1024*1024) throw new Error('Pacote acima do limite interno de 500 MiB; revisar antes de publicar');
    let moved=false;
    try { await rename(destination,previous); moved=true; } catch(error) { if(error.code!=='ENOENT') throw error; }
    try { await rename(stage,destination); } catch(error) { if(moved) await rename(previous,destination); throw error; }
    if(moved) await rm(previous,{recursive:true,force:true});
    console.log(JSON.stringify({...checks,bytes:size,output:destination,modules:versions}));
    return {output:destination,...checks,bytes:size};
  } finally { await rm(stage,{recursive:true,force:true}); }
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const args=Object.fromEntries(process.argv.slice(2).map(x=>{const i=x.indexOf('=');return[x.slice(0,i).replace(/^--/,''),x.slice(i+1)];}));
  await composeSite({portalDir:args.portal,legacyDir:args.legacy,basePath:args.base||'/',environment:args.environment||'homologacao',output:args.out||'dist-ecossistema'});
}
