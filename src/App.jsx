import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import IntroGateAnimation from './components/IntroGateAnimation';
import HomeView from './views/HomeView';
import APSView from './views/APSView';
import HospitalarView from './views/HospitalarView';
import VigilanciaView from './views/VigilanciaView';
import GestaoView from './views/GestaoView';
import BuscaSaudeView from './views/BuscaSaudeView';
import FontesView from './views/FontesView';
import { loadPortalData } from './utils/data-loader';

export default function App() {
  // Controle da animação de abertura (verifica se já foi vista na sessão)
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('unai_gate_intro_seen');
  });

  const normalizeRoute = (hash) => {
    if (!hash || hash === '#' || hash === '#/') return '#/';
    return hash;
  };

  // Roteamento SPA por Hash (compatível com GitHub Pages e servidor estático local)
  const [currentRoute, setCurrentRoute] = useState(() => {
    return normalizeRoute(window.location.hash);
  });

  const [portalData, setPortalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  // Efeito de escuta de mudanças de hash (botões Voltar/Avançar do navegador)
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(normalizeRoute(window.location.hash));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Carregar dados oficiais validados
  useEffect(() => {
    let active = true;
    async function initData() {
      setLoading(true);
      setLoadError(false);
      try {
        const data = await loadPortalData({ force: loadAttempt > 0 });
        if (active) setPortalData(data);
      } catch {
        if (active) setLoadError(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    initData();
    return () => { active = false; };
  }, [loadAttempt]);

  const handleRouteChange = (newRoute) => {
    const target = normalizeRoute(newRoute);
    window.location.hash = target;
    setCurrentRoute(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReplayIntro = () => {
    setShowIntro(true);
  };

  // Renderizador da vista atual
  const renderCurrentView = () => {
    if (loadError) {
      return (
        <div className="container page" id="main-content" tabIndex="-1" role="alert">
          <h1>Dados temporariamente indisponíveis</h1>
          <p>Não foi possível carregar os arquivos públicos do painel. Nenhum indicador foi substituído por zero.</p>
          <button className="btn-primary" type="button" onClick={() => setLoadAttempt(attempt => attempt + 1)}>Tentar novamente</button>
        </div>
      );
    }
    if (loading) {
      return (
        <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
          <div className="spinner" aria-hidden="true"></div>
          <h3 style={{ color: 'var(--blue-dark)', marginBottom: '8px' }}>Carregando dados da Sala de Situação...</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Validando séries agregadas e cartografia municipal de Unaí.</p>
        </div>
      );
    }

    switch (currentRoute) {
      case '#/aps':
        return <APSView data={portalData} onRouteChange={handleRouteChange} />;
      case '#/hospitalar':
        return <HospitalarView data={portalData} onRouteChange={handleRouteChange} />;
      case '#/vigilancia':
        return <VigilanciaView data={portalData} onRouteChange={handleRouteChange} />;
      case '#/gestao':
        return <GestaoView data={portalData} onRouteChange={handleRouteChange} />;
      case '#/mapa':
        return <BuscaSaudeView data={portalData} onRouteChange={handleRouteChange} />;
      case '#/fontes':
        return <FontesView data={portalData} onRouteChange={handleRouteChange} />;
      case '#/':
      default:
        return <HomeView data={portalData} onRouteChange={handleRouteChange} />;
    }
  };

  return (
    <div className="app-root">
      {/* Link de pular direto para o conteúdo acessível */}
      <a href="#main-content" className="skip-link">Pular para o conteúdo principal</a>

      {/* Animação dos Dois Portões (Unaí & SUS) */}
      {showIntro && (
        <IntroGateAnimation onComplete={() => setShowIntro(false)} />
      )}

      {/* Cabeçalho Institucional Fixo */}
      <Header 
        currentRoute={currentRoute} 
        onRouteChange={handleRouteChange} 
      />

      {/* Área Principal de Conteúdo */}
      <main id="main-content" tabIndex={-1}>
        {renderCurrentView()}
      </main>

      {/* Rodapé Institucional */}
      <Footer 
        onRouteChange={handleRouteChange} 
        onReplayIntro={handleReplayIntro}
      />
    </div>
  );
}
