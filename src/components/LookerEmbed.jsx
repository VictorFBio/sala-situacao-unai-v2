import React, { useState } from 'react';
import { LOOKER_CONFIG } from '../config/looker-config';
import { 
  BarChart2, 
  ExternalLink, 
  Maximize2, 
  RotateCw, 
  ShieldCheck, 
  AlertCircle, 
  FileSpreadsheet, 
  SlidersHorizontal 
} from 'lucide-react';

export default function LookerEmbed({ reportKey, defaultTitle, nativeContent }) {
  const config = LOOKER_CONFIG.reports[reportKey] || {};
  const embedUrl = config.embedUrl?.trim() || "";
  const title = config.title || defaultTitle || "Relatório Interativo";
  const description = config.description || "";

  // Modo de visualização: 'looker' (se URL existir) ou 'native'
  const [activeView, setActiveView] = useState(embedUrl ? 'looker' : 'native');
  const [showHowTo, setShowHowTo] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  return (
    <div className="looker-container">
      {/* Barra Superior da Moldura Institucional */}
      <div className="looker-header">
        <div className="looker-title-area">
          <BarChart2 size={20} className="looker-icon" />
          <div>
            <h3 className="looker-title">{title}</h3>
            {description && <p style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)' }}>{description}</p>}
          </div>
        </div>

        <div className="looker-controls">
          {embedUrl ? (
            <div className="looker-toggle-group">
              <button 
                className={`looker-toggle-btn ${activeView === 'looker' ? 'active' : ''}`}
                onClick={() => setActiveView('looker')}
              >
                Looker Studio
              </button>
              <button 
                className={`looker-toggle-btn ${activeView === 'native' ? 'active' : ''}`}
                onClick={() => setActiveView('native')}
              >
                Dados Nativos
              </button>
            </div>
          ) : (
            <span className="badge-version" style={{ background: '#FEF9EB', color: '#8F6200', borderColor: '#F5DC98' }}>
              <SlidersHorizontal size={12} />
              Looker Studio Preparado
            </span>
          )}

          {embedUrl && activeView === 'looker' && (
            <>
              <button 
                className="btn-header-rever"
                onClick={handleRefresh}
                title="Recarregar relatório"
              >
                <RotateCw size={13} />
              </button>
              <a 
                href={embedUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-header-rever"
                title="Abrir em nova aba"
              >
                <ExternalLink size={13} />
              </a>
            </>
          )}
        </div>
      </div>

      {/* Conteúdo: Iframe do Looker Studio vs Estado de Espera */}
      {embedUrl && activeView === 'looker' ? (
        <div className="looker-iframe-wrapper">
          <iframe
            key={iframeKey}
            src={embedUrl}
            title={title}
            allowFullScreen
            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            loading="lazy"
          ></iframe>
        </div>
      ) : (
        <div>
          {/* Se não houver URL configurada, exibe o banner institucional de espera */}
          {!embedUrl && (
            <div className="looker-pending-box">
              <div className="looker-pending-icon">
                <BarChart2 size={26} />
              </div>
              
              <h4 className="looker-pending-title">Relatório Looker Studio em Fase de Vinculação</h4>
              
              <p className="looker-pending-desc">
                A estrutura do portal está <strong>100% pronta para receber a incorporação via iframe</strong>.
                Enquanto o link oficial não for configurado em <code>src/config/looker-config.js</code>, 
                apresentamos abaixo os <strong>gráficos e séries históricas oficiais validadas</strong> da saúde de Unaí.
              </p>

              {/* Alerta de Segurança e Privacidade */}
              <div className="looker-transparency-alert">
                <ShieldCheck size={20} style={{ flexShrink: 0, marginTop: 2, color: 'var(--color-success)' }} />
                <div>
                  <strong>Diretriz de Transparência e Segurança:</strong>
                  <p style={{ marginTop: 2 }}>
                    Relatórios públicos do Looker Studio ficam acessíveis na internet. Vincule exclusivamente bases agregadas de domínio público e jamais dados individuais ou identificáveis de pacientes.
                  </p>
                </div>
              </div>

              {/* Guia Rápido de Configuração */}
              <button 
                style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline' }}
                onClick={() => setShowHowTo(!showHowTo)}
              >
                {showHowTo ? "Ocultar instruções de vinculação" : "Como vincular seu relatório do Looker Studio aqui?"}
              </button>

              {showHowTo && (
                <div style={{ textAlign: 'left', maxWidth: '640px', background: 'var(--color-bg-subtle)', padding: '16px 20px', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--color-text-main)' }}>
                  <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li>Acesse o <strong>Google Looker Studio</strong> (gratuito) e crie seu painel com a base de dados agregada.</li>
                    <li>No menu superior, vá em <strong>Arquivo &gt; Incorporar relatório</strong> e marque <strong>Habilitar incorporação</strong>.</li>
                    <li>Copie o link gerado e cole no arquivo <code>src/config/looker-config.js</code> na chave <code>{reportKey}</code>.</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Conteúdo Nativo com Gráficos Validados */}
          <div style={{ padding: '24px' }}>
            {nativeContent}
          </div>
        </div>
      )}
    </div>
  );
}
