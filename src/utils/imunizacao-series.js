export const COVERAGE_BANDS = Object.freeze([
  { id: 'verde', label: 'Verde: ≥ 95%', color: '#0B6B55', min: 95 },
  { id: 'amarelo', label: 'Amarelo: de 80% a menos de 95%', color: '#D69E2E', min: 80 },
  { id: 'laranja', label: 'Laranja: abaixo de 80%', color: '#C05621', min: 0 }
]);

export const VACCINE_TARGETS = Object.freeze({
  BCG: 90,
  'Rotavírus': 90,
  'Pneumocócica 10': 95,
  'Meningocócica C': 95,
  'Pentavalente (DTP/HepB/Hib)': 95,
  'Poliomielite injetável (VIP)': 95,
  'Febre amarela': 95,
  'Tríplice viral — 2ª dose': 95,
  'VIP — reforço': 95,
  DTP: 95,
  'Meningocócica C — 1º reforço': 95,
  'Pneumocócica 10 — 1º reforço': 95,
  'Hepatite A infantil': 95,
  Varicela: 95
});

function normalizeLabel(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[—–]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

const TARGETS_BY_NORMALIZED_LABEL = new Map(
  Object.entries(VACCINE_TARGETS).map(([label, target]) => [normalizeLabel(label), target])
);

export function resolveCoverage(row) {
  const value = row?.valor ?? row?.cobertura;
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}

export function classifyCoverage(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return null;
  return COVERAGE_BANDS.find(band => value >= band.min) ?? null;
}

export function getVaccineTarget(label) {
  return TARGETS_BY_NORMALIZED_LABEL.get(normalizeLabel(label)) ?? null;
}
