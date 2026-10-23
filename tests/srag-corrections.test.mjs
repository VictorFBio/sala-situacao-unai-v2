import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve('.');

async function loadSragHelpers() {
  const helperPath = path.join(projectRoot, 'src/utils/srag-series.js');
  assert.ok(fs.existsSync(helperPath), 'helper de série SRAG deve existir');
  return import('../src/utils/srag-series.js');
}

test('S-01 normaliza 2026 de SE01 a SE37 e mantém as 52 linhas de fonte', async () => {
  const { buildSragSeries, getSragYearOptions } = await loadSragHelpers();
  const data = JSON.parse(fs.readFileSync(path.join(projectRoot, 'public/data/dashboard-data.json'), 'utf8'));
  const rows = data.queries.srag_sivep.rows;
  const original = structuredClone(rows);

  assert.deepStrictEqual(getSragYearOptions(rows), [
    { ano: 2025, parcial: false },
    { ano: 2026, parcial: true }
  ]);
  const series = buildSragSeries(rows, 2026);

  assert.strictEqual(series.error, null);
  assert.strictEqual(series.labels.length, 37);
  assert.strictEqual(series.labels[0], 'SE 01');
  assert.strictEqual(series.labels.at(-1), 'SE 37');
  assert.strictEqual(series.tableRows.length, 52);
  assert.strictEqual(series.notificacoes.reduce((sum, value) => sum + (value ?? 0), 0), 124);
  assert.strictEqual(series.obitos.reduce((sum, value) => sum + (value ?? 0), 0), 7);
  assert.deepStrictEqual(
    series.obitos.map((value, index) => [index + 1, value]).filter(([, value]) => value > 0),
    [[10, 1], [18, 1], [20, 2], [22, 1], [24, 1], [33, 1]]
  );
  assert.deepStrictEqual(rows, original, 'normalização não deve mutar a entrada');
});

test('S-01 mantém 2025 com 53 linhas, zero e lacunas internas sem interpolar', async () => {
  const { buildSragSeries } = await loadSragHelpers();
  const data = JSON.parse(fs.readFileSync(path.join(projectRoot, 'public/data/dashboard-data.json'), 'utf8'));
  const series = buildSragSeries(data.queries.srag_sivep.rows, 2025);

  assert.strictEqual(series.error, null);
  assert.strictEqual(series.tableRows.length, 53);
  assert.strictEqual(series.labels.length, 53);
  assert.strictEqual(series.notificacoes.reduce((sum, value) => sum + (value ?? 0), 0), 162);
  assert.strictEqual(series.obitos.reduce((sum, value) => sum + (value ?? 0), 0), 16);
  assert.ok(series.notificacoes.includes(null));
});

test('S-01 não declara completude quando parcial false ainda contém lacunas internas', async () => {
  const { buildSragSeries, buildSragSeriesNote } = await loadSragHelpers();
  const data = JSON.parse(fs.readFileSync(path.join(projectRoot, 'public/data/dashboard-data.json'), 'utf8'));
  const series2025 = buildSragSeries(data.queries.srag_sivep.rows, 2025);
  const syntheticGap = buildSragSeries([
    { ano: 2025, semana: 1, valor: 1, obitos: 0, parcial: false },
    { ano: 2025, semana: 2, valor: null, obitos: null, parcial: false },
    { ano: 2025, semana: 53, valor: 1, obitos: 0, parcial: false }
  ], 2025);

  for (const series of [series2025, syntheticGap]) {
    const note = buildSragSeriesNote(series, null);
    assert.match(note, /não marcada como parcial na fonte/i);
    assert.doesNotMatch(note, /completa/i);
    assert.match(note, /tabela e o CSV mantêm todas as linhas da fonte do ano, inclusive semanas sem valor/i);
  }
});

test('S-01 rejeita semanas fora do limite e duplicatas sem fabricar linhas', async () => {
  const { buildSragSeries } = await loadSragHelpers();
  const duplicate = buildSragSeries([
    { ano: 2026, semana: 1, valor: 0, obitos: null },
    { ano: 2026, semana: 1, valor: 2, obitos: 0 }
  ], 2026);
  assert.match(duplicate.error, /duplicada/i);
  assert.deepStrictEqual(duplicate.labels, []);

  const invalid2026 = buildSragSeries([{ ano: 2026, semana: 53, valor: 1, obitos: 0 }], 2026);
  assert.match(invalid2026.error, /inválida/i);

  const valid2025 = buildSragSeries([{ ano: 2025, semana: 53, valor: 1, obitos: 0 }], 2025);
  assert.strictEqual(valid2025.error, null);
  assert.strictEqual(valid2025.tableRows.length, 1);
  assert.strictEqual(valid2025.labels.length, 53);
});

test('S-01 representa ausências como null e ano sem observação como estado vazio', async () => {
  const { buildSragSeries } = await loadSragHelpers();
  const series = buildSragSeries([
    { ano: 2026, semana: 1, valor: 0, obitos: 0 },
    { ano: 2026, semana: 3, valor: null, obitos: 1 },
    { ano: 2026, semana: 4, valor: null, obitos: null }
  ], 2026);
  assert.deepStrictEqual(series.notificacoes, [0, null, null]);
  assert.deepStrictEqual(series.obitos, [0, null, 1]);
  assert.strictEqual(series.tableRows.length, 3);

  const empty = buildSragSeries([{ ano: 2026, semana: 1, valor: null, obitos: null }], 2026);
  assert.strictEqual(empty.empty, true);
  assert.deepStrictEqual(empty.labels, []);
});

test('S-01 view e gráfico integram ano, tabela/CSV filtrados e semântica dos óbitos', () => {
  const view = fs.readFileSync(path.join(projectRoot, 'src/views/VigilanciaView.jsx'), 'utf8');
  const charts = fs.readFileSync(path.join(projectRoot, 'src/components/NativeCharts.jsx'), 'utf8');
  const srag = charts.match(/export function SragChart[\s\S]*?(?=\nexport function |$)/)?.[0] ?? '';

  assert.match(view, /getSragYearOptions/);
  assert.match(view, /buildSragSeries/);
  assert.match(view, /rows=\{serieSrag\.tableRows\}/);
  assert.match(view, /YearSelect[\s\S]*setAnoSragSelecionado/);
  assert.match(view, /qSrag\?\.source\?\.period/);
  assert.match(view, /óbitos por SRAG entre casos da semana de início de sintomas/i);

  assert.doesNotMatch(srag, /slice\(-20\)/);
  assert.match(srag, /order:\s*1/);
  assert.match(srag, /order:\s*0/);
  assert.match(srag, /tension:\s*0/);
  assert.match(srag, /spanGaps:\s*false/);
  assert.match(srag, /precision:\s*0/);
  assert.doesNotMatch(srag, /y1:/);
});

test('S-01 usa legenda curta no celular sem remover a semântica temporal da tooltip', () => {
  const charts = fs.readFileSync(path.join(projectRoot, 'src/components/NativeCharts.jsx'), 'utf8');
  const srag = charts.slice(charts.indexOf('export function SragChart'));
  assert.match(srag, /label: 'Óbitos por SRAG'/);
  assert.match(srag, /Óbitos por SRAG entre casos da semana de início de sintomas/);
});
