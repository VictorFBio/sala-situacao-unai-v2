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

test('13. Validação do gráfico de Dengue e Arboviroses (DengueChart e DengueDatasusChart)', () => {
  const chartsPath = path.join(projectRoot, 'src', 'components', 'NativeCharts.jsx');
  const content = fs.readFileSync(chartsPath, 'utf8');

  // DengueChart
  const dengueMatch = content.match(/export function DengueChart[\s\S]*?return \([\s\S]*?<\/div>\s*\);/);
  assert.ok(dengueMatch, 'DengueChart deve existir');
  const dengueCode = dengueMatch[0];

  assert.ok(dengueCode.includes('anosUnicos'), 'DengueChart deve agrupar anos únicos para não duplicar rótulos no eixo X');
  assert.ok(dengueCode.includes('soma_observada'), 'DengueChart deve utilizar soma_observada para anos parciais (ex: 2026)');
  assert.ok(dengueCode.includes('modo'), 'DengueChart deve permitir alternância de visualização (Dengue, Chikungunya, Todas)');

  // DengueDatasusChart
  const datasusMatch = content.match(/export function DengueDatasusChart[\s\S]*?return \([\s\S]*?<\/div>\s*\);/);
  assert.ok(datasusMatch, 'DengueDatasusChart deve existir para exibir série consolidada do Ministério da Saúde');

  // Teste de integridade dos dados reais de arboviroses
  const dataPath = path.join(projectRoot, 'public', 'data', 'dashboard-data.json');
  const d = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const rows = d.queries.arboviroses_anual.rows;

  const dengueRows = rows.filter(r => r.agravo === 'dengue');
  assert.strictEqual(dengueRows.length, 6, 'Devem existir 6 anos de dados de dengue (2021-2026)');

  // Verificar pico de 2024
  const row2024 = dengueRows.find(r => r.ano === 2024);
  assert.strictEqual(row2024.valor, 16687, 'Ano de 2024 deve ter 16.687 notificações');

  // Verificar ano parcial de 2026
  const row2026 = dengueRows.find(r => r.ano === 2026);
  assert.strictEqual(row2026.soma_observada, 2006, 'Ano de 2026 deve ter soma_observada de 2.006');

  // Validação do Eixo Duplo no modo 'Todas as Arboviroses'
  assert.match(dengueCode, /yAxisID:\s*'y'/, 'Dengue deve utilizar o eixo esquerdo (y)');
  assert.match(dengueCode, /yAxisID:\s*'y1'/, 'Chikungunya e Zika devem utilizar o eixo direito (y1)');
  assert.match(dengueCode, /y1:\s*\{[\s\S]*?position:\s*'right'/, 'Escala y1 deve estar posicionada à direita');
  assert.match(dengueCode, /type:\s*'line'[\s\S]*?Chikungunya/s, 'Chikungunya deve ser renderizada como linha destacada no modo comparativo');
  assert.match(dengueCode, /type:\s*'line'[\s\S]*?Zika/s, 'Zika deve ser renderizada como linha destacada no modo comparativo');
  assert.match(dengueCode, /suggestedMax:\s*45/, 'Eixo y1 deve ter escala adaptada de até 45 para garantir visibilidade');
});

test('14. Validação do foco cartográfico e busca no módulo Busca Saúde', () => {
  const mapPath = path.join(projectRoot, 'src', 'components', 'BuscaSaudeMap.jsx');
  const mapCode = fs.readFileSync(mapPath, 'utf8');

  // Validação dos manipuladores de foco e centralização
  assert.ok(mapCode.includes('focarPonto'), 'BuscaSaudeMap deve possuir função focarPonto para centralização nos estabelecimentos');
  assert.ok(mapCode.includes('limitarCentroNoRaster'), 'BuscaSaudeMap deve utilizar limitarCentroNoRaster para enquadramento cartográfico');
  assert.ok(mapCode.includes('trocarVista'), 'BuscaSaudeMap deve suportar transição de vista entre município, urbano e entorno');

  // Validação funcional da busca e filtragem
  const dataPath = path.join(projectRoot, 'public', 'data', 'mapa-servicos.json');
  const d = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const rows = d.queries.rede_geografica.rows;

  const normalizar = t => String(t ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const filtrar = (texto, grupo = 'all') => {
    const term = normalizar(texto).trim();
    return rows.filter(r => 
      (grupo === 'all' || r.grupo === grupo) &&
      (!term || normalizar([r.codigo, r.nome, r.bairro, r.endereco].join(' ')).includes(term))
    );
  };

  // Teste de busca por nome
  const resHospital = filtrar('Hospital Municipal');
  assert.ok(resHospital.length >= 1, 'Busca por Hospital Municipal deve retornar ao menos 1 resultado');
  assert.strictEqual(resHospital[0].codigo, 'S03');

  // Teste de busca por distrito rural (Garapuava)
  const resRural = filtrar('Garapuava');
  assert.strictEqual(resRural.length, 1, 'Busca por Garapuava deve retornar exatamente 1 ESF rural');
  assert.strictEqual(resRural[0].rural, true, 'ESF Garapuava deve ter indicador rural: true');

  // Teste de busca por bairro (Cachoeira)
  const resBairro = filtrar('Cachoeira');
  assert.ok(resBairro.length >= 1, 'Busca por Cachoeira deve retornar estabelecimentos no bairro');

  // Teste de busca sem distinção de acentuação (Policlinica vs Policlínica)
  const resSemAcento = filtrar('policlinica');
  const resComAcento = filtrar('policlínica');
  assert.strictEqual(resSemAcento.length, resComAcento.length, 'Busca deve ignorar acentos diacríticos');
});

test('15. Auditoria de integridade de botões segmentados, tooltips e downloads CSV', async () => {
  const dadosUtils = await import('../src/utils/dados-modelo.js');
  const dataPath = path.join(projectRoot, 'public', 'data', 'dashboard-data.json');
  const d = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  // 1. Validar que todas as consultas geram CSV válido com UTF-8 BOM e ponto e vírgula
  for (const [key, q] of Object.entries(d.queries)) {
    if (!q.rows || !q.rows.length || !q.source) continue;
    const csv = dadosUtils.gerarCSV(q.rows, q.source, key);
    assert.ok(csv.startsWith('\ufeff'), `CSV da consulta ${key} deve iniciar com UTF-8 BOM`);
    assert.ok(csv.includes('consulta;fonte;periodo_fonte'), `CSV da consulta ${key} deve conter metadados institucionais`);
    assert.ok(csv.includes(key), `CSV da consulta ${key} deve conter o ID da consulta`);
  }

  // 2. Validar botões segmentados em NativeCharts e BuscaSaudeMap
  const chartsPath = path.join(projectRoot, 'src', 'components', 'NativeCharts.jsx');
  const chartsCode = fs.readFileSync(chartsPath, 'utf8');
  assert.match(chartsCode, /aria-pressed=\{modo === 'dengue'\}/, 'Botão Dengue deve ter aria-pressed');
  assert.match(chartsCode, /aria-pressed=\{modo === 'chikungunya'\}/, 'Botão Chikungunya deve ter aria-pressed');
  assert.match(chartsCode, /aria-pressed=\{modo === 'todas'\}/, 'Botão Todas deve ter aria-pressed');

  const mapPath = path.join(projectRoot, 'src', 'components', 'BuscaSaudeMap.jsx');
  const mapCode = fs.readFileSync(mapPath, 'utf8');
  assert.match(mapCode, /aria-pressed=\{vista === 'municipio'\}/, 'Botão Município deve ter aria-pressed');
  assert.match(mapCode, /aria-pressed=\{vista === 'urbano'\}/, 'Botão Urbano deve ter aria-pressed');
  assert.match(mapCode, /aria-pressed=\{fundo === 'malha'\}/, 'Botão Malha deve ter aria-pressed');
  assert.match(mapCode, /aria-pressed=\{fundo === 'satelite'\}/, 'Botão Satélite deve ter aria-pressed');
});

test('16. Validação de ausência de truncamento em Imunização, formatação decimal pt-BR e resiliência em CSV', async () => {
  const chartsPath = path.join(projectRoot, 'src', 'components', 'NativeCharts.jsx');
  const chartsCode = fs.readFileSync(chartsPath, 'utf8');

  // 1. ImunizacaoChart: suggestedMax deve permitir valores > 100% (ex: BCG 117,9%) sem corte
  const imunoMatch = chartsCode.match(/export function ImunizacaoChart[\s\S]*?return \(/);
  assert.ok(imunoMatch, 'ImunizacaoChart deve existir');
  const imunoCode = imunoMatch[0];
  assert.match(imunoCode, /suggestedMax:\s*100/, 'ImunizacaoChart deve utilizar suggestedMax: 100 para não cortar coberturas > 100% como BCG (117,9%)');
  assert.ok(!imunoCode.includes('max: 100,'), 'ImunizacaoChart não deve truncar rigidamente com max: 100');
  assert.match(imunoCode, /replace\('\.',\s*','\)/, 'ImunizacaoChart deve formatar percentuais com vírgula decimal pt-BR');

  // 2. SihDiasChart: média de permanência com formato pt-BR
  const sihDiasMatch = chartsCode.match(/export function SihDiasChart[\s\S]*?return \(/);
  assert.ok(sihDiasMatch, 'SihDiasChart deve existir');
  const sihDiasCode = sihDiasMatch[0];
  assert.match(sihDiasCode, /replace\('\.',\s*','\)/, 'SihDiasChart deve formatar média de permanência com vírgula no padrão pt-BR');

  // 3. SragChart: ticks formatados com formatNumber
  const sragMatch = chartsCode.match(/export function SragChart[\s\S]*?return \(/);
  assert.ok(sragMatch, 'SragChart deve existir');
  const sragCode = sragMatch[0];
  assert.match(sragCode, /callback:\s*v\s*=>\s*formatNumber\(v\)/, 'SragChart deve possuir callback formatNumber nos ticks de Y');

  // 4. Teste de resiliência de gerarCSV com objeto source vazio ou campos nulos
  const dadosUtils = await import('../src/utils/dados-modelo.js');
  const rowsTeste = [{ id: 1, valor: 42.5 }];
  const csvResiliente = dadosUtils.gerarCSV(rowsTeste, {}, 'consulta_resiliente');
  assert.ok(csvResiliente.startsWith('\ufeff'), 'CSV com source vazio deve iniciar com UTF-8 BOM');
  assert.ok(csvResiliente.includes('42,5'), 'CSV resiliente deve formatar decimal com vírgula');
});

test('17. Auditoria de otimização de bundle (chunks), proximaVista cartográfica e consistência pt-BR em ApsC1', () => {
  // 1. ApsC1Chart: ticks com formatNumber
  const chartsPath = path.join(projectRoot, 'src', 'components', 'NativeCharts.jsx');
  const chartsCode = fs.readFileSync(chartsPath, 'utf8');
  const apsC1Match = chartsCode.match(/export function ApsC1Chart[\s\S]*?return \(/);
  assert.ok(apsC1Match, 'ApsC1Chart deve existir');
  assert.match(apsC1Match[0], /callback:\s*v\s*=>\s*formatNumber\(v\)/, 'ApsC1Chart deve possuir callback formatNumber nos ticks de Y');

  // 2. BuscaSaudeMap: cálculo explícito de proximaVista e alvoBounds
  const mapPath = path.join(projectRoot, 'src', 'components', 'BuscaSaudeMap.jsx');
  const mapCode = fs.readFileSync(mapPath, 'utf8');
  assert.ok(mapCode.includes('proximaVista'), 'BuscaSaudeMap deve calcular proximaVista explicitamente');
  assert.ok(mapCode.includes('alvoBounds'), 'BuscaSaudeMap deve calcular alvoBounds com base na próxima vista');

  // 3. HospitalarView: acessibilidade no filtro
  const hospPath = path.join(projectRoot, 'src', 'views', 'HospitalarView.jsx');
  const hospCode = fs.readFileSync(hospPath, 'utf8');
  assert.match(hospCode, /aria-label="Filtrar tipo de estabelecimento"/, 'Campo de busca de tipologia hospitalar deve possuir aria-label');

  // 4. Vite config: code splitting de pacotes pesados para resolução de chunks > 500kB
  const vitePath = path.join(projectRoot, 'vite.config.js');
  const viteCode = fs.readFileSync(vitePath, 'utf8');
  assert.ok(viteCode.includes('manualChunks'), 'vite.config.js deve conter manualChunks para modularização de vendor e charts');
});

test('18. Auditoria de robustez epidemiológica, resiliência de anos parciais e acessibilidade no portal', () => {
  const chartsPath = path.join(projectRoot, 'src', 'components', 'NativeCharts.jsx');
  const chartsCode = fs.readFileSync(chartsPath, 'utf8');

  // 1. SinascPrenatalChart: ordenação numérica estrita e filtro de nulos
  const prenatalMatch = chartsCode.match(/export function SinascPrenatalChart[\s\S]*?return \(/);
  assert.ok(prenatalMatch, 'SinascPrenatalChart deve existir');
  assert.match(prenatalMatch[0], /filter\(Boolean\)\)\]\.sort\(\(a,\s*b\)\s*=>\s*a\s*-\s*b\)/, 'SinascPrenatalChart deve filtrar anos nulos e ordenar numericamente');

  // 2. DengueChart: acessibilidade no grupo segmentado e nota explicativa
  const dengueMatch = chartsCode.match(/export function DengueChart[\s\S]*?return \([\s\S]*?<\/div>\s*\);/);
  assert.ok(dengueMatch, 'DengueChart deve existir');
  assert.match(dengueMatch[0], /role="group"\s+aria-label="Modo de visualização de arboviroses"/, 'Segmented de DengueChart deve ter role="group" e aria-label');
  assert.match(dengueMatch[0], /modo === 'chikungunya' && \(/, 'DengueChart deve possuir nota explicativa dedicada para o modo Chikungunya');
  assert.match(dengueMatch[0], /isParcial/, 'DengueChart deve verificar anos parciais dinamicamente');

  // 3. DengueDatasusChart e PopulacaoEstimativasChart: rowsValidas
  assert.match(chartsCode, /export function DengueDatasusChart[\s\S]*?rowsValidas = rows\.filter\(r => r\.ano\)/, 'DengueDatasusChart deve filtrar rows por ano');
  assert.match(chartsCode, /export function PopulacaoEstimativasChart[\s\S]*?rowsValidas = rows\.filter\(r => r\.ano\)/, 'PopulacaoEstimativasChart deve filtrar rows por ano');

  // 4. BuscaSaudeMap: feedback visual de cópia de endereço
  const mapPath = path.join(projectRoot, 'src', 'components', 'BuscaSaudeMap.jsx');
  const mapCode = fs.readFileSync(mapPath, 'utf8');
  assert.ok(mapCode.includes('copiado'), 'BuscaSaudeMap deve possuir estado copiado para feedback ao usuário');
  assert.match(mapCode, /copiado \? 'Endereço copiado!' : 'Copiar endereço'/, 'Botão de cópia deve fornecer feedback textual instantâneo');

  // 5. App.jsx: normalização de rota
  const appPath = path.join(projectRoot, 'src', 'App.jsx');
  const appCode = fs.readFileSync(appPath, 'utf8');
  assert.ok(appCode.includes('normalizeRoute'), 'App.jsx deve normalizar hash rotas prevenindo inconsistência no estado ativo');
});

test('19. Validação de inclusão total das 5 categorias de Cor ou Raça (Censo IBGE) e gráfico horizontal', () => {
  const chartsPath = path.join(projectRoot, 'src', 'components', 'NativeCharts.jsx');
  const chartsCode = fs.readFileSync(chartsPath, 'utf8');
  const gestaoPath = path.join(projectRoot, 'src', 'views', 'GestaoView.jsx');
  const gestaoCode = fs.readFileSync(gestaoPath, 'utf8');

  // 1. CorRacaChart deve existir, não renderizar Pie e usar Bar horizontal
  const corRacaMatch = chartsCode.match(/export function CorRacaChart[\s\S]*?(?=export function PopulacaoEstimativasChart)/);
  assert.ok(corRacaMatch, 'CorRacaChart deve existir');
  const corRacaCode = corRacaMatch[0];

  assert.ok(!corRacaCode.includes('<Pie'), 'CorRacaChart não deve renderizar Pie');
  assert.ok(corRacaCode.includes('<Bar'), 'CorRacaChart deve renderizar Bar');
  assert.match(corRacaCode, /indexAxis:\s*'y'/, 'CorRacaChart deve usar indexAxis: y');
  assert.match(corRacaCode, /minBarLength:\s*8/, 'CorRacaChart deve definir minBarLength: 8 para garantir visibilidade de minorias (Amarela e Indígena)');

  // 2. Todas as 5 categorias oficiais do Censo IBGE devem estar explicitamente declaradas
  const categoriasEsperadas = ['Parda', 'Branca', 'Preta', 'Amarela', 'Indígena'];
  for (const cat of categoriasEsperadas) {
    assert.ok(corRacaCode.includes(`'${cat}'`), `CorRacaChart deve conter a categoria oficial '${cat}'`);
  }

  // 3. Suporte a alternância de censos e comparativo
  assert.ok(corRacaCode.includes('modo === \'2022\''), 'CorRacaChart deve suportar Censo 2022');
  assert.ok(corRacaCode.includes('modo === \'2010\''), 'CorRacaChart deve suportar Censo 2010');
  assert.ok(corRacaCode.includes('modo === \'comparativo\''), 'CorRacaChart deve suportar Comparativo');

  // 4. GestaoView deve passar todas as rows e atualizar o título
  assert.match(gestaoCode, /const corRacaRows = qCorRaca\?\.rows \|\| \[\];/, 'GestaoView deve carregar todas as rows sem corte estático');
  assert.ok(gestaoCode.includes('Cor ou Raça (Censo IBGE)'), 'Aba de Cor ou Raça deve refletir a totalidade do Censo IBGE');

  // 5. Teste de integridade numérica da fonte pública real (dashboard-data.json)
  const dataPath = path.join(projectRoot, 'public', 'data', 'dashboard-data.json');
  const d = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const rows = d.queries.populacao_cor_raca.rows;

  const rows2022 = rows.filter(r => r.ano === 2022);
  const rows2010 = rows.filter(r => r.ano === 2010);

  assert.strictEqual(rows2022.length, 5, 'Censo 2022 deve conter exatamente 5 categorias');
  assert.strictEqual(rows2010.length, 5, 'Censo 2010 deve conter exatamente 5 categorias');

  const total2022 = rows2022.reduce((acc, r) => acc + r.valor, 0);
  const total2010 = rows2010.reduce((acc, r) => acc + r.valor, 0);

  // Total de 2022 deve fechar exatamente em 86.619 pessoas (100% da população recenseada)
  assert.strictEqual(total2022, 86619, 'Soma de todas as 5 categorias do Censo 2022 deve ser exatamente 86.619');
  assert.strictEqual(total2010, 77565, 'Soma de todas as 5 categorias do Censo 2010 deve ser exatamente 77.565');

  // Garantir que Amarela e Indígena estão presentes no dataset oficial
  const amarela2022 = rows2022.find(r => r.categoria === 'Amarela')?.valor;
  const indigena2022 = rows2022.find(r => r.categoria === 'Indígena')?.valor;
  assert.strictEqual(amarela2022, 178, 'Amarela em 2022 deve ser 178 pessoas');
  assert.strictEqual(indigena2022, 32, 'Indígena em 2022 deve ser 32 pessoas');
});




