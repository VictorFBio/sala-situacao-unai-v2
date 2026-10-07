import { ExternalLink } from 'lucide-react';
import { PageHeader, Note } from '../components/ui';

export default function FontesView({ data, onRouteChange }) {
  const fontes = data?.fontes || [];

  return (
    <div className="container page">
      <PageHeader
        eyebrow="Transparência & Governança"
        title="Fontes"
        onRouteChange={onRouteChange}
      >
        Relação de todos os sistemas de informação de saúde, bases oficiais federais e estaduais, 
        URLs de acesso público e domínios temáticos integrados na Sala de Situação de Saúde de Unaí.
      </PageHeader>

      {/* Grid de Fontes Oficiais */}
      <div className="fontes-grid">
        {fontes.map((f) => (
          <article key={f.id} className="fonte-card">
            <div className="fonte-top">
              <span className="dom">{f.dominio}</span>
            </div>

            <h4>{f.fonte}</h4>

            <p className="sys">
              Sistema Oficial: <strong>{f.sistema}</strong>
            </p>

            {f.url && (
              <div>
                <a 
                  href={f.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-download"
                  style={{ display: 'inline-flex', width: 'fit-content' }}
                >
                  <ExternalLink size={13} aria-hidden="true" />
                  Acessar base pública
                </a>
              </div>
            )}

            {f.recortes_previstos && f.recortes_previstos.length > 0 && (
              <div className="fonte-tags">
                {f.recortes_previstos.map((r, i) => (
                  <span key={i}>{r}</span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>

      <div style={{ marginTop: '32px' }}>
        <Note title="Governança de Dados Públicos e Transparência Ativa">
          <ul>
            <li>Todos os dados apresentados neste portal são públicos, agregados e anonimizados, em estrita conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018).</li>
            <li>Nenhuma base de dados deste portal contém identificadores individuais de pacientes, prontuários médicos ou registros confidenciais.</li>
            <li>As fontes primárias são os repositórios públicos oficiais do Ministério da Saúde (DATASUS, Siaps, SINAN, SIM, SINASC, SIH), do Instituto Brasileiro de Geografia e Estatística (IBGE) e da Secretaria de Estado de Saúde de Minas Gerais (SES-MG).</li>
          </ul>
        </Note>
      </div>
    </div>
  );
}
