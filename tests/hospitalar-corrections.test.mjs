import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve('.');

async function loadHospitalarHelpers() {
  const helperPath = path.join(projectRoot, 'src/utils/hospitalar-series.js');
  assert.ok(fs.existsSync(helperPath), 'helper hospitalar temporal deve existir');
  return import('../src/utils/hospitalar-series.js');
}

test('H-01 seleciona o recorte temporal mais recente sem recuar quando o valor e nulo', async () => {
  const { buildHospitalarSnapshot } = await loadHospitalarHelpers();
  const internacoes = [
    { ano: 2026, valor: null, parcial: true, competencias: '2026-07, 2026-01, 2026-01' },
    { ano: 2025, valor: 6557, parcial: false, competencias: '2025-01, 2025-02' }
  ];
  const dias = [
    { ano: 2025, valor: 27907, parcial: false, competencias: '2025-01, 2025-02' }
  ];

  const snapshot = buildHospitalarSnapshot(internacoes, dias);

  assert.strictEqual(snapshot.ano, 2026);
  assert.strictEqual(snapshot.internacoes, null);
  assert.strictEqual(snapshot.mediaPermanencia, null);
  assert.strictEqual(snapshot.periodo, 'jan e jul/2026 — parcial');
  assert.match(snapshot.note, /valor de internações indisponível/i);
});

test('H-01 pareia dias somente com ano e competências normalizadas idênticos', async () => {
  const { buildHospitalarSnapshot } = await loadHospitalarHelpers();
  const internacoes = [
    { ano: 2026, valor: 3746, parcial: true, competencias: '2026-07, 2026-02, 2026-01, 2026-03, 2026-04, 2026-05, 2026-06' },
    { ano: 2025, valor: 6557, parcial: false, competencias: '2025-01, 2025-02' }
  ];
  const diasCompatíveis = [
    { ano: 2026, valor: 16846, parcial: true, competencias: '2026-01, 2026-02, 2026-03, 2026-04, 2026-05, 2026-06, 2026-07' }
  ];
  const snapshot = buildHospitalarSnapshot(internacoes, diasCompatíveis);

  assert.deepStrictEqual(snapshot.competencias, [1, 2, 3, 4, 5, 6, 7]);
  assert.strictEqual(snapshot.internacoes, 3746);
  assert.strictEqual(snapshot.dias, 16846);
  assert.strictEqual(snapshot.mediaPermanencia, 16846 / 3746);
  assert.strictEqual(snapshot.periodo, 'jan–jul/2026 — parcial');

  const incompatível = buildHospitalarSnapshot(internacoes, [
    { ano: 2026, valor: 16846, parcial: true, competencias: '2026-01, 2026-02, 2026-03' },
    { ano: 2025, valor: 27907, parcial: false, competencias: '2025-01, 2025-02' }
  ]);
  assert.strictEqual(incompatível.dias, null);
  assert.strictEqual(incompatível.mediaPermanencia, null);
  assert.match(incompatível.note, /período compatível/i);
});

test('H-01 pareia cobertura idêntica apesar de parcial divergente e conserva o status parcial', async () => {
  const { buildHospitalarSnapshot } = await loadHospitalarHelpers();
  const competencias = Array.from({ length: 12 }, (_, index) => `2026-${String(index + 1).padStart(2, '0')}`).join(', ');

  const snapshot = buildHospitalarSnapshot(
    [{ ano: 2026, valor: 3746, parcial: false, competencias }],
    [{ ano: 2026, valor: 16857, parcial: true, competencias }]
  );

  assert.strictEqual(snapshot.internacoes, 3746);
  assert.strictEqual(snapshot.dias, 16857);
  assert.strictEqual(snapshot.mediaPermanencia, 4.5);
  assert.strictEqual(snapshot.periodo, 'jan–dez/2026 — parcial');
  assert.doesNotMatch(snapshot.periodo, /2026 — completo/);
});

test('H-01 torna indisponível qualquer empate temporal máximo sem depender da ordem ou de parcial', async () => {
  const { buildHospitalarSnapshot } = await loadHospitalarHelpers();
  const candidatos = [
    { ano: 2026, valor: 3746, parcial: true, competencias: '2026-01, 2026-03' },
    { ano: 2026, valor: 999, parcial: false, competencias: '2026-02, 2026-03' }
  ];

  for (const internacoes of [candidatos, [...candidatos].reverse()]) {
    const snapshot = buildHospitalarSnapshot(internacoes, []);
    assert.strictEqual(snapshot.ano, null);
    assert.strictEqual(snapshot.internacoes, null);
    assert.strictEqual(snapshot.periodo, 'Indisponível');
    assert.match(snapshot.note, /duplicados/i);
  }

  const diasDuplicados = buildHospitalarSnapshot(
    [{ ano: 2026, valor: 3746, parcial: true, competencias: '2026-01, 2026-02' }],
    [
      { ano: 2026, valor: 8000, parcial: true, competencias: '2026-01, 2026-02' },
      { ano: 2026, valor: 8857, parcial: false, competencias: '2026-02, 2026-01' }
    ]
  );
  assert.strictEqual(diasDuplicados.dias, null);
  assert.strictEqual(diasDuplicados.mediaPermanencia, null);
});

