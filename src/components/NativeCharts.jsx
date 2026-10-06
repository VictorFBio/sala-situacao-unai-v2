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
import { formatNumber, formatCurrency } from '../utils/data-loader';

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
          footer: () => 'Fonte: SINASC / DATASUS e Sede Municipal'
        }
      }
    },
    scales: {
      y: { beginAtZero: false, ticks: { callback: v => formatNumber(v) } }
    }
  };

  return (
    <div style={{ height: '320px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
}

/**
 * 2. Consultas Pré-Natal (SINASC)
 */
export function SinascPrenatalChart({ rows = [] }) {
  // Pegar os dados mais recentes agrupados por categoria
  const categorias = [...new Set(rows.map(r => r.categoria || r.consultas))].filter(Boolean);
  const anos = [...new Set(rows.map(r => r.ano))].sort().slice(-5); // últimos 5 anos

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
      legend: { position: 'top' }
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true }
    }
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

/**
 * 3. Mortalidade por Causas Básicas (SIM)
 */
export function CausasMorteChart({ rows = [] }) {
  // Ordenar as maiores causas
  const causasTop = [...rows]
    .sort((a, b) => (b.valor || 0) - (a.valor || 0))
    .slice(0, 6);

  const labels = causasTop.map(r => r.categoria || r.causa || 'Outras');
  const valores = causasTop.map(r => r.valor || 0);

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
          label: (ctx) => ` ${ctx.label}: ${formatNumber(ctx.parsed)} óbitos`
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
 * 4. Óbitos por Faixa Etária (SIM)
 */
export function SimIdadeChart({ rows = [] }) {
  const faixas = [...rows].filter(r => r.faixa && r.valor !== null);
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
    scales: {
      x: { beginAtZero: true }
    }
  };

  return (
    <div style={{ height: '320px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

/**
 * 5. Notificações de Dengue / Arboviroses (InfoDengue / SINAN)
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
        borderRadius: 6
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
          label: (ctx) => ` ${formatNumber(ctx.parsed.y)} casos`
        }
      }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

/**
 * 6. Atendimentos Mensais da Atenção Primária (Siaps / APS)
 */
export function ApsAtendimentosChart({ rows = [] }) {
  const ultimos = rows.slice(-24);
  const labels = ultimos.map(r => r.competencia || r.mes || r.data || '');
  const valores = ultimos.map(r => r.valor || 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Atendimentos Individuais (Consultas Médicas e de Enfermagem)',
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
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${formatNumber(ctx.parsed.y)} atendimentos`
        }
      }
    },
    scales: {
      y: { beginAtZero: false, ticks: { callback: v => formatNumber(v) } }
    }
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
}

/**
 * 7. Visitas Domiciliares de ACS (Siaps / APS)
 */
export function ApsVisitasChart({ rows = [] }) {
  const ultimos = rows.slice(-24);
  const labels = ultimos.map(r => r.competencia || r.mes || r.data || '');
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
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${formatNumber(ctx.parsed.y)} visitas domiciliares`
        }
      }
    },
    scales: {
      y: { beginAtZero: false, ticks: { callback: v => formatNumber(v) } }
    }
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
}

/**
 * 8. Pirâmide Etária por Sexo (Censo 2022)
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
        data: homens.map(v => -v), // valor negativo para o lado esquerdo da pirâmide
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
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${formatNumber(Math.abs(ctx.parsed.x))} pessoas`
        }
      }
    },
    scales: {
      x: {
        ticks: {
          callback: v => formatNumber(Math.abs(v))
        }
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
 * 9. População por Cor / Raça (Censo 2022)
 */
export function CorRacaChart({ rows = [] }) {
  const labels = rows.map(r => r.cor || r.categoria);
  const valores = rows.map(r => r.valor || 0);

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
          label: (ctx) => ` ${ctx.label}: ${formatNumber(ctx.parsed)} pessoas`
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
 * 10. Internações Hospitalares por Especialidade (SIH/SUS)
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
        borderRadius: 6
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
      y: { beginAtZero: true }
    }
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

/**
 * 11. Cobertura Vacinal (Imunização SES-MG)
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
          label: (ctx) => ` Cobertura: ${ctx.parsed.x}% (Meta: 95%)`
        }
      }
    },
    scales: {
      x: { max: 100, beginAtZero: true, ticks: { callback: v => `${v}%` } }
    }
  };

  return (
    <div style={{ height: '340px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

/**
 * 12. Classificação C1 das Equipes eSF (Programa Mais Acesso)
 */
export function ApsC1Chart({ rows = [] }) {
  // Filtrar quadrimestres com dados válidos
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
      x: { stacked: true },
      y: { stacked: true, max: 22, beginAtZero: true, ticks: { stepSize: 5 } }
    }
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

/**
 * 13. Atendimentos Odontológicos na APS (Siaps)
 */
export function ApsOdontoChart({ rows = [] }) {
  const ultimos = rows.slice(-24);
  const labels = ultimos.map(r => r.competencia || r.mes || r.data || '');
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
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${formatNumber(ctx.parsed.y)} atendimentos odontológicos`
        }
      }
    },
    scales: {
      y: { beginAtZero: false, ticks: { callback: v => formatNumber(v) } }
    }
  };

  return (
    <div style={{ height: '280px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
}

/**
 * 14. Procedimentos Ambulatoriais na APS (Siaps)
 */
export function ApsProcedimentosChart({ rows = [] }) {
  const ultimos = rows.slice(-24);
  const labels = ultimos.map(r => r.competencia || r.mes || r.data || '');
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
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${formatNumber(ctx.parsed.y)} procedimentos`
        }
      }
    },
    scales: {
      y: { beginAtZero: false, ticks: { callback: v => formatNumber(v) } }
    }
  };

  return (
    <div style={{ height: '280px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

/**
 * 15. Distribuição de Estabelecimentos por Vínculo SUS (CNES)
 */
export function RedeSusChart({ rows = [] }) {
  const labels = rows.map(r => r.categoria === 'SIM' ? 'Atendimento SUS' : 'Não Atende SUS (Privado Puro)');
  const valores = rows.map(r => r.valor || 0);

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
            const total = valores.reduce((a, b) => a + b, 0);
            const pct = Math.round((ctx.parsed / total) * 100);
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
 * 16. Evolução das Internações Hospitalares e Custos (SIH/SUS)
 */
export function SihEvolucaoChart({ rowsInternacoes = [], rowsValores = [] }) {
  const anos = rowsInternacoes.map(r => String(r.ano));
  const internacoes = rowsInternacoes.map(r => r.valor || 0);

  const data = {
    labels: anos,
    datasets: [
      {
        label: 'Internações Hospitalares Aprovadas (AIH)',
        data: internacoes,
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
          label: (ctx) => ` ${formatNumber(ctx.parsed.y)} internações no ano`
        }
      }
    },
    scales: {
      y: { beginAtZero: false, ticks: { callback: v => formatNumber(v) } }
    }
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

/**
 * 17. Monitoramento de SRAG (SIVEP-Gripe)
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
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  return (
    <div style={{ height: '280px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

