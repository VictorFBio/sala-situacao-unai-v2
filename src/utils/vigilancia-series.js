function hasObservedValue(value) {
  return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
}

function validWeek(value) {
  const week = Number(value);
  return Number.isInteger(week) && week >= 1 ? week : null;
}

export function getYearOptions(rows = [], agravo = null) {
  const years = new Map();

  for (const row of rows || []) {
    if (agravo && row.agravo !== agravo) continue;
    if (!hasObservedValue(row.valor)) continue;

    const ano = Number(row.ano);
    if (!Number.isInteger(ano)) continue;

    const option = years.get(ano) || { ano, parcial: false };
    option.parcial ||= row.parcial === true;
    years.set(ano, option);
  }

  return [...years.values()].sort((a, b) => a.ano - b.ano);
}

export function filterRowsByYear(rows = [], year = null) {
  if (year === null || year === undefined || year === '') return rows || [];
  return (rows || []).filter(row => Number(row.ano) === Number(year));
}

export function buildWeeklySeries(rows = [], agravo, year) {
  const tableRows = (rows || [])
    .filter(row => row.agravo === agravo && Number(row.ano) === Number(year))
    .slice()
    .sort((a, b) => Number(a.semana) - Number(b.semana));

  const validRows = tableRows.filter(row => validWeek(row.semana) !== null && hasObservedValue(row.valor));
  if (!validRows.length) {
    return { labels: [], values: [], lastObservedWeek: null, tableRows };
  }

  const validWeeks = tableRows.map(row => validWeek(row.semana)).filter(week => week !== null);
  const firstWeek = Math.min(...validWeeks);
  const lastObservedWeek = Math.max(...validRows.map(row => validWeek(row.semana)));
  const byWeek = new Map(tableRows.map(row => [validWeek(row.semana), row]));
  const weeks = Array.from(
    { length: lastObservedWeek - firstWeek + 1 },
    (_, index) => firstWeek + index
  );

  return {
    labels: weeks.map(week => `SE ${String(week).padStart(2, '0')}`),
    values: weeks.map(week => {
      const row = byWeek.get(week);
      return row && hasObservedValue(row.valor) ? Number(row.valor) : null;
    }),
    lastObservedWeek,
    tableRows
  };
}

export function buildWeeklySeriesNote(agravo, year, lastObservedWeek) {
  if (!agravo || year === null || year === undefined || year === '' || lastObservedWeek === null || lastObservedWeek === undefined) {
    return null;
  }

  const parsedYear = Number(year);
  const parsedWeek = Number(lastObservedWeek);
  if (!Number.isInteger(parsedYear) || !Number.isInteger(parsedWeek) || parsedWeek < 1) return null;

  return `Série de ${agravo} em ${parsedYear}; curva até SE ${parsedWeek}. Semanas sem valor permanecem indicadas como “—” na tabela e no CSV.`;
}
