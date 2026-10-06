import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

export default function IntroGateAnimation({ onComplete }) {
  // Coreografia da apresentação:
  // 1. 'closing' (0ms - 1000ms): Tela azul, portas vêm deslizando das laterais e fecham no meio
  // 2. 'closed' (1000ms - 1050ms): Portas encostadas no meio
  // 3. 'logos' (1050ms - 1800ms): Surgem as duas logos (Unaí e SUS) e crescem até o tamanho normal
  // 4. 'pulsing' (1800ms - 3000ms): As logos no tamanho normal realizam pulsação harmônica
  // 5. 'opening' (3000ms - 3900ms): Abrem-se as portas deslizando para as laterais, revelando o site
  // 6. 'finished' (3900ms): Animação concluída
  const [phase, setPhase] = useState('closing');

  useEffect(() => {
    // 1000ms: As portas se encontram no meio
    const timerClosed = setTimeout(() => {
      setPhase('closed');
    }, 1000);

    // 1050ms: Surgem as duas logos e o título
    const timerLogos = setTimeout(() => {
      setPhase('logos');
    }, 1050);

    // 1800ms: Logos iniciam pulsação sincronizada
    const timerPulsing = setTimeout(() => {
      setPhase('pulsing');
    }, 1800);

    // 3000ms: Abrem-se as portas revelando o site
    const timerOpening = setTimeout(() => {
      setPhase('opening');
    }, 3000);

    // 3900ms: Finaliza e remove o overlay
    const timerFinished = setTimeout(() => {
      setPhase('finished');
      sessionStorage.setItem('unai_gate_intro_seen', 'true');
      if (onComplete) onComplete();
    }, 3900);

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
          {showLogos && (
            <div className={`gate-logo-container logo-unai ${isPulsing ? 'pulsing' : ''}`}>
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
          )}
        </div>
      </div>

      {/* Portão Direito (SUS) */}
      <div className="gate-door gate-door-right">
        <div className="gate-door-panel">
          {showLogos && (
            <div className={`gate-logo-container logo-sus ${isPulsing ? 'pulsing' : ''}`}>
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
          )}
        </div>
      </div>

      {/* Faixa Título Institucional Central (sem linha sobreposta) */}
      {showLogos && (
        <div className={`gate-title-banner ${phase === 'opening' ? 'fading' : ''}`}>
          <h2>SALA DE SITUAÇÃO DE SAÚDE</h2>
          <p>Secretaria Municipal de Saúde · Unaí - MG</p>
        </div>
      )}

      {/* Botão para pular apresentação */}
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
