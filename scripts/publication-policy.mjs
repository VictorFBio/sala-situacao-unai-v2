import { readdir, readFile, lstat } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

export async function validateBuildOutput(directory,reviews=[]) {
  const approved=new Map();
  for(const file of reviews) {
    if(!/^(?:[a-z0-9-]+\/)*(?:publicacoes\/[a-zA-Z0-9/_-]+\.pdf|downloads\/[a-zA-Z0-9/_-]+\.csv)$/.test(file.path||'')||!/^[a-f0-9]{64}$/.test(file.sha256||'')||!file.reviewedBy?.trim()||!/^\d{4}-\d{2}-\d{2}$/.test(file.reviewedAt||'')||!file.source?.trim()||approved.has(file.path)) throw new Error('Revisão de saída inválida');
    approved.set(file.path,file);
  }
  const found=new Set();
  async function walk(dir,prefix='') {
    for(const entry of await readdir(dir,{withFileTypes:true})) {
      const relative=prefix+entry.name,absolute=path.join(dir,entry.name);
      const info=await lstat(absolute);
      if(info.isSymbolicLink()) throw new Error(`Link simbólico proibido: ${relative}`);
      if(entry.name.startsWith('.')&&relative!=='.nojekyll') throw new Error(`Arquivo proibido: ${relative}`);
      if(info.isDirectory()) {await walk(absolute,relative+'/');continue;}
      if(relative==='.nojekyll') continue;
      if(/\.(pdf|csv)$/i.test(relative)) {
        const review=approved.get(relative);
        if(!review) throw new Error(`Documento não autorizado na saída: ${relative}`);
        if(createHash('sha256').update(await readFile(absolute)).digest('hex')!==review.sha256) throw new Error(`Falha de checksum na saída: ${relative}`);
        found.add(relative);
      } else if(!/\.(html|js|css|json|png|jpe?g|webp|svg|woff2?)$/.test(relative)) throw new Error(`Tipo proibido na saída: ${relative}`);
    }
  }
  await walk(directory);
  for(const file of approved.keys()) if(!found.has(file)) throw new Error(`Documento aprovado ausente da saída: ${file}`);
}

export async function validatePublicationFiles(publicDir, manifest) {
  if (!Array.isArray(manifest.files)) throw new Error('Manifesto público inválido');
  const approved = new Map();
  for (const file of manifest.files) {
    if (!/^(publicacoes\/[a-zA-Z0-9/_-]+\.pdf|downloads\/[a-zA-Z0-9/_-]+\.csv)$/.test(file.path || '') || !/^[a-f0-9]{64}$/.test(file.sha256 || '') || !file.reviewedBy?.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(file.reviewedAt || '') || !file.source?.trim()) throw new Error('Registro de revisão inválido');
    if (approved.has(file.path)) throw new Error('Arquivo duplicado no manifesto');
    approved.set(file.path,file);
  }
  const found = new Set();
  const files = [];
  async function walk(dir, prefix='') {
    for (const entry of await readdir(dir,{withFileTypes:true})) {
      const relative=prefix+entry.name;
      const absolute=path.join(dir,entry.name);
      const stat=await lstat(absolute);
      if(stat.isSymbolicLink()) throw new Error(`Link simbólico proibido: ${relative}`);
      if (entry.name.startsWith('.') || /\.(env|pem|key|p12|pfx|xlsx?|gpkg|sqlite|db|bundle|zip)$/i.test(entry.name)) throw new Error(`Arquivo proibido: ${relative}`);
      if(stat.isDirectory()) await walk(absolute,relative+'/');
      else files.push({relative,absolute});
    }
  }
  await walk(publicDir);
  for(const {relative,absolute} of files) {
    if (/\.(pdf|csv)$/i.test(relative)) {
      const review=approved.get(relative);
      if(!review) throw new Error(`Arquivo não autorizado: ${relative}`);
      const hash=createHash('sha256').update(await readFile(absolute)).digest('hex');
      if(hash!==review.sha256) throw new Error(`Falha de checksum: ${relative}`);
      found.add(relative);
    } else if (!/^(assets\/[a-zA-Z0-9/_.-]+\.(png|jpe?g|webp|svg)|data\/(dashboard-data|fontes|imagem-satelite|indicadores-resumo|mapa-servicos)\.json|publication-manifest\.json)$/.test(relative)) {
      throw new Error(`Arquivo não autorizado: ${relative}`);
    }
  }
  for(const file of approved.keys()) if(!found.has(file)) throw new Error(`Arquivo autorizado ausente: ${file}`);
  return { files:files.length,reviewed:found.size };
}
