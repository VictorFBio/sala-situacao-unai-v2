import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export async function verifyPanelBundle(directory) {
  const html = await readFile(path.join(directory, 'index.html'), 'utf8');
  const entry = html.match(/<script[^>]*src="([^"]+\.js)"/)?.[1];
  if (!entry) throw Error('Entrada do painel não encontrada');
  const pending = [path.resolve(directory, entry)];
  const seen = new Set();
  while (pending.length) {
    const file = pending.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    if (/vendor-charts|NativeCharts|(?:APS|Hospitalar|Vigilancia|Gestao|BuscaSaude|Fontes)View/.test(path.basename(file))) throw Error('Seção ou gráficos carregados antecipadamente: ' + path.basename(file));
    const code = await readFile(file, 'utf8');
    for (const match of code.matchAll(/(?:from\s*|import\s*)["']([^"']+)["']/g)) {
      if (match[1].startsWith('.')) pending.push(path.resolve(path.dirname(file), match[1]));
    }
  }
  return { initialScripts: [...seen].map(file => path.basename(file)) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(await verifyPanelBundle(path.resolve(process.argv[2] || 'dist'))));
}
