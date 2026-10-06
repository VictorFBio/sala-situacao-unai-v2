import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

export default function IntroGateAnimation({ onComplete }) {
  // Fases da coreografia:
  // 1. 'waiting': fundo azul limpo
  // 2. 'closing': os dois portões deslizam das laterais para o centro
  // 3. 'closed': portões se encostam no meio
  // 4. 'logos_growing': surgem as duas logos (Unaí e SUS) e crescem até o tamanho normal
  // 5. 'pulsing': com as logos no tamanho normal, elas realizam pulsação sincronizada
  // 6. 'opening': abre-se o portão deslizando para fora
  // 7. 'finished': site totalmente visível
  const [phase, setPhase] = useState('waiting');

  useEffect(() => {
    const timerClosing = setTimeout(() => {
      setPhase('closing');
    }, 150);

    const timerClosed = setTimeout(() => {
      setPhase('closed');
    }, 1300);

    const timerLogosGrowing = setTimeout(() => {
      setPhase('logos_growing');
    }, 1550);

    const timerPulsing = setTimeout(() => {
      setPhase('pulsing');
    }, 2650);

    const timerOpening = setTimeout(() => {
      setPhase('opening');
    }, 4000);

    const timerFinished = setTimeout(() => {
      setPhase('finished');
      sessionStorage.setItem('unai_gate_intro_seen', 'true');
      if (onComplete) onComplete();
    }, 5050);

    return () => {
      clearTimeout(timerClosing);
      clearTimeout(timerClosed);
      clearTimeout(timerLogosGrowing);
      clearTimeout(timerPulsing);
      clearTimeout(timerOpening);
      clearTimeout(timerFinished);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setPhase('finished');
    sessionStorage.setItem('unai_gate_intro_seen', 'true');
    if (onComplete) onComplete();
  };

  if (phase === 'finished') return null;

  const showLogos = phase === 'logos_growing' || phase === 'pulsing' || phase === 'opening';
  const isPulsing = phase === 'pulsing';

  return (
    <div 
      className={`intro-gate-overlay phase-${phase}`} 
      role="dialog" 
      aria-modal="true" 
      aria-label="Apresentação institucional dos portões de Unaí e SUS"
    >
      {/* Linha de costura central no momento do encontro */}
      <div className={`gate-center-seam ${(phase === 'closed' || showLogos) ? 'active' : ''}`} />

      {/* Portão Esquerdo (Prefeitura de Unaí) */}
      <div className="gate-door gate-door-left">
        <div className="gate-door-panel">
          <div className="gate-door-trim" />
          <div className="gate-door-rivets" />

          {/* Logo Prefeitura de Unaí */}
          <div className={`gate-logo-container logo-unai ${showLogos ? 'visible' : ''} ${isPulsing ? 'pulsing' : ''}`}>
            <div className="gate-logo-card">
              <img 
                src="./assets/prefeitura-unai-recorte.png" 
                alt="Prefeitura Municipal de Unaí" 
              />
            </div>
            <div className="gate-logo-caption">
              <span>MUNICÍPIO DE UNAÍ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Portão Direito (SUS) */}
      <div className="gate-door gate-door-right">
        <div className="gate-door-panel">
          <div className="gate-door-trim" />
          <div className="gate-door-rivets" />

          {/* Logo SUS */}
          <div className={`gate-logo-container logo-sus ${showLogos ? 'visible' : ''} ${isPulsing ? 'pulsing' : ''}`}>
            <div className="gate-logo-card">
              <img 
                src="./assets/sus-recorte.png" 
                alt="Sistema Único de Saúde (SUS)" 
              />
            </div>
            <div className="gate-logo-caption">
              <span>SISTEMA ÚNICO DE SAÚDE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Faixa Título Institucional */}
      {showLogos && (
        <div className={`gate-title-banner ${isPulsing ? 'glow' : ''}`}>
          <h2>SALA DE SITUAÇÃO DE SAÚDE</h2>
          <p>Secretaria Municipal de Saúde · Unaí - MG</p>
        </div>
      )}

      {/* Botão para pular a qualquer instante */}
      <button 
        type="button"
        className="btn-skip-gate" 
        onClick={handleSkip}
        title="Pular apresentação e acessar os dados imediatamente"
      >
        <span>Pular apresentação</span>
        <ArrowRight size={16} aria-hidden="true" style={{ display: 'inline', marginLeft: 6, verticalAlign: 'middle' }} />
      </button>
    </div>
  );
}
