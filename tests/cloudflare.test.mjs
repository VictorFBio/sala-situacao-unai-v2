import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm,open,access} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';

const api=await import('../scripts/prepare-cloudflare.mjs').catch(()=>({}));
const names=['dashboard-data.json','fontes.json','imagem-satelite.json','indicadores-resumo.json','mapa-servicos.json'];
async function fixture(environment='homologacao') {
  const root=await mkdtemp(path.join(os.tmpdir(),'unai-cloudflare-'));
  const source=path.join(root,'source'),output=path.join(root,'prepared');
  await mkdir(source);
  for(const route of ['','painel-de-monitoramento','mapas-de-saude','rede-de-saude','boletins','dados','analises','sobre']) {
    await mkdir(path.join(source,route),{recursive:true});
    await writeFile(path.join(source,route,'index.html'),'<html lang="pt-BR"></html>');
  }
  await writeFile(path.join(source,'404.html'),'<html lang="pt-BR">Não encontrado</html>');
  await mkdir(path.join(source,'painel-de-monitoramento/assets'));
  await writeFile(path.join(source,'painel-de-monitoramento/assets/vendor-abcdefgh.js'),'export const exemplo=1;');
  await writeFile(path.join(source,'painel-de-monitoramento/assets/logo.png'),'imagem');
  await mkdir(path.join(source,'painel-de-monitoramento/data'));
  const dataHashes={};
  for(const name of names) {
    const data=Buffer.from('{"ausente":null}');
    await writeFile(path.join(source,'painel-de-monitoramento/data',name),data);
    dataHashes[name]=createHash('sha256').update(data).digest('hex');
  }
  await writeFile(path.join(source,'build-info.json'),JSON.stringify({basePath:'/',environment,dataHashes}));
  return {root,source,output};
}

test('publicação Cloudflare conserva JSON e limita cache de HTML, dados e recursos sem hash',async()=>{
  assert.equal(typeof api.prepareCloudflare,'function','preparador Cloudflare ainda não implementado');
  const f=await fixture();
  try {
    await api.prepareCloudflare(f);
    const headers=await readFile(path.join(f.output,'_headers'),'utf8');
    assert.match(headers,/Cache-Control: no-cache/);
    assert.match(headers,/\/painel-de-monitoramento\/assets\/vendor-abcdefgh\.js\n  ! Cache-Control\n  Cache-Control: public, max-age=31536000, immutable/);
    assert.doesNotMatch(headers,/\/assets\/\*|\/assets\/logo\.png\n  [^\n]*immutable/);
    assert.match(headers,/X-Robots-Tag: noindex, nofollow/);
    const redirects=await readFile(path.join(f.output,'_redirects'),'utf8');
    assert.match(redirects,/^\/painel-de-monitoramento \/painel-de-monitoramento\/ 301$/m);
    assert.doesNotMatch(redirects,/\*.*200|pages\.dev|https:/);
    for(const name of names) assert.deepEqual(await readFile(path.join(f.output,'painel-de-monitoramento/data',name)),await readFile(path.join(f.source,'painel-de-monitoramento/data',name)));
    assert.equal(JSON.parse(await readFile(path.join(f.output,'build-info.json'))).hosting.provider,'cloudflare-pages');
  } finally {await rm(f.root,{recursive:true,force:true});}
});

test('pacote preparado não publica ambiente errado, dados divergentes ou código de servidor',async()=>{
  assert.equal(typeof api.prepareCloudflare,'function');
  const f=await fixture('producao');
  try {
    await api.prepareCloudflare(f);
    assert.doesNotMatch(await readFile(path.join(f.output,'_headers'),'utf8'),/X-Robots-Tag/);
    const info=JSON.parse(await readFile(path.join(f.source,'build-info.json')));
    info.basePath='/homologacao/';
    await writeFile(path.join(f.source,'build-info.json'),JSON.stringify(info));
    await assert.rejects(api.prepareCloudflare(f),/base/);
    info.basePath='/';
    await writeFile(path.join(f.source,'build-info.json'),JSON.stringify(info));
    await writeFile(path.join(f.source,'painel-de-monitoramento/data/fontes.json'),'[]');
    await assert.rejects(api.prepareCloudflare(f),/Dados/);
    await writeFile(path.join(f.source,'painel-de-monitoramento/data/fontes.json'),'{"ausente":null}');
    await writeFile(path.join(f.source,'_worker.js'),'export default {}');
    await assert.rejects(api.prepareCloudflare(f),/servidor/);
  } finally {await rm(f.root,{recursive:true,force:true});}
});

test('arquivo acima de 25 MiB e credencial impedem substituição do pacote anterior',async()=>{
  assert.equal(typeof api.prepareCloudflare,'function');
  const f=await fixture();
  try {
    await api.prepareCloudflare(f);
    const preserved=await readFile(path.join(f.output,'build-info.json'));
    const handle=await open(path.join(f.source,'grande.json'),'w');
    try {await handle.truncate(25*1024*1024+1);} finally {await handle.close();}
    await assert.rejects(api.prepareCloudflare(f),/25 MiB/);
    assert.deepEqual(await readFile(path.join(f.output,'build-info.json')),preserved);
    await rm(path.join(f.source,'grande.json'));
    await writeFile(path.join(f.source,'.env'),'TOKEN=exemplo');
    await assert.rejects(api.prepareCloudflare(f),/proibido/);
    await assert.rejects(access(path.join(f.output,'.env')));
    await assert.rejects(api.prepareCloudflare({...f,output:f.source}),/saída/);
  } finally {await rm(f.root,{recursive:true,force:true});}
});
