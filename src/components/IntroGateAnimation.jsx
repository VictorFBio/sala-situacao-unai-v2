import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

export default function IntroGateAnimation({ onComplete }) {
  // Coreografia institucional precisa:
  // 1. 'waiting' (0ms - 200ms): Tela azul limpa, portas fora da tela (-100% / +100%)
  // 2. 'closing' (200ms - 1400ms): Portas deslizam das laterais e encontram-se perfeitamente no centro
  // 3. 'closed' (1400ms - 1900ms): Linha divisória eliminada, logos e faixa central surgem
  // 4. 'pulsing' (1900ms - 3200ms): Logos no tamanho padrão realizam pulsação harmônica
  // 5. 'opening' (3200ms - 4300ms): Portas abrem para as laterais, revelando o site no vão central
  // 6. 'finished' (4300ms): Overlay removido
  const [phase, setPhase] = useState('waiting');

  useEffect(() => {
    // 200ms: Dispara o fechamento das portas vindo de fora da tela
    const timerClosing = setTimeout(() => {
      setPhase('closing');
    }, 200);

    // 1400ms: Portas se encontram no centro e unem-se sem linha divisória
    const timerClosed = setTimeout(() => {
      setPhase('closed');
    }, 1400);

    // 1900ms: Logos iniciam pulsação sincronizada
    const timerPulsing = setTimeout(() => {
      setPhase('pulsing');
    }, 1900);

    // 3200ms: Abrem-se as portas revelando o site
    const timerOpening = setTimeout(() => {
      setPhase('opening');
    }, 3200);

    // 4300ms: Finaliza e remove o overlay
    const timerFinished = setTimeout(() => {
      setPhase('finished');
      sessionStorage.setItem('unai_gate_intro_seen', 'true');
      if (onComplete) onComplete();
    }, 4300);

    return () => {
      clearTimeout(timerClosing);
      clearTimeout(timerClosed);
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

  const showLogos = phase === 'closed' || phase === 'pulsing' || phase === 'opening';
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
