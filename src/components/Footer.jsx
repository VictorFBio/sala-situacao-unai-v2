import React from 'react';
import { Play } from 'lucide-react';

const contributors = [
  { name: 'João Victor Fernandes Valente Dos Santos', role: 'Residente em Gestão da Atenção Primária à Saúde' },
  { name: 'Kamilla Quixabeira dos Santos', role: 'Residente em Gestão da Atenção Primária à Saúde' },
  { name: 'Maria Eduarda Leal de Carvalho Santos', role: 'Residente em Gestão da Atenção Primária à Saúde' },
  { name: 'Roberta Vitória Azevedo do Amaral', role: 'Residente em Gestão da Vigilância em Saúde' },
  { name: 'Sabrinna Silva Rego', role: 'Residente em Gestão da Vigilância em Saúde' },
  { name: 'Maria Clara de Melo Mendes', role: 'Residente em Gestão da Vigilância em Saúde' }
];

export default function Footer({ onRouteChange, onReplayIntro }) {
  const portalBase = import.meta.env.VITE_PORTAL_BASE;
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Identificação Institucional */}
          <div className="footer-brand">
            <h3>Sala de Situação de Saúde de Unaí</h3>
            <p>
              Iniciativa técnica das Residências Multiprofissionais em Gestão da APS e Vigilância em Saúde da Universidade de Brasília - UnB, em cooperação com a Secretaria Municipal de Saúde de Unaí - MG.
            </p>
            <img src="./assets/unb-horizontal.jpg" alt="Universidade de Brasília - UnB" className="footer-unb" loading="lazy" />
            <p style={{ marginTop: '12px', fontSize: '0.8125rem', color: '#6C889C' }}>
              Objetivo: Fortalecer a governança em saúde, subsidiar o planejamento da gestão e democratizar o acesso da população às informações epidemiológicas e assistenciais.
            </p>
          </div>

          {/* Eixos Temáticos */}
          <div className="footer-links">
            <h4>Eixos Estratégicos</h4>
            <ul>
              <li><a href="#/aps" onClick={(e) => { e.preventDefault(); onRouteChange('#/aps'); }}>Atenção Primária</a></li>
              <li><a href="#/hospitalar" onClick={(e) => { e.preventDefault(); onRouteChange('#/hospitalar'); }}>Atenção Especializada</a></li>
              <li><a href="#/vigilancia" onClick={(e) => { e.preventDefault(); onRouteChange('#/vigilancia'); }}>Vigilância em Saúde</a></li>
              <li><a href="#/gestao" onClick={(e) => { e.preventDefault(); onRouteChange('#/gestao'); }}>Gestão & População</a></li>
              <li><a href="#/mapa" onClick={(e) => { e.preventDefault(); onRouteChange('#/mapa'); }}>Busca Saúde (Mapa)</a></li>
            </ul>
          </div>

          {/* Transparência e Apresentação */}
          <div className="footer-links">
            <h4>Transparência</h4>
            <ul>
              {portalBase && <li><a href={portalBase}>Portal da Sala de Situação</a></li>}
              <li><a href="#/fontes" onClick={(e) => { e.preventDefault(); onRouteChange('#/fontes'); }}>Fontes</a></li>
              <li><a href="https://www.prefeituraunai.mg.gov.br/" target="_blank" rel="noopener noreferrer">Portal da Prefeitura</a></li>
              <li><a href="https://datasus.saude.gov.br/" target="_blank" rel="noopener noreferrer">DataSUS Ministério da Saúde</a></li>
              <li style={{ marginTop: '8px' }}>
                <button 
                  className="btn-header-rever"
                  onClick={onReplayIntro}
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.2)' }}
                >
                  <Play size={12} aria-hidden="true" />
                  <span>Rever Abertura</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-credits">
          <section aria-labelledby="elaboracao-tecnica">
            <h4 id="elaboracao-tecnica">Elaboração técnica e autoria</h4>
            <p><strong>{contributors[0].name}</strong><br />{contributors[0].role}</p>
          </section>
          <section aria-labelledby="autoria-revisao">
            <h4 id="autoria-revisao">Autores e revisores de dados</h4>
            <ul>{contributors.map(person => <li key={person.name}><strong>{person.name}</strong> — {person.role}</li>)}</ul>
          </section>
        </div>

        {/* Linha Inferior com Créditos */}
        <div className="footer-bottom">
          <div>
            <span>© {new Date().getFullYear()} Sala de Situação de Saúde · Unaí (MG). Consulte as fontes e condições de uso dos dados agregados.</span>
          </div>
          <div>
            <span>Secretaria Municipal de Saúde · Prefeitura Municipal de Unaí - MG</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
