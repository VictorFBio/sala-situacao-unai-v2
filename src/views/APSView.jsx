import React, { useState } from 'react';
import { ArrowLeft, Activity, Users, Calendar, Info, Stethoscope, Sparkles, Smile, ShieldCheck } from 'lucide-react';
import KPICard from '../components/KPICard';
import LookerEmbed from '../components/LookerEmbed';
import { 
  ApsAtendimentosChart, 
  ApsVisitasChart, 
  ApsOdontoChart, 
  ApsProcedimentosChart, 
  ApsC1Chart 
} from '../components/NativeCharts';
import { formatNumber } from '../utils/data-loader';

export default function APSView({ data, onRouteChange }) {
  const [activeTab, setActiveTab] = useState('atendimentos');

  const resumo = data?.resumo || [];
  const dashboard = data?.dashboard || {};
  const queries = dashboard.queries || {};

  const getInd = (id) => resumo.find(i => i.id === id);
  const esf = getInd('I06');
  const c1 = getInd('I07');
  const atendimentos = getInd('I08');
  const visitas = getInd('I09');

  const serieAtendimentos = queries.aps_individuais?.rows || [];
  const serieVisitas = queries.aps_visitas?.rows || [];
  const serieOdonto = queries.aps_odontologia?.rows || [];
  const serieProcedimentos = queries.aps_procedimentos?.rows || [];
  const serieC1 = queries.aps_c1?.rows || [];

  return (
    <div className="container" style={{ padding: '32px 24px' }}>
      {/* Navegação Superior / Breadcrumb */}
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
        <span className="badge-version" style={{ background: '#E8F5F1', color: '#0B6B55', marginBottom: '8px' }}>
          <Activity size={13} />
          Eixo Estratégico 1
        </span>
        <h2 style={{ fontSize: '2rem', color: 'var(--color-primary-dark)', marginBottom: '6px' }}>
          Atenção Primária à Saúde (APS)
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', maxWidth: '820px' }}>
          Acompanhamento das Equipes de Saúde da Família (eSF), classificação do programa Mais Acesso à APS, 
          produção ambulatorial e cobertura de visitas domiciliares de Agentes Comunitários de Saúde (ACS).
        </p>
      </div>

      {/* Cards de Indicadores da APS */}
      <div className="kpi-grid">
        <KPICard 
          title="Equipes eSF Válidas para Custeio"
          value={esf ? esf.valor : "21 equipes"}
          unit="equipes credenciadas e em operação"
          period={esf ? esf.periodo : "1º quadrimestre de 2026"}
          source="Siaps / MS"
          status="Homologadas"
        />

        <KPICard 
          title="Classificação C1 (Mais Acesso)"
          value={c1 ? c1.valor : "21 equipes"}
          unit="classificação de qualidade oficial"
          period={c1 ? c1.periodo : "1º quadrimestre de 2026"}
          source="Siaps / MS"
          status="100% no padrão"
        />

        <KPICard 
          title="Atendimentos Individuais Registrados"
          value={atendimentos ? formatNumber(atendimentos.valor) : "16.366"}
          unit="consultas médicas e de enfermagem"
          period={atendimentos ? atendimentos.periodo : "07/2026"}
          source="Siaps / APS"
          status="Mês de Referência"
        />

        <KPICard 
          title="Visitas Domiciliares Realizadas (ACS)"
          value={visitas ? formatNumber(visitas.valor) : "36.431"}
          unit="visitas domiciliares no município"
          period={visitas ? visitas.periodo : "07/2026"}
          source="Siaps / APS"
          status="Acompanhamento"
        />
      </div>

      {/* Integração Looker Studio com Fallback de Gráficos Nativos */}
      <LookerEmbed 
        reportKey="aps"
        defaultTitle="Painel Interativo de Atenção Primária · Looker Studio"
        nativeContent={
          <div>
            {/* Seletor de Abas do Dashboard Nativo */}
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              borderBottom: '2px solid var(--color-border)', 
              marginBottom: '24px',
              paddingBottom: '2px',
              overflowX: 'auto'
            }}>
              <button
                onClick={() => setActiveTab('atendimentos')}
                style={{
                  padding: '10px 18px',
                  borderRadius: '6px 6px 0 0',
                  border: 'none',
                  background: activeTab === 'atendimentos' ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === 'atendimentos' ? '#FFFFFF' : 'var(--color-text-main)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Stethoscope size={16} />
                <span>Atendimentos & Visitas ACS</span>
              </button>

              <button
                onClick={() => setActiveTab('odonto_proc')}
                style={{
                  padding: '10px 18px',
                  borderRadius: '6px 6px 0 0',
                  border: 'none',
                  background: activeTab === 'odonto_proc' ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === 'odonto_proc' ? '#FFFFFF' : 'var(--color-text-main)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Smile size={16} />
                <span>Procedimentos & Odontologia</span>
              </button>

              <button
                onClick={() => setActiveTab('mais_acesso')}
                style={{
                  padding: '10px 18px',
                  borderRadius: '6px 6px 0 0',
                  border: 'none',
                  background: activeTab === 'mais_acesso' ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === 'mais_acesso' ? '#FFFFFF' : 'var(--color-text-main)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <ShieldCheck size={16} />
                <span>Programa Mais Acesso (C1)</span>
              </button>
            </div>

            {/* Conteúdo da Aba 1: Atendimentos & Visitas */}
            {activeTab === 'atendimentos' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ marginBottom: '14px' }}>
                    <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: '4px' }}>
                      Evolução dos Atendimentos Individuais na APS (Série Mensal)
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      Contagem contínua de consultas médicas e de enfermagem registradas no Siaps.
                    </p>
                  </div>
                  <ApsAtendimentosChart rows={serieAtendimentos} />
                </div>

                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ marginBottom: '14px' }}>
                    <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: '4px' }}>
                      Visitas Domiciliares Realizadas por Agentes Comunitários de Saúde (ACS)
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      Acompanhamento territorial mensal no domicílio das famílias de Unaí.
                    </p>
                  </div>
                  <ApsVisitasChart rows={serieVisitas} />
                </div>
              </div>
            )}

            {/* Conteúdo da Aba 2: Procedimentos & Odontologia */}
            {activeTab === 'odonto_proc' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ marginBottom: '14px' }}>
                    <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: '4px' }}>
                      Atendimentos Odontológicos na Atenção Primária
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      Consultas e procedimentos de saúde bucal na rede básica municipal.
                    </p>
                  </div>
                  <ApsOdontoChart rows={serieOdonto} />
                </div>

                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ marginBottom: '14px' }}>
                    <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: '4px' }}>
                      Procedimentos Clínicos / Ambulatoriais na APS
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      Curativos, administração de medicamentos, aferição de pressão e glicemia.
                    </p>
                  </div>
                  <ApsProcedimentosChart rows={serieProcedimentos} />
                </div>
              </div>
            )}

            {/* Conteúdo da Aba 3: Programa Mais Acesso (C1) */}
            {activeTab === 'mais_acesso' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ marginBottom: '14px' }}>
                    <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: '4px' }}>
                      Classificação de Desempenho C1 das 21 Equipes eSF (Por Quadrimestre)
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      Distribuição oficial das equipes entre as categorias Ótimo, Bom, Suficiente e Regular no Siaps/MS.
                    </p>
                  </div>
                  <ApsC1Chart rows={serieC1} />
                </div>

                <div style={{ background: 'var(--color-bg-subtle)', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <h5 style={{ fontSize: '0.9rem', color: 'var(--color-primary-dark)', marginBottom: '6px' }}>
                    Resumo do 1º Quadrimestre de 2026 (2026Q1)
                  </h5>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                    No 1º quadrimestre de 2026, todas as <strong>21 equipes de Saúde da Família (eSF)</strong> mantiveram-se credenciadas e aptas ao custeio federal no programa Mais Acesso, distribuídas em: <strong>2 equipes com padrão Ótimo</strong>, <strong>3 equipes Bom</strong>, <strong>13 equipes Suficiente</strong> e <strong>3 equipes Regular</strong>. O 2º quadrimestre de 2026 permanece em apuração administrativa pelo Ministério da Saúde.
                  </p>
                </div>
              </div>
            )}

            {/* Notas Metodológicas e Limitações */}
            <div style={{ marginTop: '32px', background: 'var(--color-bg-subtle)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--color-primary-dark)', fontWeight: 700 }}>
                <Info size={16} />
                <span>Notas Metodológicas e Limitações dos Dados da APS</span>
              </div>
              <ul style={{ paddingLeft: '20px', fontSize: '0.8125rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Os dados de atendimentos e visitas representam <strong>contagem de eventos registrados</strong> e não pessoas únicas atendidas.</li>
                <li>As 21 equipes eSF referem-se às unidades homologadas para custeio federal na competência de referência.</li>
                <li>Fonte primária: Sistema de Informação para a Atenção Primária à Saúde (Siaps) do Ministério da Saúde.</li>
              </ul>
            </div>
          </div>
        }
      />
    </div>
  );
}

