import React from 'react';
import { ArrowLeft, Building2, Bed, Activity, Info } from 'lucide-react';
import KPICard from '../components/KPICard';
import LookerEmbed from '../components/LookerEmbed';
import { InternacoesEspecialidadeChart } from '../components/NativeCharts';
import { formatNumber } from '../utils/data-loader';

export default function HospitalarView({ data, onRouteChange }) {
  const resumo = data?.resumo || [];
  const dashboard = data?.dashboard || {};
  const queries = dashboard.queries || {};

  const getInd = (id) => resumo.find(i => i.id === id);
  const cnesTotal = getInd('I04');
  const cnesTipo02 = getInd('I05');

  const internacoes = queries.sih_internacoes?.rows || [];
  const redeTipos = queries.rede_tipos?.rows || [];

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
          value="Série SIH"
          unit="Autorizações de Internação (AIH)"
          period="2020 – 2026"
          source="SIH / SUS"
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
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '1.15rem', color: 'var(--color-primary-dark)', marginBottom: '6px' }}>
                Internações Hospitalares no SUS por Especialidade
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Distribuição de internações faturadas no Sistema de Informações Hospitalares do SUS.
              </p>
            </div>

            <InternacoesEspecialidadeChart rows={internacoes} />

            {/* Tabela de Tipos de Estabelecimentos CNES */}
            {redeTipos.length > 0 && (
              <div style={{ marginTop: '36px' }}>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: '12px' }}>
                  Composição da Rede por Tipo de Estabelecimento (CNES)
                </h4>
                <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                    <thead style={{ background: 'var(--color-bg-subtle)', position: 'sticky', top: 0 }}>
                      <tr>
                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>Tipo de Estabelecimento</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total de Unidades</th>
                      </tr>
                    </thead>
                    <tbody>
                      {redeTipos.map((r, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                          <td style={{ padding: '8px 12px' }}>{r.tipo || r.categoria}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>{formatNumber(r.valor)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
