import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import IntroGateAnimation from './components/IntroGateAnimation';
import HomeView from './views/HomeView';
import { loadPortalData } from './utils/data-loader';

const APSView = lazy(() => import('./views/APSView'));
const HospitalarView = lazy(() => import('./views/HospitalarView'));
const VigilanciaView = lazy(() => import('./views/VigilanciaView'));
const GestaoView = lazy(() => import('./views/GestaoView'));
const BuscaSaudeView = lazy(() => import('./views/BuscaSaudeView'));
const FontesView = lazy(() => import('./views/FontesView'));
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
const scrollToStart = () => window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });

class ViewBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <div className="container page" role="alert"><h1>Não foi possível abrir esta seção</h1><p>Atualize a página para carregar a versão disponível do painel.</p><button className="btn-primary" type="button" onClick={() => window.location.reload()}>Atualizar página</button></div> : this.props.children;
  }
}

export default function App() {
  // Controle da animação de abertura (verifica se já foi vista na sessão)
  const [showIntro, setShowIntro] = useState(() => {
    if (reducedMotion()) return false;
    try { return !sessionStorage.getItem('unai_gate_intro_seen'); }
    catch { return false; }
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
      scrollToStart();
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

  useEffect(() => {
    if (!loading && !showIntro) document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [currentRoute, loading, showIntro]);

  const completeIntro = useCallback(() => setShowIntro(false), []);

  const handleRouteChange = (newRoute) => {
    const target = normalizeRoute(newRoute);
    window.location.hash = target;
    setCurrentRoute(target);
    scrollToStart();
  };

  const handleReplayIntro = () => {
    setShowIntro(true);
  };

  // Renderizador da vista atual
  const renderCurrentView = () => {
    if (loadError) {
      return (
        <div className="container page" role="alert">
          <h1>Dados temporariamente indisponíveis</h1>
          <p>Não foi possível carregar os arquivos públicos do painel. Nenhum indicador foi substituído por zero.</p>
          <button className="btn-primary" type="button" onClick={() => setLoadAttempt(attempt => attempt + 1)}>Tentar novamente</button>
        </div>
      );
    }
    if (loading) {
      return (
        <div className="container" role="status" style={{ padding: '80px 24px', textAlign: 'center' }}>
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
      <a href="#main-content" className="skip-link" onClick={event => {
        event.preventDefault();
        const main = document.getElementById('main-content');
        main?.focus({ preventScroll: true });
        if (main) {
          const headerHeight = document.querySelector('.site-header')?.getBoundingClientRect().height || 0;
          window.scrollTo({ top: Math.max(0, main.getBoundingClientRect().top + window.scrollY - headerHeight), behavior: 'auto' });
        }
      }}>Pular para o conteúdo principal</a>

      {/* Animação dos Dois Portões (Unaí & SUS) */}
      {showIntro && (
        <IntroGateAnimation onComplete={completeIntro} />
      )}

      {/* Cabeçalho Institucional Fixo */}
      <Header 
        currentRoute={currentRoute} 
        onRouteChange={handleRouteChange} 
      />

      {/* Área Principal de Conteúdo */}
      <main id="main-content" tabIndex={-1}>
        <ViewBoundary key={currentRoute}>
          <Suspense fallback={<div className="container page" role="status"><div className="spinner" aria-hidden="true" />Carregando a seção…</div>}>
            {renderCurrentView()}
          </Suspense>
        </ViewBoundary>
      </main>

      {/* Rodapé Institucional */}
      <Footer 
        onRouteChange={handleRouteChange} 
        onReplayIntro={handleReplayIntro}
      />
    </div>
  );
}
