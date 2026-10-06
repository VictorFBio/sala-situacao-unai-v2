import React, { useState } from 'react';
import { ArrowLeft, Users, Home, Droplets, Trash2, Info, UserCheck, Layers, MapPin } from 'lucide-react';
import KPICard from '../components/KPICard';
import LookerEmbed from '../components/LookerEmbed';
import { PiramideEtariaChart, CorRacaChart } from '../components/NativeCharts';
import { formatNumber } from '../utils/data-loader';

export default function GestaoView({ data, onRouteChange }) {
  const [activeTab, setActiveTab] = useState('piramide');

  const resumo = data?.resumo || [];
  const dashboard = data?.dashboard || {};
  const queries = dashboard.queries || {};

  const getInd = (id) => resumo.find(i => i.id === id);
  const popTotal = getInd('I01');
  const popJovem = getInd('I02');
  const popIdoso = getInd('I03');

  const faixasRows = queries.populacao_idade_sexo?.rows || [];
  const corRacaRows = (queries.populacao_cor_raca?.rows || []).filter(r => r.ano === 2022);
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
            {/* Seletor de Abas Demográficas */}
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              borderBottom: '2px solid var(--color-border)', 
              marginBottom: '24px',
              paddingBottom: '2px',
              overflowX: 'auto'
            }}>
              <button
                onClick={() => setActiveTab('piramide')}
                style={{
                  padding: '10px 18px',
                  borderRadius: '6px 6px 0 0',
                  border: 'none',
                  background: activeTab === 'piramide' ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === 'piramide' ? '#FFFFFF' : 'var(--color-text-main)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Users size={16} />
                <span>Pirâmide Etária (Censo 2022)</span>
              </button>

              <button
                onClick={() => setActiveTab('cor_raca')}
                style={{
                  padding: '10px 18px',
                  borderRadius: '6px 6px 0 0',
                  border: 'none',
                  background: activeTab === 'cor_raca' ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === 'cor_raca' ? '#FFFFFF' : 'var(--color-text-main)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <UserCheck size={16} />
                <span>Composição por Cor ou Raça</span>
              </button>

              <button
                onClick={() => setActiveTab('saneamento')}
                style={{
                  padding: '10px 18px',
                  borderRadius: '6px 6px 0 0',
                  border: 'none',
                  background: activeTab === 'saneamento' ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === 'saneamento' ? '#FFFFFF' : 'var(--color-text-main)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Droplets size={16} />
                <span>Saneamento & Domicílios</span>
              </button>
            </div>

            {/* Conteúdo Aba 1: Pirâmide Etária */}
            {activeTab === 'piramide' && (
              <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: '4px' }}>
                    Pirâmide Etária da População de Unaí por Sexo (Censo 2022)
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    Distribuição etária oficial: Homens (azul) à esquerda e Mulheres (verde) à direita.
                  </p>
                </div>
                <PiramideEtariaChart rows={faixasRows} />
              </div>
            )}

            {/* Conteúdo Aba 2: Cor ou Raça */}
            {activeTab === 'cor_raca' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px' }}>
                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ marginBottom: '14px' }}>
                    <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: '4px' }}>
                      Distribuição Percentual por Cor ou Raça (Censo 2022)
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      Autodeclaração censitária apurada pelo IBGE no município de Unaí.
                    </p>
                  </div>
                  <CorRacaChart rows={corRacaRows} />
                </div>

                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: '12px' }}>
                    Síntese da População por Cor ou Raça
                  </h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                    {corRacaRows.map((r, i) => (
                      <li key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--color-border-subtle)' }}>
                        <span style={{ color: 'var(--color-text-main)', fontWeight: 500 }}>{r.categoria || r.cor}</span>
                        <div style={{ textAlign: 'right' }}>
                          <strong style={{ color: 'var(--color-primary-dark)' }}>{formatNumber(r.valor)} hab.</strong>
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginLeft: '6px' }}>
                            ({((r.valor / 86619) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div style={{ marginTop: '14px', fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                    Fonte: IBGE, Censo Demográfico 2022, Tabela 9605 (População residente por cor ou raça).
                  </div>
                </div>
              </div>
            )}

            {/* Conteúdo Aba 3: Saneamento */}
            {activeTab === 'saneamento' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                {/* Esgotamento */}
                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Droplets size={18} color="var(--color-primary)" />
                    <h4 style={{ fontSize: '1rem', color: 'var(--color-primary-dark)' }}>Esgotamento Sanitário (Domicílios)</h4>
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem' }}>
                    {saneamentoEsgoto.slice(0, 5).map((r, i) => (
                      <li key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '6px' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>{r.categoria || r.tipo}:</span>
                        <strong style={{ color: 'var(--color-text-main)' }}>{formatNumber(r.valor)} domicílios</strong>
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
                    {saneamentoLixo.slice(0, 5).map((r, i) => (
                      <li key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '6px' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>{r.categoria || r.tipo}:</span>
                        <strong style={{ color: 'var(--color-text-main)' }}>{formatNumber(r.valor)} domicílios</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Notas Metodológicas */}
            <div style={{ marginTop: '32px', background: 'var(--color-bg-subtle)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--color-primary-dark)', fontWeight: 700 }}>
                <Info size={16} />
                <span>Notas Metodológicas do Censo Demográfico</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                Os números representam o retrato censitário apurado no Censo 2022 pelo IBGE e não projetam estimativas de 2026. A área territorial municipal simplificada para tela mantém os 8.447 km² oficiais do município de Unaí.
              </p>
            </div>
          </div>
        }
      />
    </div>
  );
}

