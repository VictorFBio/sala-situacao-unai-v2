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
  Note 
} from '../components/ui';
import { 
  NascimentosChart, 
  SinascPrenatalChart, 
  CausasMorteChart, 
  SimIdadeChart, 
  ObitosAnuaisChart, 
  DengueChart, 
  SragChart, 
  ImunizacaoChart 
} from '../components/NativeCharts';

export default function VigilanciaView({ data, onRouteChange }) {
  const [activeTab, setActiveTab] = useState('nascimentos');

  const queries = data?.queries || {};

  const qNascimentos = queries.nascimentos_anuais;
  const qPrenatal = queries.sinasc_prenatal;
  const qObitosAnuais = queries.obitos_anuais;
  const qCausas = queries.sim_causas;
  const qIdade = queries.sim_idade;
  const qDengue = queries.arboviroses_anual;
  const qSrag = queries.srag_sivep;
  const qImunizacao = queries.imunizacao_2025;

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
        Séries históricas de nascidos vivos (SINASC), perfil de mortalidade (SIM), monitoramento contínuo de arboviroses 
        (Dengue), internações por SRAG (SIVEP-Gripe) e cobertura vacinal oficial de 2025.
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
          value="Série Notificada"
          unit="notificações de casos prováveis"
          period="2015 – 2026"
          source="InfoDengue / SINAN"
        />

        <KPICard 
          title="Vigilância de SRAG"
          value="SIVEP-Gripe"
          unit="internações por síndromes gripais"
          period="2020 – 2026"
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
            description="Distribuição das principais causas básicas de óbito de residentes em Unaí."
            query={qCausas}
            queryId="sim_causas"
          >
            <CausasMorteChart rows={qCausas?.rows || []} />
          </ChartCard>

          <ChartCard
            title="Óbitos por Faixa Etária"
            description="Distribuição etária da mortalidade observada no município."
            query={qIdade}
            queryId="sim_idade"
          >
            <SimIdadeChart rows={qIdade?.rows || []} />
          </ChartCard>
        </div>
      </TabPanel>

      {/* Aba 3: Arboviroses (Dengue) */}
      <TabPanel id="arboviroses" value={activeTab} baseLabel="Arboviroses">
        <div className="panel-grid single">
          <ChartCard
            title="Casos Notificados de Dengue (Série Anual)"
            description="Casos prováveis e confirmados de dengue registrados no SINAN e InfoDengue em Unaí."
            query={qDengue}
            queryId="arboviroses_anual"
          >
            <DengueChart rows={qDengue?.rows || []} />
          </ChartCard>
        </div>
      </TabPanel>

      {/* Aba 4: SRAG (SIVEP-Gripe) */}
      <TabPanel id="srag" value={activeTab} baseLabel="Síndrome Respiratória Aguda Grave">
        <div className="panel-grid single">
          <ChartCard
            title="Hospitalizações por SRAG (SIVEP-Gripe)"
            description="Internações hospitalares por Síndrome Respiratória Aguda Grave notificadas no município."
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

      {/* Notas Metodológicas */}
      <div style={{ marginTop: '32px' }}>
        <Note title="Notas Metodológicas e Limitações dos Dados de Vigilância">
          <ul>
            <li>Os dados de 2026 são preliminares e sofrem atualizações retroativas contínuas conforme a digitação dos sistemas SINASC, SIM e SINAN.</li>
            <li>Arboviroses e síndromes gripais incluem casos notificados e investigados conforme o protocolo epidemiológico vigente.</li>
            <li>Fonte primária: DATASUS / Secretaria de Estado de Saúde de Minas Gerais (SES-MG) / InfoDengue / PNI.</li>
          </ul>
        </Note>
      </div>
    </div>
  );
}
