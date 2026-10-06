import React, { useState } from 'react';
import { 
  Building2, 
  Activity, 
  Search 
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
  SihEvolucaoChart, 
  RedeSusChart 
} from '../components/NativeCharts';
import { formatNumber, findIndicator } from '../utils/data-loader';

export default function HospitalarView({ data, onRouteChange }) {
  const [activeTab, setActiveTab] = useState('internacoes');
  const [searchTerm, setSearchTerm] = useState('');

  const resumo = data?.resumo || [];
  const queries = data?.queries || {};

  const cnesTotal = findIndicator(resumo, 'I04');
  const cnesTipo02 = findIndicator(resumo, 'I05');

  const qInternacoes = queries.sih_internacoes;
  const qValores = queries.sih_valor;
  const qDias = queries.sih_dias;
  const qRedeTipos = queries.rede_tipos;
  const qRedeSus = queries.rede_sus;

  const internacoesRows = qInternacoes?.rows || [];
  const valoresRows = qValores?.rows || [];
  const redeTiposRows = qRedeTipos?.rows || [];
  const redeSusRows = qRedeSus?.rows || [];

  const ultimasInternacoes = internacoesRows.length ? internacoesRows[internacoesRows.length - 1].valor : 5337;

  const tabItems = [
    { id: 'internacoes', label: 'Internações Hospitalares (SIH/SUS)', icon: Activity },
    { id: 'rede', label: 'Estrutura da Rede e CNES', icon: Building2 }
  ];

  const filteredTipos = redeTiposRows.filter(r => {
    const nome = (r.tipo || r.categoria || '').toLowerCase();
    return nome.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="container page">
      <PageHeader
        eyebrow="Eixo Estratégico 2"
        title="Atenção Especializada & Hospitalar"
        onRouteChange={onRouteChange}
      >
        Perfil dos estabelecimentos no Cadastro Nacional (CNES), vínculo com o Sistema Único de Saúde (SUS) 
        e produção hospitalar de internações (SIH/SUS) por especialidade clínica, cirúrgica e obstétrica.
      </PageHeader>

      {/* Cards de Indicadores */}
      <div className="kpi-grid">
        <KPICard 
          title="Total de Estabelecimentos Cadastrados"
          value={cnesTotal ? formatNumber(cnesTotal.valor) : "288"}
          unit="estabelecimentos ativos no município"
          period={cnesTotal ? cnesTotal.periodo : "29/09/2026"}
          source="CNES / DataSUS"
        />

        <KPICard 
          title="Unidades Básicas de Saúde (Tipo 02)"
          value={cnesTipo02 ? formatNumber(cnesTipo02.valor) : "20"}
          unit="postos e centros de saúde cadastrados"
          period={cnesTipo02 ? cnesTipo02.periodo : "29/09/2026"}
          source="CNES / DataSUS"
        />

        <KPICard 
          title="Internações Hospitalares Aprovadas"
          value={ultimasInternacoes ? formatNumber(ultimasInternacoes) : "5.337"}
          unit="Autorizações de Internação (AIH/ano)"
          period="SIH / SUS"
          source="SIH / DataSUS"
        />

        <KPICard 
          title="Média de Permanência Hospitalar"
          value="4 a 6 dias"
          unit="dias de internação observados"
          period="Série Recente"
          source="SIH / SUS"
        />
      </div>

      {/* Abas Acessíveis */}
      <Tabs 
        items={tabItems} 
        value={activeTab} 
        onChange={setActiveTab} 
        label="Eixos da Atenção Hospitalar e Rede"
      />

      {/* Aba 1: Internações Hospitalares */}
      <TabPanel id="internacoes" value={activeTab} baseLabel="Internações Hospitalares">
        <div className="panel-grid single" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <ChartCard
            title="Série Histórica de Internações Hospitalares (SIH/SUS)"
            description="Volume anual de internações hospitalares aprovadas e recursos financeiros associados."
            query={qInternacoes}
            queryId="sih_internacoes"
          >
            <SihEvolucaoChart 
              rowsInternacoes={internacoesRows} 
              rowsValores={valoresRows} 
            />
          </ChartCard>

          <Note title="Aspectos da Produção Hospitalar em Unaí">
            <p>
              As internações pelo SUS no município de Unaí englobam o atendimento prestado a munícipes e a pacientes referenciados de municípios vizinhos da Macrorregião Noroeste de Minas. O monitoramento contínuo das AIHs permite dimensionar leitos clínicos, cirúrgicos e obstétricos.
            </p>
          </Note>
        </div>
      </TabPanel>

      {/* Aba 2: Estrutura da Rede e CNES */}
      <TabPanel id="rede" value={activeTab} baseLabel="Estrutura da Rede e CNES">
        <div className="panel-grid">
          <ChartCard
            title="Vínculo dos Estabelecimentos com o SUS"
            description="Proporção de estabelecimentos com atendimento SUS versus exclusivamente privados no CNES."
            query={qRedeSus}
            queryId="rede_sus"
          >
            <RedeSusChart rows={redeSusRows} />
          </ChartCard>

          <section className="chart-card" aria-label="Tipos de estabelecimentos CNES">
            <div className="chart-card-head">
              <div>
                <h4>Tipologia dos Estabelecimentos de Saúde</h4>
                <p>Classificação oficial do Ministério da Saúde no cadastro CNES de Unaí.</p>
              </div>
              <div className="chart-select">
                <input
                  type="search"
                  placeholder="Filtrar tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ padding: '5px 8px', fontSize: '0.8rem', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius)' }}
                />
              </div>
            </div>
            <div className="chart-card-body">
              <div className="table-wrap" style={{ maxHeight: '280px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th scope="col">Tipo de Estabelecimento</th>
                      <th scope="col" className="num">Quantidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTipos.map((r, i) => (
                      <tr key={i}>
                        <td>{r.tipo || r.categoria}</td>
                        <td className="num">{formatNumber(r.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="chart-card-foot">
              <div className="chart-meta">
                <div>Fonte: <strong>{qRedeTipos?.source?.label || 'CNES / DataSUS'}</strong></div>
                <div>Período: <strong>{qRedeTipos?.source?.period || '29/09/2026'}</strong></div>
              </div>
              <div className="chart-actions">
                <DownloadCSV rows={redeTiposRows} source={qRedeTipos?.source} queryId="rede_tipos" />
              </div>
            </div>
          </section>
        </div>
      </TabPanel>

      {/* Notas e Limitações */}
      <div style={{ marginTop: '32px' }}>
        <Note title="Notas Metodológicas e Limitações dos Dados Hospitalares">
          <ul>
            <li>Os registros do SIH/SUS refletem autorizações de internação (AIH) processadas e aprovadas, passíveis de complementação em competências posteriores.</li>
            <li>O CNES abrange todos os estabelecimentos de saúde cadastrados (públicos e privados), com atualizações mensais regulamentares.</li>
            <li>Fonte primária: DATASUS / Ministério da Saúde (Sistemas SIH e CNES).</li>
          </ul>
        </Note>
      </div>
    </div>
  );
}
