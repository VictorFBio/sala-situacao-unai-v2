import React, { useState } from 'react';
import { 
  Baby, 
  Skull, 
  Bug, 
  Syringe, 
  AlertTriangle 
} from 'lucide-react';
import { 
  PageHeader, 
  KPICard, 
  Tabs, 
  TabPanel, 
  ChartCard, 
  YearSelect,
  Note 
} from '../components/ui';
import { 
  NascimentosChart, 
  SinascPrenatalChart, 
  CausasMorteChart, 
  SimIdadeChart, 
  ObitosAnuaisChart, 
  DengueChart, 
  DengueDatasusChart, 
  ArboviroseSemanalChart,
  SragChart, 
  ImunizacaoChart 
} from '../components/NativeCharts';
import { buildWeeklySeries, buildWeeklySeriesNote, filterRowsByYear, getYearOptions } from '../utils/vigilancia-series';

export default function VigilanciaView({ data, onRouteChange }) {
  const [activeTab, setActiveTab] = useState('nascimentos');
  const [anoCausasSelecionado, setAnoCausasSelecionado] = useState(null);
  const [anoIdadeSelecionado, setAnoIdadeSelecionado] = useState(null);
  const [agravoSemanalSelecionado, setAgravoSemanalSelecionado] = useState('dengue');
  const [anoSemanalSelecionado, setAnoSemanalSelecionado] = useState(null);

  const queries = data?.queries || {};

  const qNascimentos = queries.nascimentos_anuais;
  const qPrenatal = queries.sinasc_prenatal;
  const qObitosAnuais = queries.obitos_anuais;
  const qCausas = queries.sim_causas;
  const qIdade = queries.sim_idade;
  const qDengue = queries.arboviroses_anual;
  const qArbovirosesSemanais = queries.arboviroses_semanal;
  const qDengueDatasus = queries.dengue_datasus;
  const qSrag = queries.srag_sivep;
  const qImunizacao = queries.imunizacao_2025;

  const anosCausas = getYearOptions(qCausas?.rows || []);
  const anoCausas = anosCausas.some(item => item.ano === anoCausasSelecionado)
    ? anoCausasSelecionado
    : anosCausas.at(-1)?.ano ?? null;
  const rowsCausas = filterRowsByYear(qCausas?.rows || [], anoCausas);

  const anosIdade = getYearOptions(qIdade?.rows || []);
  const anoIdade = anosIdade.some(item => item.ano === anoIdadeSelecionado)
    ? anoIdadeSelecionado
    : anosIdade.at(-1)?.ano ?? null;
  const rowsIdade = filterRowsByYear(qIdade?.rows || [], anoIdade);

  const anosSemanais = getYearOptions(qArbovirosesSemanais?.rows || [], agravoSemanalSelecionado);
  const anoSemanal = anosSemanais.some(item => item.ano === anoSemanalSelecionado)
    ? anoSemanalSelecionado
    : anosSemanais.at(-1)?.ano ?? null;
  const serieSemanal = buildWeeklySeries(qArbovirosesSemanais?.rows || [], agravoSemanalSelecionado, anoSemanal);
  const nomeAgravoSemanal = {
    dengue: 'Dengue',
    chikungunya: 'Chikungunya',
    zika: 'Zika'
  }[agravoSemanalSelecionado];

  const tabItems = [
    { id: 'nascimentos', label: 'Nascidos Vivos & Pré-Natal (SINASC)', icon: Baby },
    { id: 'mortalidade', label: 'Mortalidade & Causas (SIM)', icon: Skull },
    { id: 'arboviroses', label: 'Arboviroses (Dengue / SINAN)', icon: Bug },
    { id: 'srag', label: 'SRAG (SIVEP-Gripe)', icon: AlertTriangle },
    { id: 'vacinas', label: 'Imunização (Cobertura 2025)', icon: Syringe },
  ];

  return (
    <div className="container page">
      <PageHeader
        eyebrow="Eixo Estratégico 3"
        title="Vigilância em Saúde & Eventos Vitais"
        onRouteChange={onRouteChange}
      >
        Séries históricas de nascidos vivos (SINASC), perfil de mortalidade (SIM), monitoramento de arboviroses
        (InfoDengue / SINAN), notificações de SRAG (SIVEP-Gripe) e cobertura vacinal oficial de 2025.
      </PageHeader>

      {/* Cards Síntese de Vigilância */}
      <div className="kpi-grid">
        <KPICard 
          title="Série de Nascimentos (SINASC)"
          value="2015 – 2026"
          unit="dados agregados oficiais"
          period="Atualizado em 05/10/2026"
          source="SINASC / Sede"
        />

        <KPICard 
          title="Série de Mortalidade (SIM)"
          value="2015 – 2026"
          unit="óbitos e causas básicas"
          period="Atualizado em 05/10/2026"
          source="SIM / Sede"
        />

        <KPICard 
          title="Monitoramento de Arboviroses"
          value="Série semanal e anual"
          unit="notificações observadas"
          period="2021 – 2026"
          source="InfoDengue / SINAN"
        />

        <KPICard 
          title="Vigilância de SRAG"
          value="SIVEP-Gripe"
          unit="notificações de SRAG"
          period="2025 – 2026"
          source="SIVEP-Gripe / MS"
        />
      </div>

      {/* Abas Acessíveis */}
      <Tabs 
        items={tabItems} 
        value={activeTab} 
        onChange={setActiveTab} 
        label="Eixos de Vigilância em Saúde"
      />

      {/* Aba 1: Nascidos Vivos & Pré-Natal */}
      <TabPanel id="nascimentos" value={activeTab} baseLabel="Nascidos Vivos e Pré-Natal">
        <div className="panel-grid">
          <ChartCard
            title="Evolução Anual de Nascidos Vivos (SINASC)"
            description="Série histórica de nascimentos de mães residentes em Unaí (2015–2026)."
            query={qNascimentos}
            queryId="nascimentos_anuais"
          >
            <NascimentosChart rows={qNascimentos?.rows || []} />
          </ChartCard>

          <ChartCard
            title="Consultas de Pré-Natal Realizadas"
            description="Distribuição do número de consultas pré-natais (meta: 7 ou mais consultas)."
            query={qPrenatal}
            queryId="sinasc_prenatal"
          >
            <SinascPrenatalChart rows={qPrenatal?.rows || []} />
          </ChartCard>
        </div>
      </TabPanel>

      {/* Aba 2: Mortalidade & Causas */}
      <TabPanel id="mortalidade" value={activeTab} baseLabel="Mortalidade e Causas">
        <div className="panel-grid single" style={{ marginBottom: '20px' }}>
          <ChartCard
            title="Evolução Histórica de Óbitos Gerais (SIM 2015–2026)"
            description="Série cronológica de óbitos de residentes em Unaí registrados no Sistema de Informações sobre Mortalidade."
            query={qObitosAnuais}
            queryId="obitos_anuais"
          >
            <ObitosAnuaisChart rows={qObitosAnuais?.rows || []} />
          </ChartCard>
        </div>

        <div className="panel-grid">
          <ChartCard
            title="Óbitos por Grandes Capítulos da CID-10 (SIM)"
            description="Distribuição das causas básicas de óbito de residentes em Unaí no ano selecionado."
            query={qCausas}
            rows={rowsCausas}
            queryId="sim_causas"
            controls={<YearSelect years={anosCausas} value={anoCausas ?? ''} onChange={setAnoCausasSelecionado} />}
          >
            <CausasMorteChart rows={qCausas?.rows || []} year={anoCausas} />
          </ChartCard>

          <ChartCard
            title="Óbitos por Faixa Etária"
            description="Distribuição etária dos óbitos de residentes em Unaí no ano selecionado."
            query={qIdade}
            rows={rowsIdade}
            queryId="sim_idade"
            controls={<YearSelect years={anosIdade} value={anoIdade ?? ''} onChange={setAnoIdadeSelecionado} />}
          >
            <SimIdadeChart rows={qIdade?.rows || []} year={anoIdade} />
          </ChartCard>
        </div>
      </TabPanel>

      {/* Aba 3: Arboviroses (Dengue, Chikungunya e Zika) */}
      <TabPanel id="arboviroses" value={activeTab} baseLabel="Arboviroses">
        <div className="panel-grid single" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <ChartCard
            title="Notificações anuais de arboviroses (InfoDengue / SINAN)"
            description="Série anual de notificações observadas, harmonizadas pela Fiocruz/FGV a partir de registros do SINAN para Unaí."
            query={qDengue}
            queryId="arboviroses_anual"
          >
            <DengueChart rows={qDengue?.rows || []} />
          </ChartCard>

          <ChartCard
            title="Notificações semanais de arboviroses (InfoDengue / SINAN)"
            description="Notificações observadas por semana epidemiológica para o agravo e ano selecionados."
            query={qArbovirosesSemanais}
            rows={serieSemanal.tableRows}
            queryId="arboviroses_semanal"
            controls={(
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div className="chart-select">
                  <label htmlFor="vigilancia-arbovirose">Agravo:</label>
                  <select
                    id="vigilancia-arbovirose"
                    value={agravoSemanalSelecionado}
                    onChange={event => setAgravoSemanalSelecionado(event.target.value)}
                  >
                    <option value="dengue">Dengue</option>
                    <option value="chikungunya">Chikungunya</option>
                    <option value="zika">Zika</option>
                  </select>
                </div>
                {anosSemanais.length > 0 && (
                  <YearSelect
                    years={anosSemanais}
                    value={anoSemanal ?? ''}
                    onChange={setAnoSemanalSelecionado}
                  />
                )}
              </div>
            )}
            note={buildWeeklySeriesNote(nomeAgravoSemanal, anoSemanal, serieSemanal.lastObservedWeek)}
          >
            <ArboviroseSemanalChart
              rows={qArbovirosesSemanais?.rows || []}
              agravo={agravoSemanalSelecionado}
              ano={anoSemanal}
            />
          </ChartCard>

          <ChartCard
            title="Casos Prováveis Consolidados de Dengue (DATASUS / TabNet / MS)"
            description="Casos prováveis consolidados por ano do primeiro sintoma segundo o Ministério da Saúde (excluídos casos descartados)."
            query={qDengueDatasus}
            queryId="dengue_datasus"
          >
            <DengueDatasusChart rows={qDengueDatasus?.rows || []} />
          </ChartCard>

          <Note title="Aspectos Epidemiológicos das Arboviroses em Unaí">
            <p>
              Em <strong>2024</strong>, o pacote registra 16.687 notificações na série InfoDengue/SINAN e 7.452 casos prováveis na série DATASUS/TabNet. As fontes têm definições e processamento distintos; os valores não são contagens equivalentes.
            </p>
          </Note>
        </div>
      </TabPanel>

      {/* Aba 4: SRAG (SIVEP-Gripe) */}
      <TabPanel id="srag" value={activeTab} baseLabel="Síndrome Respiratória Aguda Grave">
        <div className="panel-grid single">
          <ChartCard
            title="Notificações semanais de SRAG (SIVEP-Gripe)"
            description="Notificações de SRAG e óbitos registrados no conjunto municipal, por semana epidemiológica."
            query={qSrag}
            queryId="srag_sivep"
          >
            <SragChart rows={qSrag?.rows || []} />
          </ChartCard>
        </div>
      </TabPanel>

      {/* Aba 5: Imunização */}
      <TabPanel id="vacinas" value={activeTab} baseLabel="Imunização">
        <div className="panel-grid single">
          <ChartCard
            title="Cobertura Vacinal Oficial (Ano 2025)"
            description="Percentual de cobertura vacinal por imunobiológico em Unaí em relação às metas do PNI."
            query={qImunizacao}
            queryId="imunizacao_2025"
          >
            <ImunizacaoChart rows={qImunizacao?.rows || []} />
          </ChartCard>
        </div>
      </TabPanel>

      {/* Critérios de leitura */}
      <div style={{ marginTop: '32px' }}>
        <Note title="Critérios de leitura das séries">
          <ul>
            <li>Valores nulos representam ausência de informação e não são convertidos em zero.</li>
            <li>Na curva semanal InfoDengue, a linha termina na última semana com valor; a tabela e o CSV mantêm as demais linhas da fonte.</li>
            <li>Notificações InfoDengue/SINAN e casos prováveis DATASUS/TabNet são séries distintas e não devem ser somadas como uma única contagem.</li>
            <li>SRAG é apresentada como notificações do SIVEP-Gripe; esses registros não representam, por si só, uma contagem de internações hospitalares.</li>
          </ul>
        </Note>
      </div>
    </div>
  );
}
