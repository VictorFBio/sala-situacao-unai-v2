import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { gerarCSV } from '../src/utils/dados-modelo.js';
import { validatePublicationFiles } from '../scripts/publication-policy.mjs';

const projectRoot = path.resolve('.');

test('1. Verificação de integridade dos arquivos de dados públicos', () => {
  const dataDir = path.join(projectRoot, 'public', 'data');
  assert.ok(fs.existsSync(path.join(dataDir, 'dashboard-data.json')), 'dashboard-data.json deve existir');
  assert.ok(fs.existsSync(path.join(dataDir, 'mapa-servicos.json')), 'mapa-servicos.json deve existir');
  assert.ok(fs.existsSync(path.join(dataDir, 'fontes.json')), 'fontes.json deve existir');
  assert.ok(fs.existsSync(path.join(dataDir, 'indicadores-resumo.json')), 'indicadores-resumo.json deve existir');
  assert.ok(fs.existsSync(path.join(dataDir, 'imagem-satelite.json')), 'imagem-satelite.json deve existir');
});

test('2. Validação dos totais oficiais auditados de Unaí', () => {
  const resumoPath = path.join(projectRoot, 'public', 'data', 'indicadores-resumo.json');
  const resumo = JSON.parse(fs.readFileSync(resumoPath, 'utf8'));

  const getInd = (id) => resumo.indicadores.find(i => i.id === id);

  // População Censo 2022
  const pop = getInd('I01');
  assert.strictEqual(pop.valor, 86619, 'População residente deve ser exatamente 86.619');

  // CNES Total
  const cnes = getInd('I04');
  assert.strictEqual(cnes.valor, 288, 'Total de estabelecimentos CNES deve ser exatamente 288');

  // Equipes eSF
  const esf = getInd('I06');
  assert.strictEqual(esf.valor, 21, 'Total de equipes eSF deve ser exatamente 21');
});

test('3. Validação dos 32 serviços cartográficos de saúde', () => {
  const mapaPath = path.join(projectRoot, 'public', 'data', 'mapa-servicos.json');
  const mapa = JSON.parse(fs.readFileSync(mapaPath, 'utf8'));

  const rows = mapa.queries.rede_geografica.rows;
  assert.strictEqual(rows.length, 32, 'Deve conter exatamente 32 serviços públicos georreferenciados');

  const ubs = rows.filter(r => r.grupo === 'UBS / ESF');
  const comp = rows.filter(r => r.grupo !== 'UBS / ESF');
  assert.strictEqual(ubs.length, 18, 'Devem ser exatamente 18 UBS/ESF');
  assert.strictEqual(comp.length, 14, 'Devem ser exatamente 14 serviços complementares');
});

test('4. Validação dos ativos visuais oficiais da Prefeitura, SUS e Satélite Sentinel-2', () => {
  const assetsDir = path.join(projectRoot, 'public', 'assets');
  assert.ok(fs.existsSync(path.join(assetsDir, 'prefeitura-unai-recorte.png')), 'Logo da Prefeitura recortada deve existir');
  assert.ok(fs.existsSync(path.join(assetsDir, 'sus-recorte.png')), 'Logo positivo do SUS recortado deve existir');

  const satDir = path.join(assetsDir, 'satelite');
  assert.ok(fs.existsSync(path.join(satDir, 'sentinel2-contexto-regional.webp')), 'Mosaico regional Sentinel-2 deve existir');
  assert.ok(fs.existsSync(path.join(satDir, 'sentinel2-sede-urbana.webp')), 'Mosaico urbano Sentinel-2 deve existir');
});

test('5. Publicação limitada a arquivos permitidos e documentos revisados', async () => {
  const publicDir = path.join(projectRoot, 'public');
  const manifest = JSON.parse(fs.readFileSync(path.join(publicDir, 'publication-manifest.json'), 'utf8'));
  await validatePublicationFiles(publicDir, manifest);
});

test('6. Auditoria de ausência total de menções a Looker Studio', () => {
  const scanCode = (dir) => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const f of files) {
      if (f.name === 'node_modules' || f.name === '.git' || f.name === 'dist') continue;
      const full = path.join(dir, f.name);
      if (f.isDirectory()) {
        scanCode(full);
      } else if (f.name.endsWith('.jsx') || f.name.endsWith('.js')) {
        const content = fs.readFileSync(full, 'utf8');
        assert.ok(!/looker\s*studio/i.test(content), `Menção a Looker Studio encontrada em ${full}`);
      }
    }
  };
  scanCode(path.join(projectRoot, 'src'));
  const indexHtml = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
  assert.ok(!/looker\s*studio/i.test(indexHtml), 'Menção a Looker Studio encontrada em index.html');
});

test('7. Validação do gerador oficial de CSV com UTF-8 BOM e metadados', () => {
  const rows = [
    { ano: 2024, valor: 1500, categoria: 'Consultas' },
    { ano: 2025, valor: 1800.5, categoria: 'Consultas' }
  ];
  const source = {
    label: 'Siaps / MS',
    period: '2024-2025',
    executedAt: '2026-10-06T12:00:00Z',
    links: [{ href: 'https://siaps.saude.gov.br' }],
    filters: ['Unaí (MG)'],
    assumptions: ['Dados oficiais']
  };

  const csv = gerarCSV(rows, source, 'teste_consulta');
  assert.ok(csv.startsWith('\ufeff'), 'CSV deve iniciar com UTF-8 BOM');
  assert.ok(csv.includes('consulta;fonte;periodo_fonte'), 'CSV deve conter cabeçalho de metadados');
  assert.ok(csv.includes('teste_consulta;Siaps / MS'), 'CSV deve conter os valores dos metadados');
  assert.ok(csv.includes('1800,5'), 'Números decimais devem usar vírgula no padrão pt-BR');
});
