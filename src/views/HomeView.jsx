import React from 'react';
import { 
  Activity, 
  Building2, 
  ShieldAlert, 
  Users, 
  ArrowRight, 
  MapPin, 
  FileText 
} from 'lucide-react';
import { KPICard } from '../components/ui';
import { formatNumber, findIndicator } from '../utils/data-loader';

export default function HomeView({ data, onRouteChange }) {
  const resumo = data?.resumo || [];

  const pmuPopulacao = findIndicator(resumo, 'I01');
  const cnesTotal = findIndicator(resumo, 'I04');
  const esfTotal = findIndicator(resumo, 'I06');
  const atendimentosAps = findIndicator(resumo, 'I08');

  return (
    <div>
      {/* Hero Institucional */}
      <section className="hero">
        <div className="container">
          <div className="hero-inner">
            <span className="eyebrow">
              Secretaria Municipal de Saúde de Unaí
            </span>

            <h1>
              Sala de Situação de Saúde de Unaí
            </h1>

            <p>
              Portal oficial de inteligência epidemiológica, séries históricas, produção assistencial e cartografia da rede municipal de saúde com base em dados públicos auditados do SUS e IBGE.
            </p>

            <div className="hero-actions">
              <button 
                type="button"
                className="btn btn-primary"
                onClick={() => onRouteChange('#/mapa')}
              >
                <MapPin size={17} aria-hidden="true" />
                <span>Localizar Serviços no Mapa</span>
              </button>

              <button 
                type="button"
                className="btn btn-outline"
                onClick={() => onRouteChange('#/fontes')}
              >
                <FileText size={17} aria-hidden="true" />
                <span>Consultar Fontes Oficiais</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Panorama dos Indicadores Síntese (KPIs) */}
      <div className="container page" style={{ paddingBottom: 0 }}>
        <div className="kpi-grid">
          <KPICard 
            title="População Residente Oficial"
            value={pmuPopulacao ? formatNumber(pmuPopulacao.valor) : "86.619"}
            unit="pessoas recenseadas"
            period="Censo 2022"
            source="IBGE SIDRA 4714"
          />

          <KPICard 
            title="Estabelecimentos Cadastrados no CNES"
            value={cnesTotal ? formatNumber(cnesTotal.valor) : "288"}
            unit="estabelecimentos ativos"
            period="29/09/2026"
            source="CNES / DataSUS"
          />

          <KPICard 
            title="Equipes de Saúde da Família (eSF)"
            value={esfTotal ? `${esfTotal.valor} equipes` : "21 equipes"}
            unit="válidas para custeio federal"
            period="1º quadrimestre 2026"
            source="Siaps / MS"
          />

          <KPICard 
            title="Atendimentos Mensais na APS"
            value={atendimentosAps ? formatNumber(atendimentosAps.valor) : "16.366"}
            unit="consultas individuais no mês"
            period="07/2026"
            source="Siaps / APS"
          />
        </div>
      </div>

      {/* Os 4 Grandes Eixos Estratégicos */}
      <section style={{ padding: '24px 0 40px' }}>
        <div className="container">
          <header className="page-header" style={{ marginBottom: '24px' }}>
            <span className="eyebrow">Navegação Temática</span>
            <h2>Eixos Estratégicos de Saúde Pública</h2>
            <p>Selecione um dos grandes pilares para explorar painéis detalhados, séries temporais e downloads de dados:</p>
          </header>

          <div className="eixos-grid">
            {/* Eixo 1: Atenção Primária */}
            <a 
              href="#/aps"
              className="eixo-card" 
              style={{ '--eixo': '#0B6B55' }}
              onClick={(e) => { e.preventDefault(); onRouteChange('#/aps'); }}
            >
              <span className="eixo-num">
                <Activity size={14} aria-hidden="true" />
                Eixo 1
              </span>
              <h3>Atenção Primária</h3>
              <p>
                Desempenho das 21 equipes de Saúde da Família, programa Mais Acesso (C1), atendimentos individuais médicos e de enfermagem e visitas domiciliares de ACS.
              </p>
              <div className="eixo-stats">
                <div>
                  <span>Equipes eSF Válidas:</span>
                  <strong>21 equipes</strong>
                </div>
                <div>
                  <span>Visitas ACS / mês:</span>
                  <strong>36.431 visitas</strong>
                </div>
              </div>
              <span className="eixo-cta">
                Acessar Painel da APS
                <ArrowRight size={15} aria-hidden="true" />
              </span>
            </a>

            {/* Eixo 2: Atenção Especializada & Hospitalar */}
            <a 
              href="#/hospitalar"
              className="eixo-card" 
              style={{ '--eixo': '#08588E' }}
              onClick={(e) => { e.preventDefault(); onRouteChange('#/hospitalar'); }}
            >
              <span className="eixo-num">
                <Building2 size={14} aria-hidden="true" />
                Eixo 2
              </span>
              <h3>Atenção Especializada</h3>
              <p>
                Cadastro Nacional de Estabelecimentos (CNES), vínculo da rede com o SUS, internações hospitalares (SIH/SUS), especialidades e média de permanência.
              </p>
              <div className="eixo-stats">
                <div>
                  <span>Estabelecimentos CNES:</span>
                  <strong>288 locais</strong>
                </div>
                <div>
                  <span>Unidades Básicas:</span>
                  <strong>20 postos/centros</strong>
                </div>
              </div>
              <span className="eixo-cta">
                Acessar Painel Hospitalar
                <ArrowRight size={15} aria-hidden="true" />
              </span>
            </a>

            {/* Eixo 3: Vigilância em Saúde */}
            <a 
              href="#/vigilancia"
              className="eixo-card" 
              style={{ '--eixo': '#C05621' }}
              onClick={(e) => { e.preventDefault(); onRouteChange('#/vigilancia'); }}
            >
              <span className="eixo-num">
                <ShieldAlert size={14} aria-hidden="true" />
                Eixo 3
              </span>
              <h3>Vigilância em Saúde</h3>
              <p>
                Monitoramento de arboviroses (Dengue), internações por SRAG (SIVEP-Gripe), nascidos vivos (SINASC 2015–2026), pré-natal e mortalidade por causas básicas (SIM).
              </p>
              <div className="eixo-stats">
                <div>
                  <span>Série Histórica:</span>
                  <strong>2015 – 2026</strong>
                </div>
                <div>
                  <span>Cobertura Vacinal:</span>
                  <strong>Dados PNI 2025</strong>
                </div>
              </div>
              <span className="eixo-cta">
                Acessar Painel de Vigilância
                <ArrowRight size={15} aria-hidden="true" />
              </span>
            </a>

            {/* Eixo 4: Gestão Estratégica & População */}
            <a 
              href="#/gestao"
              className="eixo-card" 
              style={{ '--eixo': '#6B46C1' }}
              onClick={(e) => { e.preventDefault(); onRouteChange('#/gestao'); }}
            >
              <span className="eixo-num">
                <Users size={14} aria-hidden="true" />
                Eixo 4
              </span>
              <h3>Gestão & População</h3>
              <p>
                Demografia e pirâmide etária do Censo 2022, distribuição por cor ou raça, condições de saneamento básico (esgotamento e lixo) e métricas territoriais.
              </p>
              <div className="eixo-stats">
                <div>
                  <span>Crianças (0-14 anos):</span>
                  <strong>19,4% da população</strong>
                </div>
                <div>
                  <span>Idosos (60+ anos):</span>
                  <strong>14,6% da população</strong>
                </div>
              </div>
              <span className="eixo-cta">
                Acessar Painel Demográfico
                <ArrowRight size={15} aria-hidden="true" />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Destaque para o Módulo Busca Saúde (Mapa) */}
      <section className="cta-band">
        <div className="container">
          <div>
            <h2>Busca Saúde: Onde encontrar atendimento em Unaí?</h2>
            <p>
              Consulte no mapa interativo com imagens orbitais de satélite Sentinel-2 as 18 Unidades Básicas de Saúde (UBS/ESF) e os 14 serviços complementares de saúde do município, com busca por bairro e endereços oficiais.
            </p>
          </div>

          <button 
            type="button"
            className="btn btn-primary"
            onClick={() => onRouteChange('#/mapa')}
          >
            <MapPin size={18} aria-hidden="true" />
            <span>Abrir Mapa de Serviços</span>
          </button>
        </div>
      </section>
    </div>
  );
}
