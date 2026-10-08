import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadPortalData } from '../src/utils/data-loader.js';

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
