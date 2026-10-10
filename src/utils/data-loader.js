/**
 * Carregador dos dados oficiais agregados da Sala de Situação de Unaí.
 * Todos os arquivos são estáticos e públicos (public/data).
 */

let cachedData = null;

async function fetchJson(path, fetcher) {
  const res = await fetcher(path, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`Falha ao carregar ${path} (${res.status})`);
  return res.json();
}

export async function loadPortalData({ fetcher = globalThis.fetch, force = false } = {}) {
  if (cachedData && !force) return cachedData;

  const [dashboard, fontes, resumo, imagemSatelite] = await Promise.all([
    fetchJson('./data/dashboard-data.json', fetcher),
    fetchJson('./data/fontes.json', fetcher),
    fetchJson('./data/indicadores-resumo.json', fetcher),
    fetchJson('./data/imagem-satelite.json', fetcher)
  ]);

  cachedData = {
    queries: dashboard.queries || {},
    fontes: fontes?.fontes || [],
    resumo: resumo?.indicadores || [],
    imagemSatelite,
    coletadoEm: resumo?.coletado_em || null
  };
  return cachedData;
}

const nf = new Intl.NumberFormat('pt-BR');

/** Número no padrão brasileiro; ausência de dado é exibida como "—", nunca como zero. */
export function formatNumber(val, options) {
  if (val === null || val === undefined || Number.isNaN(Number(val))) return '—';
  return options ? new Intl.NumberFormat('pt-BR', options).format(val) : nf.format(val);
}

export function formatCurrency(val) {
  if (val === null || val === undefined || Number.isNaN(Number(val))) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
}

export function formatPercent(val, digits = 1) {
  if (val === null || val === undefined || Number.isNaN(Number(val))) return '—';
  return `${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(val)}%`;
}

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** "2026-08" -> "ago/26" */
export function formatCompetencia(comp) {
  const m = /^(\d{4})-(\d{2})$/.exec(String(comp || ''));
  if (!m) return String(comp ?? '');
  return `${MESES[Number(m[2]) - 1]}/${m[1].slice(2)}`;
}

/** "2026-08" -> "agosto de 2026" */
export function competenciaLonga(comp) {
  const m = /^(\d{4})-(\d{2})$/.exec(String(comp || ''));
  if (!m) return String(comp ?? '');
  const nomes = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  return `${nomes[Number(m[2]) - 1]} de ${m[1]}`;
}

export function findIndicator(resumo, id) {
  return (resumo || []).find((i) => i.id === id) || null;
}

/** Último registro de uma série (ou null). */
export function lastRow(rows) {
  return rows && rows.length ? rows[rows.length - 1] : null;
}
