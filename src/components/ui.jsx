import React, { useId, useRef } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { gerarCSV } from '../utils/dados-modelo';
import { formatNumber } from '../utils/data-loader';

/* ---------- Cabeçalho de página ---------- */
export function PageHeader({ eyebrow, title, children, onRouteChange, backLabel = 'Início' }) {
  return (
    <>
      <a
        className="back-link"
        href="#/"
        onClick={(e) => { e.preventDefault(); onRouteChange('#/'); }}
      >
        <ArrowLeft size={14} aria-hidden="true" />
        {backLabel}
      </a>
      <header className="page-header">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {children && <p>{children}</p>}
      </header>
    </>
  );
}

/* ---------- Indicador (KPI) ---------- */
export function KPICard({ title, value, unit, period, source, accent }) {
  const missing = value === null || value === undefined || value === '';
  return (
    <div className="kpi-card" style={accent ? { borderTopColor: accent } : undefined}>
      <span className="kpi-title">{title}</span>
      <span className={`kpi-value ${missing ? 'is-missing' : ''}`}>{missing ? 'Não disponível' : value}</span>
      {unit && <span className="kpi-unit">{unit}</span>}
      <div className="kpi-footer">
        {period && <span>Período: <strong>{period}</strong></span>}
        {source && <span>Fonte: <strong>{source}</strong></span>}
      </div>
    </div>
  );
}

/* ---------- Abas acessíveis ---------- */
export function Tabs({ items, value, onChange, label }) {
  const baseId = useId();
  const refs = useRef([]);

  const onKeyDown = (e, index) => {
    let next = null;
    if (e.key === 'ArrowRight') next = (index + 1) % items.length;
    if (e.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = items.length - 1;
    if (next !== null) {
      e.preventDefault();
      onChange(items[next].id);
      refs.current[next]?.focus();
    }
  };

  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {items.map((item, i) => {
        const Icon = item.icon;
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            ref={(el) => { refs.current[i] = el; }}
            id={`${baseId}-tab-${item.id}`}
            role="tab"
            type="button"
            className="tab"
            aria-selected={selected}
            aria-controls={`${baseId}-panel`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {Icon && <Icon size={16} aria-hidden="true" />}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ id, value, children, baseLabel }) {
  if (id !== value) return null;
  return <div role="tabpanel" aria-label={baseLabel}>{children}</div>;
}

/* ---------- Tabela de valores ---------- */
const NOMES_COLUNAS = {
  ano: 'Ano', mes: 'Mês', valor: 'Valor', categoria: 'Categoria', sexo: 'Sexo', periodo: 'Período',
  classe: 'Classe', unidade: 'Unidade', semana: 'Semana epidemiológica', competencia: 'Competência',
  agravo: 'Agravo', parcial: 'Ano parcial', status: 'Situação', obitos: 'Óbitos', soma_observada: 'Soma observada',
  codigo: 'Código', tipo_equipe: 'Tipo de equipe', quadrimestre: 'Quadrimestre', codigo_tipo: 'Código do tipo',
  nome: 'Nome', grupo: 'Grupo', bairro: 'Bairro', endereco: 'Endereço'
};
const COLUNAS_OCULTAS = new Set([
  'data', 'geometria', 'competencias', 'periodo_inicio', 'periodo_fim', 'indicador', 'x', 'y',
  'equipes_classificadas', 'equipes_validas_custeio', 'qualidade_geocodificacao', 'rural', 'observacao'
]);

function celula(v) {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'boolean') return v ? 'Sim' : 'Não';
  if (typeof v === 'number') return formatNumber(v);
  return String(v);
}

export function ValuesTable({ rows }) {
  if (!rows || !rows.length) return <p className="note">Sem valores para exibir.</p>;
  const campos = [...new Set(rows.flatMap((r) => Object.keys(r)))].filter((k) => !COLUNAS_OCULTAS.has(k));
  return (
    <div className="table-wrap" tabIndex={0} role="region" aria-label="Tabela de valores do gráfico">
      <table className="data-table">
        <thead>
          <tr>{campos.map((c) => <th key={c} scope="col" className={c === 'valor' || c === 'obitos' ? 'num' : ''}>{NOMES_COLUNAS[c] || c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {campos.map((c) => <td key={c} className={typeof r[c] === 'number' ? 'num' : ''}>{celula(r[c])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Download de CSV ---------- */
export function DownloadCSV({ rows, source, queryId, label = 'Baixar CSV' }) {
  const disabled = !rows || !rows.length || !source;
  const baixar = () => {
    const csv = gerarCSV(rows, source, queryId);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unai-${queryId}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <button type="button" className="btn-download" onClick={baixar} disabled={disabled} title="Baixar os dados deste gráfico em CSV (UTF-8, separador ponto e vírgula)">
      <Download size={14} aria-hidden="true" />
      {label}
    </button>
  );
}

/* ---------- Cartão de gráfico com fonte, período, tabela e CSV ---------- */
export function ChartCard({ title, description, query, queryId, rows, controls, children, note, hideTable = false }) {
  const evidencia = rows ?? query?.rows ?? [];
  const source = query?.source;
  return (
    <section className="chart-card" aria-label={title}>
      <div className="chart-card-head">
        <div>
          <h4>{title}</h4>
          {description && <p>{description}</p>}
        </div>
        {controls}
      </div>
      <div className="chart-card-body">
        {children}
        {note && <p className="chart-meta" style={{ marginTop: 10 }}>{note}</p>}
      </div>
      {!hideTable && (
        <details className="values-details">
          <summary>Ver valores do gráfico</summary>
          <ValuesTable rows={evidencia} />
        </details>
      )}
      <div className="chart-card-foot">
        <div className="chart-meta">
          {source?.label && <div>Fonte: <strong>{source.label}</strong></div>}
          {source?.period && <div>Período: <strong>{source.period}</strong></div>}
        </div>
        <div className="chart-actions">
          <DownloadCSV rows={evidencia} source={source} queryId={queryId} />
        </div>
      </div>
    </section>
  );
}

/* ---------- Seletor de ano ---------- */
export function YearSelect({ years, value, onChange, label = 'Ano' }) {
  const id = useId();
  return (
    <div className="chart-select">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {years.map((y) => <option key={y.ano} value={y.ano}>{y.ano}{y.parcial ? ' (parcial)' : ''}</option>)}
      </select>
    </div>
  );
}

export function Note({ title, children }) {
  return (
    <aside className="note">
      {title && <h5>{title}</h5>}
      {children}
    </aside>
  );
}

export function Loading({ children }) {
  return (
    <div className="state-box" role="status">
      <div className="spinner" aria-hidden="true" />
      <h3>{children}</h3>
    </div>
  );
}
