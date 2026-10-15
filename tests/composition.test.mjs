import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const api = await import('../scripts/compose-site.mjs').catch(() => ({}));
const manifest = () => ({ schemaVersion: 1, modules: [
  { id:'portal', repository:'VictorFBio/sala-situacao-unai-portal', revision:'a'.repeat(40), destination:'/', buildCommand:['node','scripts/build.mjs'], output:'dist' },
  { id:'painel', repository:'VictorFBio/sala-situacao-unai-v2', revision:'self', destination:'/painel-de-monitoramento/', buildCommand:['node','node_modules/vite/bin/vite.js','build'], output:'dist' }
] });

test('compositor exige commits fixados, pastas distintas e comandos sem shell', () => {
  assert.equal(typeof api.validateModuleManifest,'function','compositor ainda não implementado');
  api.validateModuleManifest(manifest());
  const floating=manifest(); floating.modules[0].revision='main';
  assert.throws(()=>api.validateModuleManifest(floating),/commit/);
  const collision=manifest(); collision.modules[1].destination='/';
  assert.throws(()=>api.validateModuleManifest(collision),/destino/);
  const traversal=manifest(); traversal.modules[0].output='../segredo';
  assert.throws(()=>api.validateModuleManifest(traversal),/saída/);
  const command=manifest(); command.modules[0].buildCommand=['sh','-c','qualquer'];
  assert.throws(()=>api.validateModuleManifest(command),/comando/);
});

test('checagem de links detecta recurso ausente e funciona em subpasta de homologação',async()=>{
  assert.equal(typeof api.verifyStaticLinks,'function','verificador ainda não implementado');
  const out=await mkdtemp(path.join(os.tmpdir(),'unai-links-'));
  try {
    await mkdir(path.join(out,'painel-de-monitoramento'));
    await writeFile(path.join(out,'painel-de-monitoramento/index.html'),'<html lang="pt-BR"><a href="#/aps">APS</a></html>');
    await writeFile(path.join(out,'index.html'),'<html lang="pt-BR"><a href="/teste/painel-de-monitoramento/">Painel</a></html>');
    await api.verifyStaticLinks(out,'/teste/');
    await writeFile(path.join(out,'index.html'),'<html lang="pt-BR"><img src="/teste/ausente.png"></html>');
    await assert.rejects(api.verifyStaticLinks(out,'/teste/'),/ausente/);
  } finally { await rm(out,{recursive:true,force:true}); }
});
