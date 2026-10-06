import React, { useState } from 'react';
import { ArrowLeft, Building2, Bed, Activity, Info, Building, DollarSign, Clock, Search } from 'lucide-react';
import KPICard from '../components/KPICard';
import LookerEmbed from '../components/LookerEmbed';
import { SihEvolucaoChart, RedeSusChart } from '../components/NativeCharts';
import { formatNumber, formatCurrency } from '../utils/data-loader';

export default function HospitalarView({ data, onRouteChange }) {
  const [activeTab, setActiveTab] = useState('internacoes');
  const [searchTerm, setSearchTerm] = useState('');

  const resumo = data?.resumo || [];
  const dashboard = data?.dashboard || {};
  const queries = dashboard.queries || {};

  const getInd = (id) => resumo.find(i => i.id === id);
  const cnesTotal = getInd('I04');
  const cnesTipo02 = getInd('I05');

  const internacoes = queries.sih_internacoes?.rows || [];
  const sihValores = queries.sih_valor?.rows || [];
  const sihDias = queries.sih_dias?.rows || [];
  const redeTipos = queries.rede_tipos?.rows || [];
  const redeSus = queries.rede_sus?.rows || [];

  const ultimasInternacoes = internacoes.slice(-1)[0]?.valor || 0;
  const ultimoValor = sihValores.slice(-1)[0]?.valor || 0;
  const ultimosDias = sihDias.slice(-1)[0]?.valor || 0;

  const filteredTipos = redeTipos.filter(r => {
    const nome = (r.tipo || r.categoria || '').toLowerCase();
    return nome.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="container" style={{ padding: '32px 24px' }}>
      {/* Navegação Superior */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          className="btn-header-rever"
          onClick={() => onRouteChange('#/')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={14} />
          <span>Voltar para a Página Inicial</span>
        </button>
      </div>

      {/* Cabeçalho da Seção */}
      <div style={{ marginBottom: '28px' }}>
        <span className="badge-version" style={{ background: '#EAF2F8', color: '#08588E', marginBottom: '8px' }}>
          <Building2 size={13} />
          Eixo Estratégico 2
        </span>
        <h2 style={{ fontSize: '2rem', color: 'var(--color-primary-dark)', marginBottom: '6px' }}>
          Atenção Especializada & Hospitalar
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', maxWidth: '820px' }}>
          Perfil dos estabelecimentos no Cadastro Nacional (CNES), vínculo com o Sistema Único de Saúde (SUS) 
          e produção hospitalar de internações (SIH/SUS) por especialidade clínica, cirúrgica e obstétrica.
        </p>
      </div>

      {/* Cards de Indicadores Hospitalares e de Rede */}
      <div className="kpi-grid">
        <KPICard 
          title="Total de Estabelecimentos Cadastrados"
          value={cnesTotal ? formatNumber(cnesTotal.valor) : "288"}
          unit="estabelecimentos ativos no município"
          period={cnesTotal ? cnesTotal.periodo : "29/09/2026"}
          source="CNES / DataSUS"
          status="Públicos e Privados"
        />

        <KPICard 
          title="Unidades Básicas de Saúde (Tipo 02)"
          value={cnesTipo02 ? formatNumber(cnesTipo02.valor) : "20"}
          unit="postos e centros de saúde cadastrados"
          period={cnesTipo02 ? cnesTipo02.periodo : "29/09/2026"}
          source="CNES / DataSUS"
          status="Atenção Primária"
        />

        <KPICard 
          title="Internações Hospitalares Aprovadas"
          value={ultimasInternacoes ? formatNumber(ultimasInternacoes) : "5.337"}
          unit="Autorizações de Internação (AIH/ano)"
          period="SIH / SUS"
          source="SIH / DataSUS"
          status="Média / Alta Complexidade"
        />

        <KPICard 
          title="Média de Permanência Geral"
          value="4 a 6 dias"
          unit="dias de internação observados"
          period="Série Recente"
          source="SIH / SUS"
          status="Indicador de Gestão"
        />
      </div>

      {/* Looker Embed com Fallback Nativo */}
      <LookerEmbed 
        reportKey="hospitalar"
        defaultTitle="Painel de Atenção Hospitalar e Especializada · Looker Studio"
        nativeContent={
          <div>
            {/* Seletor de Abas do Dashboard */}
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              borderBottom: '2px solid var(--color-border)', 
              marginBottom: '24px',
              paddingBottom: '2px',
              overflowX: 'auto'
            }}>
              <button
                onClick={() => setActiveTab('internacoes')}
                style={{
                  padding: '10px 18px',
                  borderRadius: '6px 6px 0 0',
                  border: 'none',
                  background: activeTab === 'internacoes' ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === 'internacoes' ? '#FFFFFF' : 'var(--color-text-main)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Bed size={16} />
                <span>Internações & Produção SIH/SUS</span>
              </button>

              <button
                onClick={() => setActiveTab('rede')}
                style={{
                  padding: '10px 18px',
                  borderRadius: '6px 6px 0 0',
                  border: 'none',
                  background: activeTab === 'rede' ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === 'rede' ? '#FFFFFF' : 'var(--color-text-main)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Building size={16} />
                <span>Rede Assistencial & CNES</span>
              </button>
            </div>

            {/* Conteúdo da Aba 1: Internações */}
            {activeTab === 'internacoes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: '4px' }}>
                      Evolução Anual das Internações Hospitalares Aprovadas (AIH / SIH-SUS)
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      Total anual de internações faturadas pelo Sistema de Informações Hospitalares do SUS em Unaí.
                    </p>
                  </div>
                  <SihEvolucaoChart rowsInternacoes={internacoes} rowsValores={sihValores} />
                </div>

                {/* Métricas de Custo e Dias */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div style={{ background: 'var(--color-bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0B6B55', fontWeight: 600, fontSize: '0.875rem', marginBottom: '6px' }}>
                      <DollarSign size={16} />
                      <span>Faturamento Total Anual</span>
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                      {ultimoValor ? formatCurrency(ultimoValor) : "R$ 5.300.000+"}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      Recursos federais faturados no SIH/SUS para cobertura de AIH.
                    </p>
                  </div>

                  <div style={{ background: 'var(--color-bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#08588E', fontWeight: 600, fontSize: '0.875rem', marginBottom: '6px' }}>
                      <Clock size={16} />
                      <span>Dias de Internação / Ano</span>
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                      {ultimosDias ? formatNumber(ultimosDias) : "21.900+ dias"}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      Soma dos dias de leito ocupados por pacientes do SUS.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Conteúdo da Aba 2: Rede CNES & SUS */}
            {activeTab === 'rede' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px' }}>
                {/* Gráfico Vínculo SUS */}
                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ marginBottom: '14px' }}>
                    <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: '4px' }}>
                      Estabelecimentos por Vínculo SUS (CNES)
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      Proporção de estabelecimentos públicos/conveniados ao SUS vs. privados exclusivos.
                    </p>
                  </div>
                  <RedeSusChart rows={redeSus} />
                  <div style={{ marginTop: '16px', fontSize: '0.8125rem', color: 'var(--color-text-muted)', background: 'var(--color-bg-subtle)', padding: '12px', borderRadius: '6px' }}>
                    São <strong>48 estabelecimentos com atendimento SUS</strong> (incluindo UBS, Centros de Especialidades e Hospitais conveniados) e <strong>240 estabelecimentos exclusivamente privados</strong> (clínicas, consultórios e laboratórios).
                  </div>
                </div>

                {/* Tabela de Tipos CNES com Pesquisa */}
                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: '4px' }}>
                      Tipos de Estabelecimento Cadastrados (288 Unidades)
                    </h4>
                    <div style={{ position: 'relative', marginTop: '10px' }}>
                      <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--color-text-light)' }} />
                      <input 
                        type="text" 
                        placeholder="Filtrar tipo de estabelecimento..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px 8px 32px',
                          borderRadius: '6px',
                          border: '1px solid var(--color-border)',
                          fontSize: '0.8125rem',
                          background: 'var(--color-bg-subtle)'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ maxHeight: '280px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                      <thead style={{ background: 'var(--color-bg-subtle)', position: 'sticky', top: 0 }}>
                        <tr>
                          <th style={{ padding: '8px 12px', textAlign: 'left' }}>Tipo de Estabelecimento</th>
                          <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTipos.map((r, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                            <td style={{ padding: '8px 12px' }}>{r.tipo || r.categoria}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>{formatNumber(r.valor)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Notas Metodológicas */}
            <div style={{ marginTop: '32px', background: 'var(--color-bg-subtle)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--color-primary-dark)', fontWeight: 700 }}>
                <Info size={16} />
                <span>Notas Metodológicas e Limitações do CNES e SIH/SUS</span>
              </div>
              <ul style={{ paddingLeft: '20px', fontSize: '0.8125rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>O CNES reflete estabelecimentos formalmente cadastrados (públicos e privados) e não prova capacidade assistencial plena ou atendimento exclusivo pelo SUS.</li>
                <li>Os dados hospitalares correspondem a internações aprovadas e registradas no SIH/SUS de Unaí.</li>
              </ul>
            </div>
          </div>
        }
      />
    </div>
  );
}

