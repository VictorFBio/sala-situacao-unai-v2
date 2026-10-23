const MONTH_NAMES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function observedNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}

function normalizeRow(row) {
  const year = Number(row?.ano);
  if (!Number.isInteger(year) || year < 1900 || year > 9999) return null;

  const rawCompetencias = typeof row?.competencias === 'string'
    ? row.competencias.split(',').map(item => item.trim()).filter(Boolean)
    : [];
  if (!rawCompetencias.length) return null;

  const months = [];
  for (const competencia of rawCompetencias) {
    const match = competencia.match(/^(\d{4})-(\d{2})$/);
    const competenciaYear = match ? Number(match[1]) : null;
    const month = match ? Number(match[2]) : null;
    if (competenciaYear !== year || !Number.isInteger(month) || month < 1 || month > 12) return null;
    months.push(month);
  }

  const competencias = [...new Set(months)].sort((a, b) => a - b);
  const parcial = typeof row?.parcial === 'boolean' ? row.parcial : null;
  return {
    row,
    ano: year,
    valor: observedNumber(row?.valor),
    competencias,
    parcial,
    key: `${year}:${competencias.join(',')}`
  };
}

function temporalOrder(a, b) {
  if (a.ano !== b.ano) return a.ano - b.ano;
  const aLast = a.competencias.at(-1) ?? 0;
  const bLast = b.competencias.at(-1) ?? 0;
  if (aLast !== bLast) return aLast - bLast;
  return 0;
}

function latestUniqueRow(rows) {
  const candidateRows = (rows || []).filter(row => {
    const year = Number(row?.ano);
    return Number.isInteger(year) && year >= 1900 && year <= 9999;
  });
  if (!candidateRows.length) return { row: null, ambiguous: false, invalid: false };

  const latestYear = Math.max(...candidateRows.map(row => Number(row.ano)));
  const latestYearRows = candidateRows.filter(row => Number(row.ano) === latestYear);
  const normalizedLatestRows = latestYearRows.map(normalizeRow);
  if (normalizedLatestRows.some(row => row === null)) {
    return { row: null, ambiguous: false, invalid: true };
  }

  const normalized = normalizedLatestRows.sort(temporalOrder);

  const latest = normalized.at(-1);
  const latestRank = normalized.filter(item => temporalOrder(item, latest) === 0);
  return latestRank.length === 1
    ? { row: latest, ambiguous: false, invalid: false }
    : { row: null, ambiguous: true, invalid: false };
}

function areContiguous(months) {
  return months.every((month, index) => index === 0 || month === months[index - 1] + 1);
}

function periodLabel(row) {
  if (!row) return 'Indisponível';
  const months = row.competencias;
  let coverage;
  if (months.length === 1) {
    coverage = MONTH_NAMES[months[0] - 1];
  } else if (areContiguous(months)) {
    coverage = `${MONTH_NAMES[months[0] - 1]}–${MONTH_NAMES[months.at(-1) - 1]}`;
  } else {
    coverage = months.map(month => MONTH_NAMES[month - 1]).join(', ').replace(/, ([^,]*)$/, ' e $1');
  }

  const complete = months.length === 12 && areContiguous(months) && row.parcial === false;
  const status = row.parcial === null
    ? 'parcialidade não informada'
    : row.parcial ? 'parcial' : complete ? 'competências completas' : 'cobertura incompleta';
  return complete
    ? `${row.ano} — ${status}`
    : `${coverage}/${row.ano} — ${status}`;
}

export function buildHospitalarSnapshot(internacoesRows = [], diasRows = []) {
  const selected = latestUniqueRow(internacoesRows);
  if (!selected.row) {
    return {
      ano: null,
      competencias: [],
      internacoes: null,
      dias: null,
      mediaPermanencia: null,
      periodo: 'Indisponível',
      note: selected.invalid
        ? 'O recorte mais recente tem competências inválidas e não pode ser usado com segurança.'
        : selected.ambiguous
        ? 'Há registros temporais duplicados; o recorte mais recente não pode ser escolhido com segurança.'
        : 'Não há recorte temporal válido de internações disponível.'
    };
  }

  const admissions = selected.row;
  const normalizedDays = (diasRows || []).map(normalizeRow).filter(Boolean);
  const matchingDays = normalizedDays.filter(row => row.key === admissions.key);
  const days = matchingDays.length === 1 ? matchingDays[0].valor : null;
  const daysPartial = matchingDays.length === 1 ? matchingDays[0].parcial : admissions.parcial;
  const displayPeriod = {
    ...admissions,
    parcial: admissions.parcial === true || daysPartial === true
      ? true
      : admissions.parcial === false && daysPartial === false ? false : null
  };
  const notes = [];

  if (admissions.valor === null) notes.push('Valor de internações indisponível no recorte mais recente.');
  if (matchingDays.length !== 1) notes.push('Dias de permanência sem período compatível e único.');
  else if (days === null) notes.push('Valor de dias de permanência indisponível.');
  if (admissions.valor === 0 && days !== null) notes.push('Média indisponível porque o denominador de AIH é zero.');

  return {
    ano: admissions.ano,
    competencias: admissions.competencias,
    internacoes: admissions.valor,
    dias: days,
    mediaPermanencia: admissions.valor !== null && admissions.valor > 0 && days !== null
      ? days / admissions.valor
      : null,
    periodo: periodLabel(displayPeriod),
    note: notes.join(' ')
  };
}
