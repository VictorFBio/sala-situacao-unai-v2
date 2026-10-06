import React from 'react';
import { ArrowLeft, FileText, ExternalLink, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

export default function FontesView({ data, onRouteChange }) {
  const fontes = data?.fontes || [];

  return (
    <div className="container" style={{ padding: '32px 24px' }}>
      {/* Navegação Superior */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          className="btn-header-rever"
          onClick={() => onRouteChange('#/')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={14} />
          <span>Voltar para a Página Inicial</span>
        </button>
      </div>

      {/* Cabeçalho */}
      <div style={{ marginBottom: '28px' }}>
        <span className="badge-version" style={{ marginBottom: '8px' }}>
          <FileText size={13} />
          Transparência & Governança
        </span>
        <h2 style={{ fontSize: '2rem', color: 'var(--color-primary-dark)', marginBottom: '6px' }}>
          Catálogo Técnico de Fontes e Metadados
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', maxWidth: '820px' }}>
          Relação de todos os sistemas de informação de saúde, bases oficiais federais e estaduais, 
          URLs de acesso público e domínios temáticos integrados na Sala de Situação de Unaí.
        </p>
      </div>

      {/* Grid de Fontes Oficiais */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {fontes.map((f) => (
          <div 
            key={f.id} 
            style={{ 
              background: '#FFFFFF', 
              padding: '24px', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="badge-version" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                {f.dominio}
              </span>

              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '4px', 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                color: f.status === 'carregada' ? 'var(--color-success)' : 'var(--color-warning)' 
              }}>
                {f.status === 'carregada' ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                {f.status === 'carregada' ? 'Carga Validada' : 'Planejada'}
              </span>
            </div>

            <h4 style={{ fontSize: '1.15rem', color: 'var(--color-primary-dark)', lineHeight: 1.3 }}>
              {f.fonte}
            </h4>

            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              Sistema Oficial: <strong>{f.sistema}</strong>
            </p>

            {f.recortes_previstos && f.recortes_previstos.length > 0 && (
              <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px dashed var(--color-border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', display: 'block', marginBottom: '6px' }}>
                  Recortes e Indicadores:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {f.recortes_previstos.map((r, i) => (
                    <span 
                      key={i} 
                      style={{ 
                        fontSize: '0.725rem', 
                        background: 'var(--color-bg-subtle)', 
                        padding: '3px 8px', 
                        borderRadius: '4px',
                        color: 'var(--color-text-main)'
                      }}
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {f.url && (
              <a 
                href={f.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-header-rever"
                style={{ marginTop: '12px', justifyContent: 'center', color: 'var(--color-primary)' }}
              >
                <span>Acessar Fonte Oficial</span>
                <ExternalLink size={13} />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
