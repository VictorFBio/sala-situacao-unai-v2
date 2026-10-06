import React from 'react';
import { 
  Play, 
  Home, 
  Activity, 
  Building2, 
  ShieldAlert, 
  Users, 
  MapPin, 
  FileText 
} from 'lucide-react';

export default function Header({ currentRoute, onRouteChange, onReplayIntro }) {
  const navItems = [
    { id: '#/', label: 'Início', icon: Home },
    { id: '#/aps', label: 'Atenção Primária', icon: Activity },
    { id: '#/hospitalar', label: 'Atenção Especializada', icon: Building2 },
    { id: '#/vigilancia', label: 'Vigilância em Saúde', icon: ShieldAlert },
    { id: '#/gestao', label: 'Gestão & População', icon: Users },
    { id: '#/mapa', label: 'Busca Saúde (Mapa)', icon: MapPin },
    { id: '#/fontes', label: 'Fontes & Metadados', icon: FileText },
  ];

  return (
    <header className="site-header">
      {/* Faixa Superior Institucional */}
      <div className="container">
        <div className="header-top">
          {/* Marcas Oficiais */}
          <div className="header-brand">
            <a href="#/" onClick={(e) => { e.preventDefault(); onRouteChange('#/'); }}>
              <img 
                src="./assets/prefeitura-unai.png" 
                alt="Prefeitura Municipal de Unaí" 
                className="header-logo-pmu"
              />
            </a>
            
            <div className="header-brand-divider" aria-hidden="true"></div>
            
            <img 
              src="./assets/sus-positivo.png" 
              alt="SUS - Sistema Único de Saúde" 
              className="header-logo-sus"
            />
            
            <div className="header-brand-title">
              <h1>Sala de Situação de Saúde</h1>
              <span>Secretaria Municipal de Saúde · Unaí - MG</span>
            </div>
          </div>

          {/* Ações e Status */}
          <div className="header-actions">
            <span className="badge-version" title="Versão 2 Experimental">
              <span className="badge-status-dot"></span>
              V2 · Experimento
            </span>

            <button 
              className="btn-header-rever"
              onClick={onReplayIntro}
              title="Rever a animação dos portões de abertura"
            >
              <Play size={13} />
              <span>Rever Abertura</span>
            </button>
          </div>
        </div>

        {/* Menu de Navegação Horizontal */}
        <nav className="header-nav" aria-label="Navegação Principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <a
                key={item.id}
                href={item.id}
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  onRouteChange(item.id);
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>

      {/* Faixa de Transparência / Prévia Técnica Local */}
      <div className="banner-previa-local">
        <div className="container">
          <div className="banner-previa-inner">
            <div className="banner-previa-text">
              <strong>Aviso de Transparência:</strong>
              <span>Prévia técnica local da V2 com dados públicos agregados oficiais. Não substitui os sistemas e boletins epidemiológicos oficiais.</span>
            </div>
            <div>
              <span>Referência: <strong>05/10/2026</strong></span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
