function hasMissingValue(value) {
  return value === null || value === undefined || value === '';
}

function normalizeCount(value) {
  if (hasMissingValue(value)) return { value: null, valid: true };
  const valid = typeof value === 'number' && Number.isFinite(value) && value >= 0 && Number.isInteger(value);
  return { value: valid ? value : null, valid };
}

function epidemiologicalYearStart(year) {
  const januaryFourth = new Date(Date.UTC(year, 0, 4));
  januaryFourth.setUTCDate(januaryFourth.getUTCDate() - januaryFourth.getUTCDay());
  return januaryFourth;
}

export function getEpidemiologicalWeekLimit(year) {
  const parsedYear = Number(year);
  if (!Number.isInteger(parsedYear)) return null;
  const start = epidemiologicalYearStart(parsedYear);
  const nextStart = epidemiologicalYearStart(parsedYear + 1);
  return Math.round((nextStart - start) / (7 * 24 * 60 * 60 * 1000));
}

function hasAnyObservedCount(row) {
  return normalizeCount(row?.valor).value !== null || normalizeCount(row?.obitos).value !== null;
}

export function getSragYearOptions(rows = []) {
  const years = new Map();
  for (const row of rows || []) {
    const year = Number(row?.ano);
    if (!Number.isInteger(year) || !hasAnyObservedCount(row)) continue;
    const option = years.get(year) || { ano: year, parcial: false };
    option.parcial ||= row?.parcial === true;
    years.set(year, option);
  }
  return [...years.values()].sort((a, b) => a.ano - b.ano);
}

function emptySeries(year, tableRows = [], error = null) {
  return {
    year,
    labels: [],
    notificacoes: [],
    obitos: [],
    lastObservedWeek: null,
    parcial: tableRows.some(row => row.parcial === true),
    tableRows,
    empty: !error,
    error
  };
}

export function buildSragSeries(rows = [], year = null) {
  const parsedYear = Number(year);
  if (!Number.isInteger(parsedYear)) return emptySeries(null);

  const sourceRows = (rows || []).filter(row => Number(row?.ano) === parsedYear);
  const weekLimit = getEpidemiologicalWeekLimit(parsedYear);
  const normalized = [];
  const seenWeeks = new Set();

  for (const row of sourceRows) {
    const week = Number(row?.semana);
    if (!Number.isInteger(week) || week < 1 || week > weekLimit) {
      return emptySeries(parsedYear, [], `Semana epidemiológica inválida para ${parsedYear}.`);
    }
    if (seenWeeks.has(week)) {
      return emptySeries(parsedYear, [], `Semana epidemiológica ${week} duplicada em ${parsedYear}.`);
    }

    const notifications = normalizeCount(row?.valor);
    const deaths = normalizeCount(row?.obitos);
    if (!notifications.valid || !deaths.valid) {
      return emptySeries(parsedYear, [], `Contagem inválida na SE ${String(week).padStart(2, '0')} de ${parsedYear}.`);
    }

    seenWeeks.add(week);
    normalized.push({ ...row, ano: parsedYear, semana: week, valor: notifications.value, obitos: deaths.value });
  }

  normalized.sort((a, b) => a.semana - b.semana);
  const observed = normalized.filter(hasAnyObservedCount);
  if (!observed.length) return emptySeries(parsedYear, normalized);

  const lastObservedWeek = Math.max(...observed.map(row => row.semana));
  const byWeek = new Map(normalized.map(row => [row.semana, row]));
  const weeks = Array.from({ length: lastObservedWeek }, (_, index) => index + 1);

  return {
    year: parsedYear,
    labels: weeks.map(week => `SE ${String(week).padStart(2, '0')}`),
    notificacoes: weeks.map(week => byWeek.get(week)?.valor ?? null),
    obitos: weeks.map(week => byWeek.get(week)?.obitos ?? null),
    lastObservedWeek,
    parcial: normalized.some(row => row.parcial === true),
    tableRows: normalized,
    empty: false,
    error: null
  };
}

export function buildSragSeriesNote(series, sourcePeriod) {
  if (series?.error) return series.error;
  if (series?.empty || !series?.year || !series?.lastObservedWeek) {
    return 'Não há valores observados de SRAG para o ano selecionado.';
  }
  const status = series.parcial ? 'parcial' : 'não marcada como parcial na fonte';
  const snapshot = sourcePeriod ? ` Contexto do snapshot da fonte: ${sourcePeriod}.` : '';
  return `Série de ${series.year} (${status}); gráfico até a SE ${String(series.lastObservedWeek).padStart(2, '0')}. A tabela e o CSV mantêm todas as linhas da fonte do ano, inclusive semanas sem valor.${snapshot}`;
}
