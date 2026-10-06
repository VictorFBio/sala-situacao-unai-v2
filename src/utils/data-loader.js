/**
 * Carregador assíncrono dos dados oficiais agregados da Sala de Situação de Unaí
 */

let cachedData = null;

export async function loadPortalData() {
  if (cachedData) return cachedData;

  try {
    const [dashboardRes, mapaRes, fontesRes, resumoRes] = await Promise.all([
      fetch('./data/dashboard-data.json'),
      fetch('./data/mapa-servicos.json'),
      fetch('./data/fontes.json'),
      fetch('./data/indicadores-resumo.json')
    ]);

    const dashboard = dashboardRes.ok ? await dashboardRes.json() : null;
    const mapa = mapaRes.ok ? await mapaRes.json() : null;
    const fontes = fontesRes.ok ? await fontesRes.json() : null;
    const resumo = resumoRes.ok ? await resumoRes.json() : null;

    cachedData = {
      dashboard,
      mapa,
      fontes: fontes?.fontes || [],
      resumo: resumo?.indicadores || [],
      metadata: {
        municipio: "Unaí (MG)",
        codigoIbge: "3170404",
        coletadoEm: resumo?.coletado_em || "2026-09-29T16:33:44-03:00",
        atualizadoEm: "05/10/2026",
        status: "Prévia Técnica Local"
      }
    };

    return cachedData;
  } catch (error) {
    console.error("Erro ao carregar dados do portal:", error);
    return null;
  }
}

/**
 * Utilitário de formatação numérica no padrão brasileiro
 */
export function formatNumber(val, options = {}) {
  if (val === null || val === undefined || isNaN(val)) return "—";
  return new Intl.NumberFormat('pt-BR', options).format(val);
}

export function formatCurrency(val) {
  if (val === null || val === undefined || isNaN(val)) return "—";
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}
