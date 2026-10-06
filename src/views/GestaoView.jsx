import React from 'react';
import { ArrowLeft, Users, Home, Droplets, Trash2, Info } from 'lucide-react';
import KPICard from '../components/KPICard';
import LookerEmbed from '../components/LookerEmbed';
import { FaixasEtariasChart } from '../components/NativeCharts';
import { formatNumber } from '../utils/data-loader';

export default function GestaoView({ data, onRouteChange }) {
  const resumo = data?.resumo || [];
  const dashboard = data?.dashboard || {};
  const queries = dashboard.queries || {};

  const getInd = (id) => resumo.find(i => i.id === id);
  const popTotal = getInd('I01');
  const popJovem = getInd('I02');
  const popIdoso = getInd('I03');

  const faixasRows = queries.populacao_idade_sexo?.rows || [];
  const saneamentoEsgoto = queries.saneamento_esgoto?.rows || [];
  const saneamentoLixo = queries.saneamento_lixo?.rows || [];

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
        <span className="badge-version" style={{ background: '#F3E8FF', color: '#6B46C1', marginBottom: '8px' }}>
          <Users size={13} />
          Eixo Estratégico 4
        </span>
        <h2 style={{ fontSize: '2rem', color: 'var(--color-primary-dark)', marginBottom: '6px' }}>
          Gestão Estratégica, População & Território
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', maxWidth: '820px' }}>
          Caracterização demográfica da população de Unaí a partir do Censo 2022 do IBGE, estrutura etária, 
          condições de saneamento básico e informações territoriais para planejamento em saúde.
        </p>
      </div>

      {/* Cards Demográficos Oficiais */}
      <div className="kpi-grid">
        <KPICard 
          title="População Residente Total"
          value={popTotal ? formatNumber(popTotal.valor) : "86.619"}
          unit="pessoas recenseadas"
          period="Censo 2022"
          source="IBGE, agregado 4714"
          status="Base Censitária"
        />

        <KPICard 
          title="População de 0 a 14 Anos"
          value={popJovem ? `${popJovem.valor}%` : "19,4%"}
          unit="16.803 crianças e jovens"
          period="Censo 2022"
          source="IBGE, agregado 9514"
          status="Demografia Infantil"
        />

        <KPICard 
          title="População de 60 Anos ou Mais"
          value={popIdoso ? `${popIdoso.valor}%` : "14,6%"}
          unit="12.646 pessoas idosas"
          period="Censo 2022"
          source="IBGE, agregado 9514"
          status="Envelhecimento"
        />

        <KPICard 
          title="Código do Município (IBGE)"
          value="3170404"
          unit="Unaí - Minas Gerais"
          period="Oficial"
          source="IBGE"
          status="Identificador Padrão"
        />
      </div>

      {/* Looker Embed com Fallback Nativo */}
      <LookerEmbed 
        reportKey="gestao"
        defaultTitle="Painel Demográfico e Indicadores Municipais · Looker Studio"
        nativeContent={
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '1.15rem', color: 'var(--color-primary-dark)', marginBottom: '6px' }}>
                Distribuição da População por Faixas Etárias (Censo 2022)
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Contagem censitária oficial por intervalos de idade, sem sobreposição de faixas.
              </p>
            </div>

            <FaixasEtariasChart rows={faixasRows} />

            {/* Saneamento Básico */}
            <div style={{ marginTop: '36px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {/* Esgotamento */}
              <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Droplets size={18} color="var(--color-primary)" />
                  <h4 style={{ fontSize: '1rem', color: 'var(--color-primary-dark)' }}>Esgotamento Sanitário (Domicílios)</h4>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem' }}>
                  {saneamentoEsgoto.slice(0, 4).map((r, i) => (
                    <li key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '4px' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>{r.categoria || r.tipo}:</span>
                      <strong style={{ color: 'var(--color-text-main)' }}>{formatNumber(r.valor)}</strong>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Coleta de Lixo */}
              <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Trash2 size={18} color="#0B6B55" />
                  <h4 style={{ fontSize: '1rem', color: 'var(--color-primary-dark)' }}>Destino do Lixo (Domicílios)</h4>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem' }}>
                  {saneamentoLixo.slice(0, 4).map((r, i) => (
                    <li key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '4px' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>{r.categoria || r.tipo}:</span>
                      <strong style={{ color: 'var(--color-text-main)' }}>{formatNumber(r.valor)}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Notas Metodológicas */}
            <div style={{ marginTop: '32px', background: 'var(--color-bg-subtle)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--color-primary-dark)', fontWeight: 700 }}>
                <Info size={16} />
                <span>Notas Metodológicas do Censo Demográfico</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                Os números representam o retrato censitário apurado no Censo 2022 pelo IBGE e não projetam estimativas de 2026. A área territorial municipal simplificada para tela mantém os 8.447 km² oficiais do município.
              </p>
            </div>
          </div>
        }
      />
    </div>
  );
}
