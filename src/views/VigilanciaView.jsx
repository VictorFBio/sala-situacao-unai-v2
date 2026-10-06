import React, { useState } from 'react';
import { ArrowLeft, ShieldAlert, Baby, Skull, Bug, AlertTriangle, Info } from 'lucide-react';
import KPICard from '../components/KPICard';
import LookerEmbed from '../components/LookerEmbed';
import { NascimentosChart, CausasMorteChart, DengueChart } from '../components/NativeCharts';
import { formatNumber } from '../utils/data-loader';

export default function VigilanciaView({ data, onRouteChange }) {
  const dashboard = data?.dashboard || {};
  const queries = dashboard.queries || {};

  const nascimentos = queries.nascimentos_anuais?.rows || [];
  const causasMorte = queries.sim_causas?.rows || [];
  const dengueAnual = queries.arboviroses_anual?.rows || [];

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
          (Dengue) e internações por Síndromes Respiratórias Agudas Graves (SRAG/SIVEP-Gripe).
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', marginBottom: '32px' }}>
              {/* Nascimentos */}
              <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Baby size={18} color="var(--color-primary)" />
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)' }}>
                    Nascidos Vivos Anuais (SINASC 2015–2026)
                  </h4>
                </div>
                <NascimentosChart rows={nascimentos} />
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '8px' }}>
                  *2025 observado e 2026 parcial até o último arquivo oficial recebido da sede em 05/10/2026.
                </p>
              </div>

              {/* Mortalidade por Causas */}
              <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Skull size={18} color="#C05621" />
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)' }}>
                    Principais Causas de Óbito (Capítulos CID-10)
                  </h4>
                </div>
                <CausasMorteChart rows={causasMorte} />
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '8px' }}>
                  Aparelho circulatório, neoplasias, causas externas e aparelho respiratório compõem as maiores causas.
                </p>
              </div>
            </div>

            {/* Dengue */}
            <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Bug size={18} color="#C05621" />
                <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)' }}>
                  Histórico de Notificações de Dengue (InfoDengue / SINAN)
                </h4>
              </div>
              <DengueChart rows={dengueAnual} />
            </div>

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
