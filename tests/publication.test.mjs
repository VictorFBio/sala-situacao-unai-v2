import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';

const api = await import('../scripts/publication-policy.mjs').catch(() => ({}));
test('saídas geradas por qualquer módulo bloqueiam credenciais e documentos sem revisão',async()=>{
  assert.equal(typeof api.validateBuildOutput,'function');
  const out=await mkdtemp(path.join(os.tmpdir(),'unai-output-'));
  try {
    await writeFile(path.join(out,'index.html'),'<html lang="pt-BR"></html>');
    await api.validateBuildOutput(out);
    await writeFile(path.join(out,'.env'),'TOKEN=exemplo');
    await assert.rejects(api.validateBuildOutput(out),/proibido/);
    await rm(path.join(out,'.env'));
    await mkdir(path.join(out,'publicacoes'));
    await writeFile(path.join(out,'publicacoes/boletim.pdf'),'%PDF exemplo');
    await assert.rejects(api.validateBuildOutput(out),/autorizado/);
    const review={path:'publicacoes/boletim.pdf',sha256:createHash('sha256').update('%PDF exemplo').digest('hex'),reviewedBy:'Responsável',reviewedAt:'2026-10-08',source:'Aprovado'};
    await api.validateBuildOutput(out,[review]);
    await writeFile(path.join(out,'publicacoes/boletim.pdf'),'%PDF alterado');
    await assert.rejects(api.validateBuildOutput(out,[review]),/checksum/);
  } finally {await rm(out,{recursive:true,force:true});}
});
test('PDF e CSV públicos exigem pasta autorizada, revisão e checksum; arquivos não declarados são bloqueados', async () => {
  assert.equal(typeof api.validatePublicationFiles, 'function', 'política de arquivos ainda não implementada');
  const publicDir = await mkdtemp(path.join(os.tmpdir(), 'unai-public-'));
  try {
    await mkdir(path.join(publicDir, 'publicacoes'));
    await writeFile(path.join(publicDir, 'publicacoes/boletim.pdf'), '%PDF-1.4 exemplo');
    await assert.rejects(api.validatePublicationFiles(publicDir, { files: [] }), /não autorizado/);
    const sha256 = createHash('sha256').update('%PDF-1.4 exemplo').digest('hex');
    const file = { path: 'publicacoes/boletim.pdf', sha256, reviewedBy: 'Responsável técnico', reviewedAt: '2026-10-08', source: 'Documento público aprovado' };
    await api.validatePublicationFiles(publicDir, { files: [file] });
    await writeFile(path.join(publicDir, 'publicacoes/boletim.pdf'), '%PDF alterado');
    await assert.rejects(api.validatePublicationFiles(publicDir, { files: [file] }), /checksum/);
    await writeFile(path.join(publicDir, '.env'), 'SEGREDO=exemplo');
    await assert.rejects(api.validatePublicationFiles(publicDir, { files: [] }), /proibido/);
  } finally { await rm(publicDir, { recursive: true, force: true }); }
});
