import React, { useState } from 'react';
import { 
  Users, 
  Droplets, 
  Trash2, 
  MapPin 
} from 'lucide-react';
import { 
  PageHeader, 
  KPICard, 
  Tabs, 
  TabPanel, 
  ChartCard, 
  Note, 
  ValuesTable, 
  DownloadCSV 
} from '../components/ui';
import { 
  PiramideEtariaChart, 
  CorRacaChart, 
  PopulacaoEstimativasChart 
} from '../components/NativeCharts';
import { formatNumber, findIndicator } from '../utils/data-loader';

export default function GestaoView({ data, onRouteChange }) {
  const [activeTab, setActiveTab] = useState('piramide');

  const resumo = data?.resumo || [];
  const queries = data?.queries || {};

  const popTotal = findIndicator(resumo, 'I01');
  const popJovem = findIndicator(resumo, 'I02');
  const popIdoso = findIndicator(resumo, 'I03');

  const qFaixas = queries.populacao_idade_sexo;
  const qEstimativas = queries.populacao_estimativas;
  const qCorRaca = queries.populacao_cor_raca;
  const qEsgoto = queries.saneamento_esgoto;
  const qLixo = queries.saneamento_lixo;
  const qCenso = queries.territorio_censo;

  const faixasRows = qFaixas?.rows || [];
  const estimativasRows = qEstimativas?.rows || [];
  const corRacaRows = qCorRaca?.rows || [];
  const esgotoRows = qEsgoto?.rows || [];
  const lixoRows = qLixo?.rows || [];
  const censoRows = qCenso?.rows || [];

  const tabItems = [
    { id: 'piramide', label: 'Pirâmide Etária & Demografia', icon: Users },
    { id: 'cor_raca', label: 'Cor ou Raça (Censo IBGE)', icon: Users },
    { id: 'saneamento', label: 'Saneamento Básico & Território', icon: Droplets }
  ];

  return (
    <div className="container page">
      <PageHeader
        eyebrow="Eixo Estratégico 4"
        title="Gestão Estratégica, População & Território"
        onRouteChange={onRouteChange}
      >
        Caracterização demográfica da população de Unaí a partir do Censo 2022 do IBGE, estrutura etária, 
        condições de saneamento básico e informações territoriais para planejamento em saúde.
      </PageHeader>

      {/* Cards Demográficos Oficiais */}
      <div className="kpi-grid">
        <KPICard 
          title="População Residente Total"
          value={popTotal ? formatNumber(popTotal.valor) : "86.619"}
          unit="pessoas recenseadas"
          period="Censo 2022"
          source="IBGE, agregado 4714"
        />

        <KPICard 
          title="População de 0 a 14 Anos"
          value={popJovem ? `${popJovem.valor}%` : "19,4%"}
          unit="16.803 crianças e jovens"
          period="Censo 2022"
          source="IBGE, agregado 9514"
        />

        <KPICard 
          title="População de 60 Anos ou Mais"
          value={popIdoso ? `${popIdoso.valor}%` : "14,6%"}
          unit="12.646 pessoas idosas"
          period="Censo 2022"
          source="IBGE, agregado 9514"
        />

        <KPICard 
          title="Código do Município (IBGE)"
          value="3170404"
          unit="Unaí - Minas Gerais"
          period="Oficial"
          source="IBGE"
        />
      </div>

      {/* Abas Acessíveis */}
      <Tabs 
        items={tabItems} 
        value={activeTab} 
        onChange={setActiveTab} 
        label="Eixos Demográficos e Territoriais"
      />

      {/* Aba 1: Pirâmide Etária & Projeções */}
      <TabPanel id="piramide" value={activeTab} baseLabel="Pirâmide Etária e Demografia">
        <div className="panel-grid single" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <ChartCard
            title="Pirâmide Etária da População de Unaí (Censo Demográfico 2022)"
            description="Distribuição percentual e absoluta de homens e mulheres por faixas quinquenais de idade."
            query={qFaixas}
            queryId="populacao_idade_sexo"
          >
            <PiramideEtariaChart rows={faixasRows} />
          </ChartCard>

          <ChartCard
            title="Série Histórica e Estimativas Populacionais de Unaí (IBGE 2015–2026)"
            description="Projeções intercensitárias e contagens da população residente do município de Unaí publicadas pelo IBGE."
            query={qEstimativas}
            queryId="populacao_estimativas"
          >
            <PopulacaoEstimativasChart rows={estimativasRows} />
          </ChartCard>
        </div>
      </TabPanel>

      {/* Aba 2: Cor ou Raça */}
      <TabPanel id="cor_raca" value={activeTab} baseLabel="Cor ou Raça">
        <div className="panel-grid single">
          <ChartCard
            title="Distribuição da População por Cor ou Raça (Censo Demográfico IBGE)"
            description="Autodeclaração étnico-racial da totalidade dos residentes recenseados em Unaí (Parda, Branca, Preta, Amarela e Indígena)."
            query={qCorRaca}
            queryId="populacao_cor_raca"
            rows={corRacaRows}
          >
            <CorRacaChart rows={corRacaRows} />
          </ChartCard>
        </div>
      </TabPanel>

      {/* Aba 3: Saneamento Básico & Território */}
      <TabPanel id="saneamento" value={activeTab} baseLabel="Saneamento Básico e Território">
        <div className="panel-grid">
          <section className="chart-card" aria-label="Esgotamento Sanitário">
            <div className="chart-card-head">
              <div>
                <h4>Esgotamento Sanitário dos Domicílios</h4>
                <p>Tipo de esgotamento sanitário nos domicílios particulares permanentes ocupados.</p>
              </div>
            </div>
            <div className="chart-card-body">
              <ValuesTable rows={esgotoRows} />
            </div>
            <div className="chart-card-foot">
              <div className="chart-meta">
                <div>Fonte: <strong>{qEsgoto?.source?.label || 'IBGE Censo 2022'}</strong></div>
                <div>Período: <strong>{qEsgoto?.source?.period || '2022'}</strong></div>
              </div>
              <div className="chart-actions">
                <DownloadCSV rows={esgotoRows} source={qEsgoto?.source} queryId="saneamento_esgoto" />
              </div>
            </div>
          </section>

          <section className="chart-card" aria-label="Destino do Lixo">
            <div className="chart-card-head">
              <div>
                <h4>Destino do Lixo Domiciliar</h4>
                <p>Forma de descarte de resíduos nos domicílios do município.</p>
              </div>
            </div>
            <div className="chart-card-body">
              <ValuesTable rows={lixoRows} />
            </div>
            <div className="chart-card-foot">
              <div className="chart-meta">
                <div>Fonte: <strong>{qLixo?.source?.label || 'IBGE Censo 2022'}</strong></div>
                <div>Período: <strong>{qLixo?.source?.period || '2022'}</strong></div>
              </div>
              <div className="chart-actions">
                <DownloadCSV rows={lixoRows} source={qLixo?.source} queryId="saneamento_lixo" />
              </div>
            </div>
          </section>
        </div>

        {/* Tabela de Indicadores Territoriais do Censo */}
        <div style={{ marginTop: '24px' }}>
          <section className="chart-card" aria-label="Território e Censo">
            <div className="chart-card-head">
              <div>
                <h4>Indicadores Territoriais e Demográficos Censitários</h4>
                <p>Área territorial, densidade demográfica e domicílios particulares do Censo 2022.</p>
              </div>
            </div>
            <div className="chart-card-body">
              <ValuesTable rows={censoRows} />
            </div>
            <div className="chart-card-foot">
              <div className="chart-meta">
                <div>Fonte: <strong>{qCenso?.source?.label || 'IBGE Censo 2022'}</strong></div>
                <div>Período: <strong>{qCenso?.source?.period || '2022'}</strong></div>
              </div>
              <div className="chart-actions">
                <DownloadCSV rows={censoRows} source={qCenso?.source} queryId="territorio_censo" />
              </div>
            </div>
          </section>
        </div>
      </TabPanel>

      {/* Notas Metodológicas */}
      <div style={{ marginTop: '32px' }}>
        <Note title="Notas Metodológicas e Limitações Demográficas">
          <ul>
            <li>Todos os dados demográficos e sanitários desta seção têm como fonte oficial o Censo Demográfico 2022 do IBGE (SIDRA).</li>
            <li>A malha territorial considera a delimitação municipal oficial vigente (código IBGE 3170404).</li>
          </ul>
        </Note>
      </div>
    </div>
  );
}
