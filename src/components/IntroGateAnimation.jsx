import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function IntroGateAnimation({ onComplete }) {
  // Fases: 'sliding' (entrando) -> 'pulsing' (encontro e pulso sincronizado) -> 'opening' (abrindo portões) -> 'finished'
  const [phase, setPhase] = useState('sliding');

  useEffect(() => {
    // Fase 1: Deslizar portões até o centro
    const pulseTimer = setTimeout(() => {
      setPhase('pulsing');
    }, 1100);

    // Fase 2: Pulsação síncrona no centro e abertura dos portões
    const openTimer = setTimeout(() => {
      setPhase('opening');
    }, 2800);

    // Fase 3: Conclusão e revelação total do site
    const finishTimer = setTimeout(() => {
      setPhase('finished');
      sessionStorage.setItem('unai_v2_gate_intro_seen', 'true');
      if (onComplete) onComplete();
    }, 3700);

    return () => {
      clearTimeout(pulseTimer);
      clearTimeout(openTimer);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setPhase('finished');
    sessionStorage.setItem('unai_v2_gate_intro_seen', 'true');
    if (onComplete) onComplete();
  };

  if (phase === 'finished') return null;

  return (
    <div className={`intro-gate-overlay phase-${phase}`} role="dialog" aria-modal="true" aria-label="Apresentação institucional de abertura">
      {/* Portão Esquerdo: Prefeitura de Unaí */}
      <div className="gate-panel gate-panel-left">
        <div style={{ opacity: 0.15, transform: 'scale(1.5)', pointerEvents: 'none' }}>
          <img src="./assets/prefeitura-unai.png" alt="" style={{ width: '380px', filter: 'brightness(0) invert(1)' }} />
        </div>
      </div>

      {/* Portão Direito: Sistema Único de Saúde (SUS) */}
      <div className="gate-panel gate-panel-right">
        <div style={{ opacity: 0.15, transform: 'scale(1.5)', pointerEvents: 'none' }}>
          <img src="./assets/sus-positivo.png" alt="" style={{ width: '380px', filter: 'brightness(0) invert(1)' }} />
        </div>
      </div>

      {/* Palco Central: Encontro dos dois símbolos e pulsação síncrona */}
      <div className="gate-center-stage">
        <div className="gate-logos-row">
          {/* Logo Unaí */}
          <div className="gate-logo-card">
            <img src="./assets/prefeitura-unai.png" alt="Prefeitura Municipal de Unaí" />
          </div>

          {/* Divisor Luminoso Central */}
          <div className="gate-divider"></div>

          {/* Logo SUS */}
          <div className="gate-logo-card">
            <img src="./assets/sus-positivo.png" alt="Sistema Único de Saúde - SUS" />
          </div>
        </div>

        {/* Título Institucional */}
        <div className="gate-title-block">
          <h2>Sala de Situação de Saúde</h2>
          <p>Secretaria Municipal de Saúde · Unaí - MG</p>
        </div>
      </div>

      {/* Botão de Pular Apresentação */}
      <button 
        className="btn-skip-gate" 
        onClick={handleSkip}
        title="Acessar o portal imediatamente"
      >
        <span>Pular apresentação</span>
        <ArrowRight size={16} style={{ display: 'inline', marginLeft: 6, verticalAlign: 'middle' }} />
      </button>
    </div>
  );
}
