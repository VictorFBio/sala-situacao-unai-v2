import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import { formatNumber, formatCurrency, formatCompetencia } from '../utils/data-loader';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AXIS_LABEL_COLOR = '#334155';
const AXIS_GRID_COLOR = 'rgba(226, 232, 240, 0.8)';

/**
 * 1. Série Temporal de Nascimentos (SINASC 2015-2026)
 */
export function NascimentosChart({ rows = [] }) {
  const anosValidos = rows.filter(r => r.ano && r.valor !== null);
  const labels = anosValidos.map(r => r.parcial ? `${r.ano}* (parcial)` : String(r.ano));
  const valores = anosValidos.map(r => r.valor);

  const data = {
    labels,
    datasets: [
      {
        label: 'Nascidos Vivos (SINASC)',
        data: valores,
        borderColor: '#08588E',
        backgroundColor: 'rgba(8, 88, 142, 0.12)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#08588E',
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${formatNumber(ctx.parsed.y)} nascimentos`,
          footer: () => 'Fonte: SINASC / DATASUS e Sede Municipal de Unaí'
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Ano de Nascimento',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        grid: { color: AXIS_GRID_COLOR }
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Nascidos Vivos (registros anuais)',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        ticks: { callback: v => formatNumber(v) },
        grid: { color: AXIS_GRID_COLOR }
      }
    }
  };

  return (
    <div style={{ height: '320px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
}

/**
 * 2. Série Temporal de Óbitos Anuais (SIM 2015-2026)
 */
export function ObitosAnuaisChart({ rows = [] }) {
  const anosValidos = rows.filter(r => r.ano && r.valor !== null);
  const labels = anosValidos.map(r => r.parcial ? `${r.ano}* (parcial)` : String(r.ano));
  const valores = anosValidos.map(r => r.valor);

  const data = {
    labels,
    datasets: [
      {
        label: 'Óbitos Registrados (SIM)',
        data: valores,
        borderColor: '#A85A1D',
        backgroundColor: 'rgba(168, 90, 29, 0.12)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#A85A1D',
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${formatNumber(ctx.parsed.y)} óbitos`,
          footer: () => 'Fonte: SIM / DATASUS e Sede Municipal de Unaí'
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Ano do Óbito',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        grid: { color: AXIS_GRID_COLOR }
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Total de Óbitos (registros anuais)',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        ticks: { callback: v => formatNumber(v) },
        grid: { color: AXIS_GRID_COLOR }
      }
    }
  };

  return (
    <div style={{ height: '320px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
}

/**
 * 3. Consultas Pré-Natal (SINASC)
 */
export function SinascPrenatalChart({ rows = [] }) {
  const anos = [...new Set(rows.map(r => r.ano))].sort().slice(-6);

  const datasets = [
    {
      label: '7 ou mais consultas (Adequado)',
      data: anos.map(a => {
        const item = rows.find(r => r.ano === a && (r.categoria?.includes('7') || r.consultas?.includes('7')));
        return item?.valor || 0;
      }),
      backgroundColor: '#0B6B55'
    },
    {
      label: '4 a 6 consultas',
      data: anos.map(a => {
        const item = rows.find(r => r.ano === a && (r.categoria?.includes('4 a 6') || r.consultas?.includes('4 a 6')));
        return item?.valor || 0;
      }),
      backgroundColor: '#08588E'
    },
    {
      label: 'Menos de 4 consultas / Nenhuma',
      data: anos.map(a => {
        const item = rows.find(r => r.ano === a && (r.categoria?.includes('1 a 3') || r.categoria?.includes('Nenhuma')));
        return item?.valor || 0;
      }),
      backgroundColor: '#C05621'
    }
  ];

  const data = {
    labels: anos.map(String),
    datasets
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${formatNumber(ctx.parsed.y)} nascimentos`
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Ano',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        grid: { color: AXIS_GRID_COLOR }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Nascidos Vivos por Faixa de Pré-Natal',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        ticks: { callback: v => formatNumber(v) },
        grid: { color: AXIS_GRID_COLOR }
      }
    }
  };

  return (
    <div style={{ height: '320px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

/**
 * 4. Mortalidade por Causas Básicas (SIM)
 */
export function CausasMorteChart({ rows = [] }) {
  const causasTop = [...rows]
    .sort((a, b) => (b.valor || 0) - (a.valor || 0))
    .slice(0, 6);

  const labels = causasTop.map(r => r.categoria || r.causa || 'Outras');
  const valores = causasTop.map(r => r.valor || 0);
  const total = valores.reduce((a, b) => a + b, 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Óbitos',
        data: valores,
        backgroundColor: [
          '#08588E',
          '#0B6B55',
          '#C05621',
          '#6B46C1',
          '#D69E2E',
          '#718096'
        ],
        borderWidth: 2,
        borderColor: '#FFFFFF'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const pct = total > 0 ? Math.round((ctx.parsed / total) * 100) : 0;
            return ` ${ctx.label}: ${formatNumber(ctx.parsed)} óbitos (${pct}%)`;
          }
        }
      }
    }
  };

  return (
    <div style={{ height: '320px', width: '100%' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}

/**
 * 5. Óbitos por Faixa Etária (SIM)
 */
export function SimIdadeChart({ rows = [] }) {
  const faixas = [...rows].filter(r => (r.faixa || r.categoria) && r.valor !== null);
  const labels = faixas.map(r => r.faixa || r.categoria);
  const valores = faixas.map(r => r.valor || 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Óbitos Registrados por Faixa de Idade',
        data: valores,
        backgroundColor: '#9A5B16',
        borderRadius: 4
      }
    ]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${formatNumber(ctx.parsed.x)} óbitos`
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Total de Óbitos Registrados (SIM)',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        ticks: { callback: v => formatNumber(v) },
        grid: { color: AXIS_GRID_COLOR }
      },
      y: {
        title: {
          display: true,
          text: 'Faixa Etária',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        grid: { display: false }
      }
    }
  };

  return (
    <div style={{ height: '320px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

/**
 * 6. Notificações de Dengue / Arboviroses (InfoDengue / SINAN)
 */
export function DengueChart({ rows = [] }) {
  const anos = rows.map(r => String(r.ano || r.periodo || ''));
  const casos = rows.map(r => r.casos || r.valor || 0);

  const data = {
    labels: anos,
    datasets: [
      {
        label: 'Casos Notificados / Prováveis de Dengue',
        data: casos,
        backgroundColor: '#C05621',
        borderRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${formatNumber(ctx.parsed.y)} casos notificados`
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Ano Epidemiológico',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        grid: { color: AXIS_GRID_COLOR }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Casos Notificados / Prováveis',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        ticks: { callback: v => formatNumber(v) },
        grid: { color: AXIS_GRID_COLOR }
      }
    }
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

/**
 * 7. Atendimentos Mensais da Atenção Primária (Siaps / APS)
 */
export function ApsAtendimentosChart({ rows = [] }) {
  const ultimos = rows.slice(-24);
  const labels = ultimos.map(r => formatCompetencia(r.competencia || r.mes || r.data));
  const valores = ultimos.map(r => r.valor || 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Atendimentos Individuais (Médicos e Enfermagem)',
        data: valores,
        borderColor: '#0B6B55',
        backgroundColor: 'rgba(11, 107, 85, 0.12)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#0B6B55',
        pointRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${formatNumber(ctx.parsed.y)} atendimentos individuais`
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Competência (Mês/Ano)',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        grid: { color: AXIS_GRID_COLOR }
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Atendimentos Individuais Registrados',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        ticks: { callback: v => formatNumber(v) },
        grid: { color: AXIS_GRID_COLOR }
      }
    }
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
}

/**
 * 8. Visitas Domiciliares de ACS (Siaps / APS)
 */
export function ApsVisitasChart({ rows = [] }) {
  const ultimos = rows.slice(-24);
  const labels = ultimos.map(r => formatCompetencia(r.competencia || r.mes || r.data));
  const valores = ultimos.map(r => r.valor || 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Visitas Domiciliares Realizadas por ACS',
        data: valores,
        borderColor: '#08588E',
        backgroundColor: 'rgba(8, 88, 142, 0.12)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#08588E',
        pointRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${formatNumber(ctx.parsed.y)} visitas domiciliares`
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Competência (Mês/Ano)',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        grid: { color: AXIS_GRID_COLOR }
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Visitas Domiciliares Registradas',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        ticks: { callback: v => formatNumber(v) },
        grid: { color: AXIS_GRID_COLOR }
      }
    }
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
}

/**
 * 9. Atividades Coletivas na APS (Siaps)
 */
export function ApsColetivasChart({ rows = [] }) {
  const ultimos = rows.slice(-24);
  const labels = ultimos.map(r => formatCompetencia(r.competencia || r.mes || r.data));
  const valores = ultimos.map(r => r.valor || 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Atividades Coletivas de Promoção da Saúde',
        data: valores,
        backgroundColor: '#6B46C1',
        borderRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${formatNumber(ctx.parsed.y)} atividades coletivas`
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Competência (Mês/Ano)',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        grid: { color: AXIS_GRID_COLOR }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Atividades Coletivas Realizadas',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        ticks: { callback: v => formatNumber(v) },
        grid: { color: AXIS_GRID_COLOR }
      }
    }
  };

  return (
    <div style={{ height: '280px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

/**
 * 10. Pirâmide Etária por Sexo (Censo 2022)
 */
export function PiramideEtariaChart({ rows = [] }) {
  const faixas = [...new Set(rows.map(r => r.faixa || r.categoria))].filter(Boolean);

  const homens = faixas.map(f => {
    const item = rows.find(r => (r.faixa === f || r.categoria === f) && (r.sexo === 'Homens' || r.sexo === 'Masculino'));
    return item?.valor || 0;
  });

  const mulheres = faixas.map(f => {
    const item = rows.find(r => (r.faixa === f || r.categoria === f) && (r.sexo === 'Mulheres' || r.sexo === 'Feminino'));
    return item?.valor || 0;
  });

  const data = {
    labels: faixas,
    datasets: [
      {
        label: 'Homens',
        data: homens.map(v => -v),
        backgroundColor: '#08588E',
        borderRadius: 4
      },
      {
        label: 'Mulheres',
        data: mulheres,
        backgroundColor: '#0B6B55',
        borderRadius: 4
      }
    ]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${formatNumber(Math.abs(ctx.parsed.x))} pessoas`
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'População Residente (Homens à esquerda / Mulheres à direita)',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        ticks: {
          callback: v => formatNumber(Math.abs(v))
        },
        grid: { color: AXIS_GRID_COLOR }
      },
      y: {
        title: {
          display: true,
          text: 'Grupo Etário (Censo 2022)',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        grid: { display: false }
      }
    }
  };

  return (
    <div style={{ height: '380px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

/**
 * 11. População por Cor / Raça (Censo 2022)
 */
export function CorRacaChart({ rows = [] }) {
  const labels = rows.map(r => r.cor || r.categoria);
  const valores = rows.map(r => r.valor || 0);
  const total = valores.reduce((a, b) => a + b, 0);

  const data = {
    labels,
    datasets: [
      {
        data: valores,
        backgroundColor: ['#D69E2E', '#08588E', '#0B6B55', '#805AD5', '#718096'],
        borderWidth: 2,
        borderColor: '#FFFFFF'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const pct = total > 0 ? Math.round((ctx.parsed / total) * 100) : 0;
            return ` ${ctx.label}: ${formatNumber(ctx.parsed)} pessoas (${pct}%)`;
          }
        }
      }
    }
  };

  return (
    <div style={{ height: '280px', width: '100%' }}>
      <Pie data={data} options={options} />
    </div>
  );
}

/**
 * 12. Evolução da População Estimada (IBGE 2015-2026)
 */
export function PopulacaoEstimativasChart({ rows = [] }) {
  const anos = rows.map(r => String(r.ano));
  const valores = rows.map(r => r.valor || 0);

  const data = {
    labels: anos,
    datasets: [
      {
        label: 'População Estimada (IBGE)',
        data: valores,
        borderColor: '#08588E',
        backgroundColor: 'rgba(8, 88, 142, 0.12)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#08588E',
        pointRadius: 5
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${formatNumber(ctx.parsed.y)} habitantes`
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Ano da Estimativa',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        grid: { color: AXIS_GRID_COLOR }
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Habitantes Estimados (IBGE)',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        ticks: { callback: v => formatNumber(v) },
        grid: { color: AXIS_GRID_COLOR }
      }
    }
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
}

/**
 * 13. Internações Hospitalares por Especialidade (SIH/SUS)
 */
export function InternacoesEspecialidadeChart({ rows = [] }) {
  const labels = rows.map(r => r.especialidade || r.categoria || '');
  const valores = rows.map(r => r.internacoes || r.valor || 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Internações Hospitalares no SUS',
        data: valores,
        backgroundColor: '#08588E',
        borderRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${formatNumber(ctx.parsed.y)} internações`
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Especialidade de Internação',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        grid: { color: AXIS_GRID_COLOR }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Internações Aprovadas (AIH)',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        ticks: { callback: v => formatNumber(v) },
        grid: { color: AXIS_GRID_COLOR }
      }
    }
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

/**
 * 14. Cobertura Vacinal (Imunização SES-MG 2025)
 */
export function ImunizacaoChart({ rows = [] }) {
  const labels = rows.map(r => r.vacina || r.imunobiologico || r.categoria || '');
  const valores = rows.map(r => r.cobertura || r.valor || 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Cobertura Vacinal (%)',
        data: valores,
        backgroundColor: valores.map(v => v >= 95 ? '#0B6B55' : v >= 80 ? '#D69E2E' : '#C05621'),
        borderRadius: 4
      }
    ]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` Cobertura: ${ctx.parsed.x}% (Meta PNI: 95%)`
        }
      }
    },
    scales: {
      x: {
        max: 100,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cobertura Vacinal (%) — Meta PNI: 95%',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        ticks: { callback: v => `${v}%` },
        grid: { color: AXIS_GRID_COLOR }
      },
      y: {
        title: {
          display: true,
          text: 'Imunobiológico / Vacina',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        grid: { display: false }
      }
    }
  };

  return (
    <div style={{ height: '340px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

/**
 * 15. Classificação C1 das Equipes eSF (Programa Mais Acesso)
 */
export function ApsC1Chart({ rows = [] }) {
  const quadrimestres = [...new Set(rows.map(r => r.quadrimestre || r.periodo))]
    .filter(q => rows.some(r => (r.quadrimestre === q || r.periodo === q) && r.valor !== null));

  const classes = ['Ótimo', 'Bom', 'Suficiente', 'Regular'];
  const cores = {
    'Ótimo': '#0B6B55',
    'Bom': '#08588E',
    'Suficiente': '#D69E2E',
    'Regular': '#C05621'
  };

  const datasets = classes.map(classe => ({
    label: classe,
    data: quadrimestres.map(q => {
      const item = rows.find(r => (r.quadrimestre === q || r.periodo === q) && r.classe === classe);
      return item?.valor || 0;
    }),
    backgroundColor: cores[classe]
  }));

  const data = {
    labels: quadrimestres,
    datasets
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y} equipes (${Math.round((ctx.parsed.y / 21) * 100)}%)`
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Quadrimestre de Avaliação (Siaps/MS)',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        grid: { color: AXIS_GRID_COLOR }
      },
      y: {
        stacked: true,
        max: 22,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Equipes de Saúde da Família (Total: 21)',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        ticks: { stepSize: 5 },
        grid: { color: AXIS_GRID_COLOR }
      }
    }
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

/**
 * 16. Atendimentos Odontológicos na APS (Siaps)
 */
export function ApsOdontoChart({ rows = [] }) {
  const ultimos = rows.slice(-24);
  const labels = ultimos.map(r => formatCompetencia(r.competencia || r.mes || r.data));
  const valores = ultimos.map(r => r.valor || 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Atendimentos Odontológicos Registrados',
        data: valores,
        borderColor: '#2B6CB0',
        backgroundColor: 'rgba(43, 108, 176, 0.12)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#2B6CB0',
        pointRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${formatNumber(ctx.parsed.y)} atendimentos odontológicos`
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Competência (Mês/Ano)',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        grid: { color: AXIS_GRID_COLOR }
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Atendimentos Odontológicos',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        ticks: { callback: v => formatNumber(v) },
        grid: { color: AXIS_GRID_COLOR }
      }
    }
  };

  return (
    <div style={{ height: '280px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
}

/**
 * 17. Procedimentos Ambulatoriais na APS (Siaps)
 */
export function ApsProcedimentosChart({ rows = [] }) {
  const ultimos = rows.slice(-24);
  const labels = ultimos.map(r => formatCompetencia(r.competencia || r.mes || r.data));
  const valores = ultimos.map(r => r.valor || 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Procedimentos Clínicos / Ambulatoriais na APS',
        data: valores,
        backgroundColor: '#319795',
        borderRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${formatNumber(ctx.parsed.y)} procedimentos`
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Competência (Mês/Ano)',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        grid: { color: AXIS_GRID_COLOR }
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Procedimentos Registrados',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        ticks: { callback: v => formatNumber(v) },
        grid: { color: AXIS_GRID_COLOR }
      }
    }
  };

  return (
    <div style={{ height: '280px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

/**
 * 18. Distribuição de Estabelecimentos por Vínculo SUS (CNES)
 */
export function RedeSusChart({ rows = [] }) {
  const labels = rows.map(r => r.categoria === 'SIM' ? 'Atendimento SUS' : 'Não Atende SUS (Privado Puro)');
  const valores = rows.map(r => r.valor || 0);
  const total = valores.reduce((a, b) => a + b, 0);

  const data = {
    labels,
    datasets: [
      {
        data: valores,
        backgroundColor: ['#0B6B55', '#A0AEC0'],
        borderWidth: 2,
        borderColor: '#FFFFFF'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const pct = total > 0 ? Math.round((ctx.parsed / total) * 100) : 0;
            return ` ${ctx.label}: ${formatNumber(ctx.parsed)} estabelecimentos (${pct}%)`;
          }
        }
      }
    }
  };

  return (
    <div style={{ height: '260px', width: '100%' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}

/**
 * 19. Evolução das Internações Hospitalares e Custos (SIH/SUS - Eixo Duplo)
 */
export function SihEvolucaoChart({ rowsInternacoes = [], rowsValores = [] }) {
  const anosValidos = rowsInternacoes.filter(r => r.ano);
  const anos = anosValidos.map(r => r.parcial ? `${r.ano}* (parcial)` : String(r.ano));
  const internacoes = anosValidos.map(r => r.valor || 0);

  const mapaValores = new Map(rowsValores.map(r => [r.ano, r.valor]));
  const valoresReais = anosValidos.map(r => mapaValores.get(r.ano) || 0);

  const data = {
    labels: anos,
    datasets: [
      {
        type: 'bar',
        label: 'Internações Aprovadas (AIH)',
        data: internacoes,
        backgroundColor: '#08588E',
        borderRadius: 4,
        yAxisID: 'y'
      },
      {
        type: 'line',
        label: 'Valor Total Aprovado (R$)',
        data: valoresReais,
        borderColor: '#0B6B55',
        backgroundColor: '#0B6B55',
        pointRadius: 4,
        tension: 0.3,
        yAxisID: 'y1'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            if (ctx.dataset.yAxisID === 'y1') {
              return ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`;
            }
            return ` ${ctx.dataset.label}: ${formatNumber(ctx.parsed.y)} internações`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Ano',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        grid: { color: AXIS_GRID_COLOR }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Internações Aprovadas (AIH)',
          color: '#08588E',
          font: { weight: '600', size: 12 }
        },
        ticks: { callback: v => formatNumber(v) },
        grid: { color: AXIS_GRID_COLOR }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Valor Aprovado (R$)',
          color: '#0B6B55',
          font: { weight: '600', size: 12 }
        },
        ticks: { callback: v => `${formatNumber(v / 1000000, { maximumFractionDigits: 1 })}M` },
        grid: { drawOnChartArea: false }
      }
    }
  };

  return (
    <div style={{ height: '320px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

/**
 * 20. Dias de Internação e Permanência Hospitalar (SIH/SUS)
 */
export function SihDiasChart({ rowsDias = [], rowsInternacoes = [] }) {
  const anosValidos = rowsDias.filter(r => r.ano);
  const labels = anosValidos.map(r => r.parcial ? `${r.ano}* (parcial)` : String(r.ano));
  const dias = anosValidos.map(r => r.valor || 0);

  const mapaInternacoes = new Map(rowsInternacoes.map(r => [r.ano, r.valor]));
  const mediaDias = anosValidos.map(r => {
    const aih = mapaInternacoes.get(r.ano);
    return aih && aih > 0 ? Number(((r.valor || 0) / aih).toFixed(1)) : 0;
  });

  const data = {
    labels,
    datasets: [
      {
        type: 'bar',
        label: 'Dias de Permanência Totais',
        data: dias,
        backgroundColor: '#718096',
        borderRadius: 4,
        yAxisID: 'y'
      },
      {
        type: 'line',
        label: 'Média de Dias por Internação',
        data: mediaDias,
        borderColor: '#C05621',
        backgroundColor: '#C05621',
        pointRadius: 4,
        tension: 0.3,
        yAxisID: 'y1'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            if (ctx.dataset.yAxisID === 'y1') {
              return ` ${ctx.dataset.label}: ${ctx.parsed.y} dias / internação`;
            }
            return ` ${ctx.dataset.label}: ${formatNumber(ctx.parsed.y)} dias`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Ano',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        grid: { color: AXIS_GRID_COLOR }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Dias Totais de Internação',
          color: '#718096',
          font: { weight: '600', size: 12 }
        },
        ticks: { callback: v => formatNumber(v) },
        grid: { color: AXIS_GRID_COLOR }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        max: 8,
        title: {
          display: true,
          text: 'Média de Permanência (dias)',
          color: '#C05621',
          font: { weight: '600', size: 12 }
        },
        ticks: { callback: v => `${v} d` },
        grid: { drawOnChartArea: false }
      }
    }
  };

  return (
    <div style={{ height: '320px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

/**
 * 21. Monitoramento de SRAG (SIVEP-Gripe)
 */
export function SragChart({ rows = [] }) {
  const ultimos = rows.slice(-20);
  const labels = ultimos.map(r => `Sem ${r.semana}/${String(r.ano).slice(-2)}`);
  const hospitalizacoes = ultimos.map(r => r.valor || 0);
  const obitos = ultimos.map(r => r.obitos || 0);

  const data = {
    labels,
    datasets: [
      {
        type: 'bar',
        label: 'Hospitalizações por SRAG',
        data: hospitalizacoes,
        backgroundColor: 'rgba(214, 158, 46, 0.8)',
        borderRadius: 4
      },
      {
        type: 'line',
        label: 'Óbitos por SRAG',
        data: obitos,
        borderColor: '#E53E3E',
        backgroundColor: '#E53E3E',
        tension: 0.2,
        pointRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y}`
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Semana Epidemiológica / Ano',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        grid: { color: AXIS_GRID_COLOR }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Hospitalizações e Óbitos',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        ticks: { stepSize: 1 },
        grid: { color: AXIS_GRID_COLOR }
      }
    }
  };

  return (
    <div style={{ height: '280px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}
