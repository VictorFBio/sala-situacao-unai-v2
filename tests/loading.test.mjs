import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadPortalData } from '../src/utils/data-loader.js';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

test('falha de JSON é propagada e uma segunda tentativa carrega dados sem converter ausência em zero', async () => {
  let failing = true;
  let calls = 0;
  const fetcher = async (url) => {
    calls++;
    if (failing) return { ok: false, status: 503 };
    const payload = url.includes('dashboard-data') ? { queries: { exemplo: { rows: [{ valor: null }], source: {} } } }
      : url.includes('fontes') ? { fontes: [] }
      : url.includes('indicadores') ? { indicadores: [] } : { acquisitionDate: '2026-08-21' };
    return { ok: true, json: async () => payload };
  };
  await assert.rejects(loadPortalData({ fetcher, force: true }), /503/);
  failing = false;
  const data = await loadPortalData({ fetcher, force: true });
  assert.equal(data.queries.exemplo.rows[0].valor, null);
  assert.ok(calls >= 8);
});

test('leituras simultâneas compartilham a operação e atualização forçada renova o conjunto', async () => {
  const { loadPortalData: load } = await import('../src/utils/data-loader.js?concorrencia');
  let calls = 0;
  let release;
  const barrier = new Promise(resolve => { release = resolve; });
  const fetcher = async url => {
    calls++;
    await barrier;
    return { ok: true, json: async () => url.includes('dashboard-data') ? { queries: { exemplo: { rows: [{ valor: null }] } } } : {} };
  };
  const first = load({ fetcher });
  const second = load({ fetcher });
  release();
  const [a, b] = await Promise.all([first, second]);
  assert.equal(calls, 4, 'um único conjunto de quatro arquivos');
  assert.equal(a, b);
  assert.equal(a.queries.exemplo.rows[0].valor, null);
  await load({ fetcher });
  assert.equal(calls, 4, 'dados já carregados reutilizados');
  await load({ fetcher, force: true });
  assert.equal(calls, 8, 'nova tentativa explícita não usa o cache anterior');
});

test('falha compartilhada libera o carregador para uma nova tentativa', async () => {
  const { loadPortalData: load } = await import('../src/utils/data-loader.js?recuperacao');
  let failing = true;
  let calls = 0;
  const fetcher = async () => { calls++; return { ok: !failing, status: 503, json: async () => ({}) }; };
  const outcomes = await Promise.allSettled([load({ fetcher }), load({ fetcher })]);
  assert.ok(outcomes.every(result => result.status === 'rejected'));
  assert.equal(calls, 4);
  failing = false;
  await load({ fetcher });
  assert.equal(calls, 8);
});

test('tipografia não bloqueia a página por CSS externo e arquivos locais têm origem e licença', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.doesNotMatch(html, /fonts\.googleapis\.com/);
  const manifest = JSON.parse(await readFile(new URL('../public/assets/fonts/licenses.json', import.meta.url), 'utf8'));
  assert.equal(manifest.files.length, 2);
  for (const font of manifest.files) {
    const bytes = await readFile(new URL(`../src/assets/fonts/${font.file}`, import.meta.url));
    assert.equal(bytes.subarray(0, 4).toString(), 'wOF2');
    assert.equal(createHash('sha256').update(bytes).digest('hex'), font.sha256);
    assert.equal(new URL(font.source).hostname, 'fonts.gstatic.com');
    assert.match(font.licenseText, /SIL OPEN FONT LICENSE/);
  }
});
