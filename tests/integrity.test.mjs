import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve('.');

test('1. Verificação de integridade dos arquivos de dados públicos', () => {
  const dataDir = path.join(projectRoot, 'public', 'data');
  assert.ok(fs.existsSync(path.join(dataDir, 'dashboard-data.json')), 'dashboard-data.json deve existir');
  assert.ok(fs.existsSync(path.join(dataDir, 'mapa-servicos.json')), 'mapa-servicos.json deve existir');
  assert.ok(fs.existsSync(path.join(dataDir, 'fontes.json')), 'fontes.json deve existir');
  assert.ok(fs.existsSync(path.join(dataDir, 'indicadores-resumo.json')), 'indicadores-resumo.json deve existir');
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

test('4. Validação dos ativos visuais oficiais da Prefeitura e SUS', () => {
  const assetsDir = path.join(projectRoot, 'public', 'assets');
  assert.ok(fs.existsSync(path.join(assetsDir, 'prefeitura-unai.png')), 'Logo da Prefeitura deve existir');
  assert.ok(fs.existsSync(path.join(assetsDir, 'sus-positivo.png')), 'Logo positivo do SUS deve existir');
});

test('5. Auditoria de ausência de dados brutos sensíveis ou pessoais', () => {
  // Garantir que nenhum PDF ou XLSX está presente no build ou em public
  const scanDir = (dir) => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const f of files) {
      if (f.name === 'node_modules' || f.name === '.git') continue;
      const full = path.join(dir, f.name);
      if (f.isDirectory()) {
        scanDir(full);
      } else {
        assert.ok(!f.name.endsWith('.pdf'), `Arquivo PDF não deve estar presente no projeto: ${full}`);
        assert.ok(!f.name.endsWith('.xlsx'), `Arquivo XLSX não deve estar presente no projeto: ${full}`);
      }
    }
  };
  scanDir(path.join(projectRoot, 'public'));
  scanDir(path.join(projectRoot, 'dist'));
});
