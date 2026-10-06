import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

export default function IntroGateAnimation({ onComplete }) {
  // Fases da coreografia:
  // 1. 'waiting': início com tela azul suave
  // 2. 'closing': os dois portões deslizam das laterais para o centro (0ms -> 750ms)
  // 3. 'closed': portões se encostam no meio
  // 4. 'logos': surgem as duas logos (Unaí e SUS) e o título central (750ms -> 1500ms)
  // 5. 'pulsing': as logos realizam pulsação harmônica (1500ms -> 2700ms)
  // 6. 'opening': abrem-se as portas deslizando para as laterais, revelando o site (2700ms -> 3550ms)
  // 7. 'finished': animação encerrada (3600ms)
  const [phase, setPhase] = useState('closing');

  useEffect(() => {
    // 750ms: Portas se encontram no meio
    const timerClosed = setTimeout(() => {
      setPhase('closed');
    }, 750);

    // 850ms: Logos e título surgem em tamanho normal
    const timerLogos = setTimeout(() => {
      setPhase('logos');
    }, 850);

    // 1550ms: Logos pulsam sincronizadas
    const timerPulsing = setTimeout(() => {
      setPhase('pulsing');
    }, 1550);

    // 2750ms: Abrem-se as portas revelando o site
    const timerOpening = setTimeout(() => {
      setPhase('opening');
    }, 2750);

    // 3600ms: Animação finalizada, libera o site
    const timerFinished = setTimeout(() => {
      setPhase('finished');
      sessionStorage.setItem('unai_gate_intro_seen', 'true');
      if (onComplete) onComplete();
    }, 3600);

    return () => {
      clearTimeout(timerClosed);
      clearTimeout(timerLogos);
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

  const showLogos = phase === 'logos' || phase === 'pulsing' || phase === 'opening';
  const isPulsing = phase === 'pulsing';

  return (
    <div 
      className={`intro-gate-overlay phase-${phase}`} 
      role="dialog" 
      aria-modal="true" 
      aria-label="Apresentação institucional dos portões de Unaí e SUS"
    >
      {/* Portão Esquerdo (Prefeitura de Unaí) */}
      <div className="gate-door gate-door-left">
        <div className="gate-door-panel">
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

      {/* Faixa Título Institucional Central (sem linha sobreposta) */}
      {showLogos && (
        <div className={`gate-title-banner ${phase === 'opening' ? 'fading' : ''}`}>
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
