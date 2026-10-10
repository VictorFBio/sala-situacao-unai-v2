import React from 'react';
import { 
  Home, 
  Activity, 
  Building2, 
  ShieldAlert, 
  Users, 
  MapPin, 
  FileText 
} from 'lucide-react';

export default function Header({ currentRoute, onRouteChange }) {
  const portalBase = import.meta.env.VITE_PORTAL_BASE;
  const navItems = [
    { id: '#/', label: 'Início', icon: Home },
    { id: '#/aps', label: 'Atenção Primária', icon: Activity },
    { id: '#/hospitalar', label: 'Atenção Especializada', icon: Building2 },
    { id: '#/vigilancia', label: 'Vigilância em Saúde', icon: ShieldAlert },
    { id: '#/gestao', label: 'Gestão & População', icon: Users },
    { id: '#/mapa', label: 'Busca Saúde (Mapa)', icon: MapPin },
    { id: '#/fontes', label: 'Fontes', icon: FileText },
  ];

  return (
    <header className="site-header">
      {/* Faixa Superior Institucional */}
      <div className="container">
        <div className="header-top">
          {/* Marcas Oficiais Perfeitamente Alinhadas a 44px */}
          <div className="header-brand">
            <div className="header-logos">
              <a href="#/" onClick={(e) => { e.preventDefault(); onRouteChange('#/'); }} title="Ir para a página inicial">
                <img 
                  src="./assets/prefeitura-unai-recorte.png" 
                  alt="Prefeitura Municipal de Unaí" 
                  className="header-logo"
                  height="44"
                />
              </a>
              
              <div className="header-brand-divider" aria-hidden="true"></div>
              
              <img 
                src="./assets/sus-recorte.png" 
                alt="SUS - Sistema Único de Saúde" 
                className="header-logo"
                height="44"
              />
            </div>
            
            <div className="header-brand-title">
              <strong>{portalBase ? 'Painel de Monitoramento' : 'Sala de Situação de Saúde'}</strong>
              <span>Secretaria Municipal de Saúde · Unaí - MG</span>
            </div>
          </div>

          {/* Ações Institucionais */}
          <div className="header-actions">
            {portalBase && <a href={portalBase} className="btn-ghost">Portal da Sala de Situação</a>}
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
                aria-current={isActive ? 'page' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  onRouteChange(item.id);
                }}
              >
                <Icon size={16} aria-hidden="true" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
