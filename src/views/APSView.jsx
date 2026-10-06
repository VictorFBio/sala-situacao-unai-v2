import React from 'react';
import { ArrowLeft, Activity, Users, Calendar, Info } from 'lucide-react';
import KPICard from '../components/KPICard';
import LookerEmbed from '../components/LookerEmbed';
import { ApsAtendimentosChart } from '../components/NativeCharts';
import { formatNumber } from '../utils/data-loader';

export default function APSView({ data, onRouteChange }) {
  const resumo = data?.resumo || [];
  const dashboard = data?.dashboard || {};
  const queries = dashboard.queries || {};

  const getInd = (id) => resumo.find(i => i.id === id);
  const esf = getInd('I06');
  const c1 = getInd('I07');
  const atendimentos = getInd('I08');
  const visitas = getInd('I09');

  const serieAtendimentos = queries.aps_individuais?.rows || [];

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
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '1.15rem', color: 'var(--color-primary-dark)', marginBottom: '6px' }}>
                Evolução dos Atendimentos Individuais na APS (Série Temporal)
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Série contínua de registros mensais de consultas médicas e de enfermagem na Atenção Primária.
              </p>
            </div>

            <ApsAtendimentosChart rows={serieAtendimentos} />

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
