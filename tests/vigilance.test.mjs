import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve('.');
const utilityPath = fileURLToPath(new URL('../src/utils/vigilancia-series.js', import.meta.url));

async function loadSeriesHelpers() {
  assert.ok(fs.existsSync(utilityPath), 'src/utils/vigilancia-series.js deve existir');
  return import('../src/utils/vigilancia-series.js');
}

test('série semanal preserva zeros, lacunas, nulos e encerra no último valor observado', async () => {
  const { buildWeeklySeries } = await loadSeriesHelpers();
  const rows = [
    { ano: 2026, semana: 3, agravo: 'dengue', valor: 5 },
    { ano: 2026, semana: 1, agravo: 'dengue', valor: 0 },
    { ano: 2026, semana: 2, agravo: 'dengue', valor: null },
    { ano: 2026, semana: 4, agravo: 'dengue', valor: null }
  ];

  const series = buildWeeklySeries(rows, 'dengue', 2026);

  assert.deepStrictEqual(series.labels, ['SE 01', 'SE 02', 'SE 03']);
  assert.deepStrictEqual(series.values, [0, null, 5]);
  assert.strictEqual(series.lastObservedWeek, 3);
  assert.strictEqual(series.tableRows.length, 4);
  assert.strictEqual(series.tableRows.find(row => row.semana === 4).valor, null);
});

test('anos de agravo sem valores observados não aparecem como opções', async () => {
  const { getYearOptions } = await loadSeriesHelpers();
  const data = JSON.parse(fs.readFileSync(path.join(projectRoot, 'public/data/dashboard-data.json'), 'utf8'));
  const rows = data.queries.arboviroses_semanal.rows;
  const zikaYears = getYearOptions(rows, 'zika');

  assert.deepStrictEqual(zikaYears.map(item => item.ano), [2021, 2022, 2023, 2024]);
  assert.deepStrictEqual(zikaYears.map(item => item.parcial), [false, false, false, false]);
});

test('curva de dengue em 2026 termina na SE38 e mantém semanas sem valor na tabela', async () => {
  const { buildWeeklySeries } = await loadSeriesHelpers();
  const data = JSON.parse(fs.readFileSync(path.join(projectRoot, 'public/data/dashboard-data.json'), 'utf8'));
  const series = buildWeeklySeries(data.queries.arboviroses_semanal.rows, 'dengue', 2026);

  assert.strictEqual(series.lastObservedWeek, 38);
  assert.strictEqual(series.labels.length, 38);
  assert.strictEqual(series.tableRows.length, 52);
  assert.strictEqual(series.tableRows.find(row => row.semana === 39).valor, null);
});

test('série de zika termina na última semana observada e não oferece anos sem valores', async () => {
  const { buildWeeklySeries } = await loadSeriesHelpers();
  const data = JSON.parse(fs.readFileSync(path.join(projectRoot, 'public/data/dashboard-data.json'), 'utf8'));
  const series = buildWeeklySeries(data.queries.arboviroses_semanal.rows, 'zika', 2024);

  assert.strictEqual(series.lastObservedWeek, 7);
  assert.strictEqual(series.labels.length, 7);
  assert.strictEqual(series.tableRows.length, 52);
  assert.strictEqual(series.tableRows.find(row => row.semana === 8).valor, null);
});

test('nota semanal só aparece quando há ano e semana observados', async () => {
  const { buildWeeklySeriesNote } = await loadSeriesHelpers();

  assert.strictEqual(buildWeeklySeriesNote('Dengue', null, null), null);
  assert.strictEqual(buildWeeklySeriesNote('Dengue', 2026, null), null);
  assert.strictEqual(
    buildWeeklySeriesNote('Dengue', 2026, 38),
    'Série de Dengue em 2026; curva até SE 38. Semanas sem valor permanecem indicadas como “—” na tabela e no CSV.'
  );
});

test('filtro anual mantém apenas registros do ano escolhido', async () => {
  const { filterRowsByYear } = await loadSeriesHelpers();
  const rows = [{ ano: 2025, valor: 1 }, { ano: 2026, valor: 2 }, { ano: 2026, valor: null }];

  assert.deepStrictEqual(filterRowsByYear(rows, 2026), rows.slice(1));
});

test('gráficos de vigilância não convertem ausências em zero', () => {
  const charts = fs.readFileSync(path.join(projectRoot, 'src/components/NativeCharts.jsx'), 'utf8');
  const functions = ['DengueChart', 'DengueDatasusChart', 'SragChart', 'SinascPrenatalChart'];

  for (const name of functions) {
    const match = charts.match(new RegExp(`export function ${name}[\\s\\S]*?(?=\\nexport function |$)`));
    assert.ok(match, `${name} deve existir`);
    assert.doesNotMatch(match[0], /\|\|\s*0\b/);
    assert.doesNotMatch(match[0], /return 0\s*;/);
  }
});

test('gráfico semanal mantém escala inteira para contagens', () => {
  const charts = fs.readFileSync(path.join(projectRoot, 'src/components/NativeCharts.jsx'), 'utf8');
  const match = charts.match(/export function ArboviroseSemanalChart[\s\S]*?(?=\nexport function |$)/);

  assert.ok(match, 'ArboviroseSemanalChart deve existir');
  assert.match(match[0], /precision:\s*0/);
  assert.match(match[0], /maxTicksLimit:\s*8/);
});

test('Vigilância integra série semanal e não exibe aviso genérico de status preliminar', () => {
  const view = fs.readFileSync(path.join(projectRoot, 'src/views/VigilanciaView.jsx'), 'utf8');
  const charts = fs.readFileSync(path.join(projectRoot, 'src/components/NativeCharts.jsx'), 'utf8');

  assert.match(view, /arboviroses_semanal/);
  assert.match(view, /ArboviroseSemanalChart/);
  assert.match(view, /YearSelect/);
  assert.doesNotMatch(view, /preliminar|em avalia[cç][aã]o/i);
  assert.match(view, /notificações semanais de SRAG/i);
  assert.doesNotMatch(view, /hospitalizações por SRAG|internações por SRAG/i);

  const sragMatch = charts.match(/export function SragChart[\s\S]*?\n}/);
  assert.ok(sragMatch, 'SragChart deve existir');
  assert.doesNotMatch(sragMatch[0], /r\.valor\s*\|\|\s*0|r\.obitos\s*\|\|\s*0/);
});
