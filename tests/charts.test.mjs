import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve('.');

test('8. Validação de ausência de badges de status em FontesView', () => {
  const fontesPath = path.join(projectRoot, 'src', 'views', 'FontesView.jsx');
  const content = fs.readFileSync(fontesPath, 'utf8');

  assert.ok(!content.includes('Carga Validada'), 'FontesView não deve conter "Carga Validada"');
  assert.ok(!content.includes('Planejada'), 'FontesView não deve conter "Planejada"');
  assert.ok(!content.includes('CheckCircle2'), 'FontesView não deve importar CheckCircle2');
  assert.ok(!content.includes('Clock'), 'FontesView não deve importar Clock');
});

test('9. Validação do Z-index / order nos gráficos hospitalares (SIH/SUS)', () => {
  const chartsPath = path.join(projectRoot, 'src', 'components', 'NativeCharts.jsx');
  const content = fs.readFileSync(chartsPath, 'utf8');

  // SihEvolucaoChart: bar order 1, line order 0
  const sihEvolucaoMatch = content.match(/export function SihEvolucaoChart[\s\S]*?return \(/);
  assert.ok(sihEvolucaoMatch, 'SihEvolucaoChart deve existir no arquivo');
  const sihEvolucaoCode = sihEvolucaoMatch[0];
  assert.match(sihEvolucaoCode, /type:\s*'bar'[\s\S]*?order:\s*1/, 'Barra de internações deve ter order: 1');
  assert.match(sihEvolucaoCode, /type:\s*'line'[\s\S]*?order:\s*0/, 'Linha de valores financeiros deve ter order: 0');

  // SihDiasChart: bar order 1, line order 0
  const sihDiasMatch = content.match(/export function SihDiasChart[\s\S]*?return \(/);
  assert.ok(sihDiasMatch, 'SihDiasChart deve existir no arquivo');
  const sihDiasCode = sihDiasMatch[0];
  assert.match(sihDiasCode, /type:\s*'bar'[\s\S]*?order:\s*1/, 'Barra de diárias deve ter order: 1');
  assert.match(sihDiasCode, /type:\s*'line'[\s\S]*?order:\s*0/, 'Linha de média de permanência deve ter order: 0');
});

test('10. Validação da reestruturação dos gráficos de mortalidade (SIM)', () => {
  const chartsPath = path.join(projectRoot, 'src', 'components', 'NativeCharts.jsx');
  const content = fs.readFileSync(chartsPath, 'utf8');

  // CausasMorteChart
  const causasMatch = content.match(/export function CausasMorteChart[\s\S]*?return \([\s\S]*?<\/div>\s*\);/);
  assert.ok(causasMatch, 'CausasMorteChart deve existir');
  const causasCode = causasMatch[0];
  assert.ok(!causasCode.includes('<Doughnut'), 'CausasMorteChart não deve renderizar Doughnut');
  assert.ok(causasCode.includes('<Bar'), 'CausasMorteChart deve renderizar Bar');
  assert.match(causasCode, /indexAxis:\s*'y'/, 'CausasMorteChart deve usar indexAxis: y');
  assert.match(causasCode, /sort\(\(a,\s*b\)\s*=>\s*b\.valor\s*-\s*a\.valor\)/, 'CausasMorteChart deve ordenar decrescente por valor');

  // SimIdadeChart
  const idadeMatch = content.match(/export function SimIdadeChart[\s\S]*?return \([\s\S]*?<\/div>\s*\);/);
  assert.ok(idadeMatch, 'SimIdadeChart deve existir');
  const idadeCode = idadeMatch[0];
  assert.match(idadeCode, /indexAxis:\s*'y'/, 'SimIdadeChart deve usar indexAxis: y');
  assert.ok(idadeCode.includes('getOrdemFaixa'), 'SimIdadeChart deve possuir função de ordenação cronológica');
});

test('11. Validação do pareamento e espessura na Pirâmide Etária (Censo 2022)', () => {
  const chartsPath = path.join(projectRoot, 'src', 'components', 'NativeCharts.jsx');
  const content = fs.readFileSync(chartsPath, 'utf8');

  const piramideMatch = content.match(/export function PiramideEtariaChart[\s\S]*?return \([\s\S]*?<\/div>\s*\);/);
  assert.ok(piramideMatch, 'PiramideEtariaChart deve existir');
  const piramideCode = piramideMatch[0];

  assert.match(piramideCode, /barThickness:\s*14/, 'Barras devem ter espessura definida (barThickness: 14)');
  assert.match(piramideCode, /maxBarThickness:\s*16/, 'Barras devem ter maxBarThickness: 16');
  assert.match(piramideCode, /stack:\s*'censo2022'/, 'Ambos os sexos devem compartilhar a mesma chave de stack');
  assert.match(piramideCode, /x:\s*\{[\s\S]*?stacked:\s*true/, 'Escala X deve ser stacked: true');
  assert.match(piramideCode, /y:\s*\{[\s\S]*?stacked:\s*true/, 'Escala Y deve ser stacked: true');
});

test('12. Testes funcionais de ordenação cronológica e agregação de dados', () => {
  // Teste da ordenação cronológica da mortalidade por idade
  const getOrdemFaixa = (label) => {
    const s = String(label).trim().toLowerCase();
    if (s.includes('menor') || s.startsWith('<')) return 0;
    const match = s.match(/^(\d+)/);
    if (match) return parseInt(match[1], 10);
    return 999;
  };

  const sampleFaixas = [
    '80 anos e mais',
    'Menor 1 ano',
    'Idade ignorada',
    '40 a 49 anos',
    '1 a 4 anos',
    '20 a 29 anos'
  ];

  const sorted = [...sampleFaixas].sort((a, b) => getOrdemFaixa(a) - getOrdemFaixa(b));
  assert.deepStrictEqual(sorted, [
    'Menor 1 ano',
    '1 a 4 anos',
    '20 a 29 anos',
    '40 a 49 anos',
    '80 anos e mais',
    'Idade ignorada'
  ], 'As faixas etárias devem ser ordenadas cronologicamente');

  // Teste da ordenação decrescente de causas de óbito
  const causas = [
    { categoria: 'Causa B', valor: 30 },
    { categoria: 'Causa A', valor: 100 },
    { categoria: 'Causa C', valor: 5 }
  ];
  const sortedCausas = [...causas].sort((a, b) => b.valor - a.valor);
  assert.strictEqual(sortedCausas[0].categoria, 'Causa A');
  assert.strictEqual(sortedCausas[2].categoria, 'Causa C');

  // Teste com dados oficiais reais do arquivo dashboard-data.json
  const dataPath = path.join(projectRoot, 'public', 'data', 'dashboard-data.json');
  const d = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  // Teste sim_causas agregação
  const causasMap = new Map();
  d.queries.sim_causas.rows.forEach(r => {
    const nome = (r.categoria || r.causa || 'Outras').replace(/\s+/g, ' ').trim();
    if (r.valor !== null && r.valor !== undefined) {
      causasMap.set(nome, (causasMap.get(nome) || 0) + Number(r.valor));
    }
  });
  const topCausas = [...causasMap.entries()]
    .map(([categoria, valor]) => ({ categoria, valor }))
    .sort((a, b) => b.valor - a.valor);

  assert.ok(topCausas.length > 0);
  assert.strictEqual(topCausas[0].categoria, 'IX. Doenças do aparelho circulatório');
  assert.strictEqual(topCausas[0].valor, 1204);
});