test('H-01 trata como ambíguos recortes com a mesma competência final e quantidades diferentes', async () => {
  const { buildHospitalarSnapshot } = await loadHospitalarHelpers();
  const candidatos = [
    { ano: 2026, valor: 30, parcial: true, competencias: '2026-01, 2026-02, 2026-04' },
    { ano: 2026, valor: 20, parcial: true, competencias: '2026-03, 2026-04' }
  ];

  for (const internacoes of [candidatos, [...candidatos].reverse()]) {
    const snapshot = buildHospitalarSnapshot(internacoes, []);
    assert.strictEqual(snapshot.ano, null);
    assert.strictEqual(snapshot.internacoes, null);
    assert.strictEqual(snapshot.periodo, 'Indisponível');
  }
});

test('H-01 preserva zero observado e rejeita valores, competências e duplicatas ambíguas', async () => {
  const { buildHospitalarSnapshot } = await loadHospitalarHelpers();
  const base = { ano: 2026, parcial: true, competencias: '2026-01' };

  const zero = buildHospitalarSnapshot([{ ...base, valor: 0 }], [{ ...base, valor: 10 }]);
  assert.strictEqual(zero.internacoes, 0);
  assert.strictEqual(zero.mediaPermanencia, null);

  for (const valor of [-1, Number.POSITIVE_INFINITY, '12', '']) {
    assert.strictEqual(buildHospitalarSnapshot([{ ...base, valor }], []).internacoes, null);
  }
  assert.strictEqual(buildHospitalarSnapshot([{ ...base, competencias: '2026-13', valor: 3 }], []).internacoes, null);
  const latestInvalid = buildHospitalarSnapshot([
    { ano: 2026, competencias: '2026-13', valor: 3, parcial: true },
    { ano: 2025, competencias: '2025-01', valor: 9, parcial: true }
  ], []);
  assert.strictEqual(latestInvalid.ano, null);
  assert.strictEqual(latestInvalid.internacoes, null);
  assert.strictEqual(buildHospitalarSnapshot([{ ...base, valor: 3 }, { ...base, valor: 4 }], []).internacoes, null);
  assert.strictEqual(buildHospitalarSnapshot([], []).periodo, 'Indisponível');
});

test('H-01 HospitalarView usa o snapshot nos dois cartões sem fallbacks fixos', () => {
  const view = fs.readFileSync(path.join(projectRoot, 'src/views/HospitalarView.jsx'), 'utf8');

  assert.match(view, /buildHospitalarSnapshot\(internacoesRows, diasRows\)/);
  assert.match(view, /AIH aprovadas no período/);
  assert.match(view, /dias por AIH no período/);
  assert.match(view, /residência.*processamento/is);
  assert.doesNotMatch(view, /5337|27907|5,2 dias/);
  assert.doesNotMatch(view, /period="SIH \/ SUS"/);
});

test('H-01 preserva parcialidade desconhecida sem presumir competências completas', async () => {
  const { buildHospitalarSnapshot } = await loadHospitalarHelpers();
  const competencias = Array.from({ length: 12 }, (_, index) => `2026-${String(index + 1).padStart(2, '0')}`).join(', ');
  const admissions = { ano: 2026, valor: 10, competencias };
  const days = { ano: 2026, valor: 50, competencias };
  for (const unknown of [undefined, null, '', 'false', 0]) {
    for (const [admissionFlag, dayFlag] of [[unknown, false], [false, unknown], [unknown, unknown]]) {
      const snapshot = buildHospitalarSnapshot(
        [{ ...admissions, parcial: admissionFlag }],
        [{ ...days, parcial: dayFlag }]
      );
      assert.strictEqual(snapshot.periodo, 'jan–dez/2026 — parcialidade não informada');
      assert.strictEqual(snapshot.mediaPermanencia, 5);
    }
    const partial = buildHospitalarSnapshot([{ ...admissions, parcial: unknown }], [{ ...days, parcial: true }]);
    assert.strictEqual(partial.periodo, 'jan–dez/2026 — parcial');
  }
  const complete = buildHospitalarSnapshot([{ ...admissions, parcial: false }], [{ ...days, parcial: false }]);
  assert.strictEqual(complete.periodo, '2026 — competências completas');
});
