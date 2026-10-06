import React from 'react';
import { 
  Activity, 
  Building2, 
  ShieldAlert, 
  Users, 
  ArrowRight, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  TrendingUp,
  Sparkles
} from 'lucide-react';
import KPICard from '../components/KPICard';
import { formatNumber } from '../utils/data-loader';

export default function HomeView({ data, onRouteChange }) {
  const resumo = data?.resumo || [];
  const getInd = (id) => resumo.find(i => i.id === id);

  const pmuPopulacao = getInd('I01');
  const cnesTotal = getInd('I04');
  const esfTotal = getInd('I06');
  const atendimentosAps = getInd('I08');

  return (
    <div>
      {/* Hero Institucional */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <span className="hero-tag">
              <Sparkles size={14} />
              Portal de Inteligência e Gestão Estratégica
            </span>

            <h1 className="hero-title">
              Sala de Situação de Saúde de Unaí
            </h1>

            <p className="hero-subtitle">
              Acesso público a indicadores agregados, séries históricas, vigilância epidemiológica, 
              localização geográfica dos serviços e relatórios interativos integrados.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                className="nav-link active" 
                style={{ padding: '10px 22px', fontSize: '0.95rem' }}
                onClick={() => onRouteChange('#/mapa')}
              >
                <MapPin size={18} />
                <span>Localizar Unidades no Mapa (Busca Saúde)</span>
              </button>

              <button 
                className="nav-link" 
                style={{ padding: '10px 22px', fontSize: '0.95rem', background: '#FFFFFF', border: '1px solid var(--color-border)' }}
                onClick={() => onRouteChange('#/fontes')}
              >
                <FileText size={18} />
                <span>Catálogo Técnico de Fontes</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Panorama dos Indicadores Síntese (KPIs) */}
      <div className="container" style={{ marginTop: '32px' }}>
        <div className="kpi-grid">
          <KPICard 
            title="População Residente Oficial"
            value={pmuPopulacao ? formatNumber(pmuPopulacao.valor) : "86.619"}
            unit="pessoas (Censo 2022)"
            period="2022"
            source="IBGE SIDRA 4714"
            status="Censo IBGE"
          />

          <KPICard 
            title="Estabelecimentos de Saúde Ativos"
            value={cnesTotal ? formatNumber(cnesTotal.valor) : "288"}
            unit="estabelecimentos cadastrados"
            period="29/09/2026"
            source="CNES / DataSUS"
            status="Públicos e Privados"
          />

          <KPICard 
            title="Equipes de Saúde da Família (eSF)"
            value={esfTotal ? formatNumber(esfTotal.valor) : "21"}
            unit="equipes válidas para custeio"
            period="1º quadrimestre 2026"
            source="Siaps / MS"
            status="100% C1 Mais Acesso"
          />

          <KPICard 
            title="Atendimentos Mensais na APS"
            value={atendimentosAps ? formatNumber(atendimentosAps.valor) : "16.366"}
            unit="registros individuais no mês"
            period="07/2026"
            source="Siaps / APS"
            status="Atenção Básica"
          />
        </div>
      </div>

      {/* Os 4 Grandes Eixos Estratégicos (Inspirado no InfoSaúde DF) */}
      <section className="eixos-section">
        <div className="container">
          <div className="section-header">
            <h2>Eixos Estratégicos de Saúde Pública</h2>
            <p>Selecione um dos grandes pilares para explorar painéis detalhados, séries temporais e relatórios interativos:</p>
          </div>

          <div className="eixos-grid">
            {/* Eixo 1: Atenção Primária */}
            <div 
              className="eixo-card" 
              onClick={() => onRouteChange('#/aps')}
              style={{ cursor: 'pointer' }}
              role="button"
              tabIndex={0}
            >
              <span className="eixo-card-badge">Eixo 1</span>
              
              <div className="eixo-icon-box icon-aps">
                <Activity size={30} />
              </div>

              <h3 className="eixo-card-title">Atenção Primária</h3>
              
              <p className="eixo-card-desc">
                Desempenho das 21 equipes de Saúde da Família, programa Mais Acesso à APS (C1), 
                atendimentos individuais médicos e de enfermagem e visitas domiciliares de ACS.
              </p>

              <div className="eixo-stats-preview">
                <div className="eixo-stat-row">
                  <span className="eixo-stat-label">Equipes eSF Válidas:</span>
                  <span className="eixo-stat-val">21 equipes</span>
                </div>
                <div className="eixo-stat-row">
                  <span className="eixo-stat-label">Visitas Domiciliares:</span>
                  <span className="eixo-stat-val">36.431 / mês</span>
                </div>
              </div>

              <span className="eixo-card-cta">
                <span>Acessar Painel da APS</span>
                <ArrowRight size={16} />
              </span>
            </div>

            {/* Eixo 2: Atenção Especializada & Hospitalar */}
            <div 
              className="eixo-card" 
              onClick={() => onRouteChange('#/hospitalar')}
              style={{ cursor: 'pointer' }}
              role="button"
              tabIndex={0}
            >
              <span className="eixo-card-badge">Eixo 2</span>
              
              <div className="eixo-icon-box icon-esp">
                <Building2 size={30} />
              </div>

              <h3 className="eixo-card-title">Atenção Especializada</h3>
              
              <p className="eixo-card-desc">
                Cadastro Nacional de Estabelecimentos (CNES), perfil da rede conveniada ao SUS, 
                internações hospitalares (SIH/SUS) por especialidade, custos e média de permanência.
              </p>

              <div className="eixo-stats-preview">
                <div className="eixo-stat-row">
                  <span className="eixo-stat-label">Estabelecimentos:</span>
                  <span className="eixo-stat-val">288 no CNES</span>
                </div>
                <div className="eixo-stat-row">
                  <span className="eixo-stat-label">Unidades Tipo 02:</span>
                  <span className="eixo-stat-val">20 UBS</span>
                </div>
              </div>

              <span className="eixo-card-cta">
                <span>Acessar Painel Hospitalar</span>
                <ArrowRight size={16} />
              </span>
            </div>

            {/* Eixo 3: Vigilância em Saúde */}
            <div 
              className="eixo-card" 
              onClick={() => onRouteChange('#/vigilancia')}
              style={{ cursor: 'pointer' }}
              role="button"
              tabIndex={0}
            >
              <span className="eixo-card-badge">Eixo 3</span>
              
              <div className="eixo-icon-box icon-vig">
                <ShieldAlert size={30} />
              </div>

              <h3 className="eixo-card-title">Vigilância em Saúde</h3>
              
              <p className="eixo-card-desc">
                Monitoramento contínuo de arboviroses (Dengue e Chikungunya), Síndromes Respiratórias (SRAG), 
                nascimentos (SINASC 2015–2026) e mortalidade por causas básicas (SIM).
              </p>

              <div className="eixo-stats-preview">
                <div className="eixo-stat-row">
                  <span className="eixo-stat-label">Arboviroses:</span>
                  <span className="eixo-stat-val">InfoDengue semanal</span>
                </div>
                <div className="eixo-stat-row">
                  <span className="eixo-stat-label">Vitais Consolidados:</span>
                  <span className="eixo-stat-val">2015 – 2026</span>
                </div>
              </div>

              <span className="eixo-card-cta">
                <span>Acessar Painel de Vigilância</span>
                <ArrowRight size={16} />
              </span>
            </div>

            {/* Eixo 4: Gestão Estratégica & População */}
            <div 
              className="eixo-card" 
              onClick={() => onRouteChange('#/gestao')}
              style={{ cursor: 'pointer' }}
              role="button"
              tabIndex={0}
            >
              <span className="eixo-card-badge">Eixo 4</span>
              
              <div className="eixo-icon-box icon-ges">
                <Users size={30} />
              </div>

              <h3 className="eixo-card-title">Gestão & População</h3>
              
              <p className="eixo-card-desc">
                Demografia e pirâmide etária do Censo 2022, distribuição territorial, 
                saneamento básico (esgotamento e lixo), densidade demográfica e metadados.
              </p>

              <div className="eixo-stats-preview">
                <div className="eixo-stat-row">
                  <span className="eixo-stat-label">Crianças (0-14 anos):</span>
                  <span className="eixo-stat-val">19,4% da pop.</span>
                </div>
                <div className="eixo-stat-row">
                  <span className="eixo-stat-label">Idosos (60+ anos):</span>
                  <span className="eixo-stat-val">14,6% da pop.</span>
                </div>
              </div>

              <span className="eixo-card-cta">
                <span>Acessar Painel Demográfico</span>
                <ArrowRight size={16} />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Destaque para o Módulo Busca Saúde (Mapa) */}
      <section style={{ background: '#FFFFFF', padding: '48px 0', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap' }}>
            <div style={{ maxWidth: '640px' }}>
              <span className="badge-version" style={{ marginBottom: '12px' }}>
                <MapPin size={13} />
                Módulo Georreferenciado
              </span>
              <h2 style={{ fontSize: '1.65rem', color: 'var(--color-primary-dark)', marginBottom: '8px' }}>
                Busca Saúde: Onde encontrar atendimento em Unaí?
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                Consulte no mapa interativo as 18 Unidades Básicas de Saúde (UBS/ESF) e os 14 serviços complementares de saúde do município, com busca por bairro e endereços completos.
              </p>
            </div>

            <button 
              className="nav-link active"
              style={{ padding: '12px 28px', fontSize: '1rem', borderRadius: 'var(--radius-md)' }}
              onClick={() => onRouteChange('#/mapa')}
            >
              <MapPin size={20} />
              <span>Abrir Mapa de Serviços</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
