import React, { useState } from 'react';
import { 
  Stethoscope, 
  Smile, 
  ShieldCheck 
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
  ApsAtendimentosChart, 
  ApsVisitasChart, 
  ApsOdontoChart, 
  ApsProcedimentosChart, 
  ApsC1Chart 
} from '../components/NativeCharts';
import { formatNumber, findIndicator } from '../utils/data-loader';

export default function APSView({ data, onRouteChange }) {
  const [activeTab, setActiveTab] = useState('atendimentos');

  const resumo = data?.resumo || [];
  const queries = data?.queries || {};

  const esf = findIndicator(resumo, 'I06');
  const c1 = findIndicator(resumo, 'I07');
  const atendimentos = findIndicator(resumo, 'I08');
  const visitas = findIndicator(resumo, 'I09');

  const qAtendimentos = queries.aps_individuais;
  const qVisitas = queries.aps_visitas;
  const qOdonto = queries.aps_odontologia;
  const qProcedimentos = queries.aps_procedimentos;
  const qC1 = queries.aps_c1;

  const tabItems = [
    { id: 'atendimentos', label: 'Atendimentos & Visitas ACS', icon: Stethoscope },
    { id: 'odonto_proc', label: 'Procedimentos & Odontologia', icon: Smile },
    { id: 'mais_acesso', label: 'Programa Mais Acesso (C1)', icon: ShieldCheck }
  ];

  return (
    <div className="container page">
      <PageHeader
        eyebrow="Eixo Estratégico 1"
        title="Atenção Primária à Saúde (APS)"
        onRouteChange={onRouteChange}
      >
        Acompanhamento das Equipes de Saúde da Família (eSF), classificação do programa Mais Acesso à APS, 
        produção ambulatorial e cobertura de visitas domiciliares de Agentes Comunitários de Saúde (ACS).
      </PageHeader>

      {/* Cards de Indicadores da APS */}
      <div className="kpi-grid">
        <KPICard 
          title="Equipes eSF Válidas para Custeio"
          value={esf ? `${esf.valor} equipes` : "21 equipes"}
          unit="equipes credenciadas e em operação"
          period={esf ? esf.periodo : "1º quadrimestre de 2026"}
          source="Siaps / MS"
        />

        <KPICard 
          title="Classificação C1 (Mais Acesso)"
          value={c1 ? `${c1.valor} equipes` : "21 equipes"}
          unit="classificação de qualidade oficial"
          period={c1 ? c1.periodo : "1º quadrimestre de 2026"}
          source="Siaps / MS"
        />

        <KPICard 
          title="Atendimentos Individuais Registrados"
          value={atendimentos ? formatNumber(atendimentos.valor) : "16.366"}
          unit="consultas médicas e de enfermagem"
          period={atendimentos ? atendimentos.periodo : "07/2026"}
          source="Siaps / APS"
        />

        <KPICard 
          title="Visitas Domiciliares Realizadas (ACS)"
          value={visitas ? formatNumber(visitas.valor) : "36.431"}
          unit="visitas domiciliares no município"
          period={visitas ? visitas.periodo : "07/2026"}
          source="Siaps / APS"
        />
      </div>

      {/* Navegação por Abas Acessíveis */}
      <Tabs 
        items={tabItems} 
        value={activeTab} 
        onChange={setActiveTab} 
        label="Eixos da Atenção Primária à Saúde"
      />

      {/* Aba 1: Atendimentos & Visitas ACS */}
      <TabPanel id="atendimentos" value={activeTab} baseLabel="Atendimentos e Visitas ACS">
        <div className="panel-grid single" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <ChartCard
            title="Evolução dos Atendimentos Individuais na APS"
            description="Contagem contínua de consultas médicas e de enfermagem registradas no Siaps (série mensal)."
            query={qAtendimentos}
            queryId="aps_individuais"
          >
            <ApsAtendimentosChart rows={qAtendimentos?.rows || []} />
          </ChartCard>

          <ChartCard
            title="Visitas Domiciliares Realizadas por Agentes Comunitários de Saúde (ACS)"
            description="Acompanhamento territorial mensal no domicílio das famílias de Unaí."
            query={qVisitas}
            queryId="aps_visitas"
          >
            <ApsVisitasChart rows={qVisitas?.rows || []} />
          </ChartCard>
        </div>
      </TabPanel>

      {/* Aba 2: Procedimentos & Odontologia */}
      <TabPanel id="odonto_proc" value={activeTab} baseLabel="Procedimentos e Odontologia">
        <div className="panel-grid">
          <ChartCard
            title="Atendimentos Odontológicos na Atenção Primária"
            description="Consultas e procedimentos de saúde bucal na rede básica municipal."
            query={qOdonto}
            queryId="aps_odontologia"
          >
            <ApsOdontoChart rows={qOdonto?.rows || []} />
          </ChartCard>

          <ChartCard
            title="Procedimentos Clínicos e Ambulatoriais na APS"
            description="Curativos, administração de medicamentos, aferição de pressão e glicemia."
            query={qProcedimentos}
            queryId="aps_procedimentos"
          >
            <ApsProcedimentosChart rows={qProcedimentos?.rows || []} />
          </ChartCard>
        </div>
      </TabPanel>

      {/* Aba 3: Programa Mais Acesso (C1) */}
      <TabPanel id="mais_acesso" value={activeTab} baseLabel="Programa Mais Acesso C1">
        <div className="panel-grid single" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <ChartCard
            title="Classificação de Desempenho C1 das 21 Equipes eSF (Por Quadrimestre)"
            description="Distribuição oficial das equipes entre as categorias Ótimo, Bom, Suficiente e Regular no Siaps/MS."
            query={qC1}
            queryId="aps_c1"
          >
            <ApsC1Chart rows={qC1?.rows || []} />
          </ChartCard>

          <Note title="Resumo do 1º Quadrimestre de 2026 (2026Q1)">
            <p>
              No 1º quadrimestre de 2026, todas as <strong>21 equipes de Saúde da Família (eSF)</strong> mantiveram-se credenciadas e aptas ao custeio federal no programa Mais Acesso, distribuídas em: <strong>2 equipes com padrão Ótimo</strong>, <strong>3 equipes Bom</strong>, <strong>13 equipes Suficiente</strong> e <strong>3 equipes Regular</strong>. O 2º quadrimestre de 2026 permanece em apuração administrativa pelo Ministério da Saúde.
            </p>
          </Note>
        </div>
      </TabPanel>

      {/* Notas Metodológicas e Transparência */}
      <div style={{ marginTop: '32px' }}>
        <Note title="Notas Metodológicas e Limitações dos Dados da APS">
          <ul>
            <li>Os dados de atendimentos e visitas representam <strong>contagem de eventos registrados</strong> e não pessoas únicas atendidas.</li>
            <li>As 21 equipes eSF referem-se às unidades homologadas para custeio federal na competência de referência.</li>
            <li>Fonte primária: Sistema de Informação para a Atenção Primária à Saúde (Siaps) do Ministério da Saúde.</li>
          </ul>
        </Note>
      </div>
    </div>
  );
}
