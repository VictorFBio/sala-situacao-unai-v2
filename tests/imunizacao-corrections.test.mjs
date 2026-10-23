import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve('.');

async function loadImunizacaoHelpers() {
  const helperPath = path.join(projectRoot, 'src/utils/imunizacao-series.js');
  assert.ok(fs.existsSync(helperPath), 'helper compartilhado de imunização deve existir');
  return import('../src/utils/imunizacao-series.js');
}

test('V-01 classifica somente coberturas numéricas observadas nos limites das faixas visuais', async () => {
  const { classifyCoverage, resolveCoverage } = await loadImunizacaoHelpers();
  const cases = [
    [0, '#C05621'],
    [79.99, '#C05621'],
    [80, '#D69E2E'],
    [94.99, '#D69E2E'],
    [95, '#0B6B55'],
    [117.9, '#0B6B55']
  ];

  for (const [value, color] of cases) assert.strictEqual(classifyCoverage(value)?.color, color);
  for (const value of [null, undefined, '', ' ', Number.NaN, Number.POSITIVE_INFINITY, -1]) {
    assert.strictEqual(classifyCoverage(value), null);
  }

  assert.strictEqual(resolveCoverage({ valor: 0, cobertura: 99 }), 0);
  assert.strictEqual(resolveCoverage({ valor: null, cobertura: 91.5 }), 91.5);
  assert.strictEqual(resolveCoverage({ valor: '', cobertura: 91.5 }), null);
});

test('V-01 mapeia metas das 14 vacinas por rótulo normalizado sem atribuir meta a desconhecidas', async () => {
  const { getVaccineTarget, VACCINE_TARGETS } = await loadImunizacaoHelpers();
  const data = JSON.parse(fs.readFileSync(path.join(projectRoot, 'public/data/dashboard-data.json'), 'utf8'));
  const labels = data.queries.imunizacao_2025.rows.map(row => row.categoria);

  assert.strictEqual(Object.keys(VACCINE_TARGETS).length, 14);
  assert.deepStrictEqual(labels.map(getVaccineTarget), [90, 90, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95]);
  assert.strictEqual(getVaccineTarget('  ROTAVIRUS  '), 90);
  assert.strictEqual(getVaccineTarget('Vacina ainda não mapeada'), null);
});

test('V-01 ImunizacaoChart integra a regra compartilhada, legenda visível e metas acessíveis', () => {
  const charts = fs.readFileSync(path.join(projectRoot, 'src/components/NativeCharts.jsx'), 'utf8');
  const match = charts.match(/export function ImunizacaoChart[\s\S]*?(?=\nexport function |$)/);
  assert.ok(match, 'ImunizacaoChart deve existir');
  const code = match[0];

  assert.match(code, /resolveCoverage/);
  assert.match(code, /classifyCoverage/);
  assert.match(code, /COVERAGE_BANDS\.map/);
  assert.match(code, /Faixas visuais usadas pelo painel/);
  assert.match(code, /Metas de referência por vacina/);
  assert.match(code, /flexWrap:\s*'wrap'/);
  assert.doesNotMatch(code, /Meta PNI:\s*95%/);
  assert.doesNotMatch(code, /r\.cobertura\s*\|\||r\.valor\s*\|\|/);
  assert.match(code, /suggestedMax:\s*100/);
  assert.match(code, /replace\('\.',\s*','\)/);
});
