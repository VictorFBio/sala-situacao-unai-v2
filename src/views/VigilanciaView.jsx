import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ShieldAlert, 
  Baby, 
  Skull, 
  Bug, 
  AlertTriangle, 
  Info, 
  Syringe, 
  HeartHandshake,
  Calendar
} from 'lucide-react';
import KPICard from '../components/KPICard';
import LookerEmbed from '../components/LookerEmbed';
import { 
  NascimentosChart, 
  SinascPrenatalChart, 
  CausasMorteChart, 
  SimIdadeChart, 
  DengueChart, 
  SragChart, 
  ImunizacaoChart 
} from '../components/NativeCharts';
import { formatNumber } from '../utils/data-loader';

export default function VigilanciaView({ data, onRouteChange }) {
  const [activeTab, setActiveTab] = useState('nascimentos');

  const dashboard = data?.dashboard || {};
  const queries = dashboard.queries || {};

  const nascimentos = queries.nascimentos_anuais?.rows || [];
  const prenatal = queries.sinasc_prenatal?.rows || [];
  const causasMorte = queries.sim_causas?.rows || [];
  const simIdade = queries.sim_idade?.rows || [];
  const dengueAnual = queries.arboviroses_anual?.rows || [];
  const sragSivep = queries.srag_sivep?.rows || [];
  const imunizacao = queries.imunizacao_2025?.rows || [];

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
        <span className="badge-version" style={{ background: '#FEF3E8', color: '#C05621', marginBottom: '8px' }}>
          <ShieldAlert size={13} />
          Eixo Estratégico 3
        </span>
        <h2 style={{ fontSize: '2rem', color: 'var(--color-primary-dark)', marginBottom: '6px' }}>
          Vigilância em Saúde & Eventos Vitais
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', maxWidth: '820px' }}>
          Séries históricas de nascidos vivos (SINASC), perfil de mortalidade (SIM), monitoramento de arboviroses 
          (Dengue), internações por SRAG (SIVEP-Gripe) e cobertura vacinal oficial de 2025.
        </p>
      </div>

      {/* Cards Síntese de Vigilância */}
      <div className="kpi-grid">
        <KPICard 
          title="Série de Nascimentos (SINASC)"
          value="2015 – 2026"
          unit="dados agregados oficiais"
          period="Atualizado em 05/10/2026"
          source="SINASC / Sede"
          status="Consolidado e Parcial"
        />

        <KPICard 
          title="Série de Mortalidade (SIM)"
          value="2015 – 2026"
          unit="óbitos e causas básicas"
          period="Atualizado em 05/10/2026"
          source="SIM / Sede"
          status="Por Capítulos CID-10"
        />

        <KPICard 
          title="Monitoramento de Arboviroses"
          value="Série InfoDengue"
          unit="notificações de casos prováveis"
          period="2015 – 2026"
          source="InfoDengue / SINAN"
          status="Boletim Epidemiológico"
        />

        <KPICard 
          title="Vigilância de SRAG"
          value="SIVEP-Gripe"
          unit="internações por síndromes gripais"
          period="2020 – 2026"
          source="SIVEP-Gripe / MS"
          status="Monitoramento Ativo"
        />
      </div>

      {/* Looker Embed com Fallback Nativo */}
      <LookerEmbed 
        reportKey="vigilancia"
        defaultTitle="Painel de Vigilância Epidemiológica e Vitais · Looker Studio"
        nativeContent={
          <div>
            {/* Seletor de Abas de Vigilância */}
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              borderBottom: '2px solid var(--color-border)', 
              marginBottom: '24px',
              paddingBottom: '2px',
              overflowX: 'auto'
            }}>
              <button
                onClick={() => setActiveTab('nascimentos')}
                style={{
                  padding: '10px 16px',
                  borderRadius: '6px 6px 0 0',
                  border: 'none',
                  background: activeTab === 'nascimentos' ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === 'nascimentos' ? '#FFFFFF' : 'var(--color-text-main)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <Baby size={15} />
                <span>Nascimentos & Pré-Natal</span>
              </button>

              <button
                onClick={() => setActiveTab('mortalidade')}
                style={{
                  padding: '10px 16px',
                  borderRadius: '6px 6px 0 0',
                  border: 'none',
                  background: activeTab === 'mortalidade' ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === 'mortalidade' ? '#FFFFFF' : 'var(--color-text-main)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <Skull size={15} />
                <span>Mortalidade Geral (SIM)</span>
              </button>

              <button
                onClick={() => setActiveTab('arboviroses')}
                style={{
                  padding: '10px 16px',
                  borderRadius: '6px 6px 0 0',
                  border: 'none',
                  background: activeTab === 'arboviroses' ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === 'arboviroses' ? '#FFFFFF' : 'var(--color-text-main)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <Bug size={15} />
                <span>Arboviroses & SRAG</span>
              </button>

              <button
                onClick={() => setActiveTab('imunizacao')}
                style={{
                  padding: '10px 16px',
                  borderRadius: '6px 6px 0 0',
                  border: 'none',
                  background: activeTab === 'imunizacao' ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === 'imunizacao' ? '#FFFFFF' : 'var(--color-text-main)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <Syringe size={15} />
                <span>Cobertura Vacinal (2025)</span>
              </button>
            </div>

            {/* Conteúdo Aba 1: Nascimentos & Pré-Natal */}
            {activeTab === 'nascimentos' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '28px' }}>
                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ marginBottom: '14px' }}>
                    <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: '4px' }}>
                      Nascidos Vivos Anuais (SINASC 2015–2026)
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      Total anual de nascidos vivos registrados em Unaí. 2025 observado e 2026 parcial.
                    </p>
                  </div>
                  <NascimentosChart rows={nascimentos} />
                </div>

                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ marginBottom: '14px' }}>
                    <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: '4px' }}>
                      Adequação das Consultas de Pré-Natal (Últimos Anos)
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      Proporção de gestantes com 7 ou mais consultas (meta ideal), 4 a 6 e menos de 4.
                    </p>
                  </div>
                  <SinascPrenatalChart rows={prenatal} />
                </div>
              </div>
            )}

            {/* Conteúdo Aba 2: Mortalidade (SIM) */}
            {activeTab === 'mortalidade' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '28px' }}>
                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ marginBottom: '14px' }}>
                    <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: '4px' }}>
                      Principais Causas de Óbito (Capítulos CID-10)
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      Doenças do aparelho circulatório, neoplasias, causas externas e aparelho respiratório.
                    </p>
                  </div>
                  <CausasMorteChart rows={causasMorte} />
                </div>

                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ marginBottom: '14px' }}>
                    <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: '4px' }}>
                      Distribuição de Óbitos por Faixa Etária
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      Concentração de mortalidade por faixas etárias apuradas no SIM.
                    </p>
                  </div>
                  <SimIdadeChart rows={simIdade} />
                </div>
              </div>
            )}

            {/* Conteúdo Aba 3: Arboviroses & SRAG */}
            {activeTab === 'arboviroses' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '28px' }}>
                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ marginBottom: '14px' }}>
                    <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: '4px' }}>
                      Histórico de Notificações de Dengue (InfoDengue / SINAN)
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      Casos prováveis de arbovirose notificados no município de 2015 a 2026.
                    </p>
                  </div>
                  <DengueChart rows={dengueAnual} />
                </div>

                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ marginBottom: '14px' }}>
                    <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: '4px' }}>
                      Vigilância de Síndromes Respiratórias Agudas Graves (SIVEP-Gripe)
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      Hospitalizações e óbitos por SRAG registrados por semana epidemiológica.
                    </p>
                  </div>
                  <SragChart rows={sragSivep} />
                </div>
              </div>
            )}

            {/* Conteúdo Aba 4: Imunização */}
            {activeTab === 'imunizacao' && (
              <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: '4px' }}>
                    Cobertura Vacinal por Imunobiológico (Ano 2025 — SES-MG / PNI)
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    Percentual de cobertura alcançado em Unaí comparado à meta preconizada pelo Ministério da Saúde (95%).
                  </p>
                </div>
                <ImunizacaoChart rows={imunizacao} />
                <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '0.8125rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: 12, height: 12, borderRadius: 2, background: '#0B6B55', display: 'inline-block' }}></span>
                    Adequado (≥ 95% da meta)
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: 12, height: 12, borderRadius: 2, background: '#D69E2E', display: 'inline-block' }}></span>
                    Atenção (80% a 94%)
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: 12, height: 12, borderRadius: 2, background: '#C05621', display: 'inline-block' }}></span>
                    Crítico (&lt; 80%)
                  </span>
                </div>
              </div>
            )}

            {/* Notas Metodológicas de Vitais */}
            <div style={{ marginTop: '32px', background: 'var(--color-bg-subtle)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--color-primary-dark)', fontWeight: 700 }}>
                <Info size={16} />
                <span>Atualização Oficial de SINASC e SIM (05/10/2026)</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                Os dados de 2015 a 2024 representam séries históricas consolidadas. Em 05/10/2026, foram incorporadas atualizações oficiais recebidas da sede municipal de Unaí: o ano de 2025 é apresentado como ano-calendário observado e 2026 como período parcial até a data de corte. A ausência de encerramento administrativo é explicitada como período em aberto, nunca como valor definitivo.
              </p>
            </div>
          </div>
        }
      />
    </div>
  );
}

