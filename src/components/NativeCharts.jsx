import React, { useState } from 'react';
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
  const anos = [...new Set(rows.map(r => r.ano).filter(Boolean))].sort((a, b) => a - b).slice(-6);

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
 * 4. Mortalidade por Grandes Capítulos da CID-10 (SIM) - Barras Horizontais Ordenadas
 */
export function CausasMorteChart({ rows = [], limit = 10 }) {
  // Agregar óbitos por categoria da CID-10
  const mapa = new Map();
  rows.forEach(r => {
    const nome = (r.categoria || r.causa || 'Outras').replace(/\s+/g, ' ').trim();
    if (r.valor !== null && r.valor !== undefined) {
      mapa.set(nome, (mapa.get(nome) || 0) + Number(r.valor));
    }
  });

  // Ordenar decrescente pelo volume de óbitos
  const ordenadas = [...mapa.entries()]
    .map(([categoria, valor]) => ({ categoria, valor }))
    .filter(item => item.valor > 0)
    .sort((a, b) => b.valor - a.valor);

  const causasTop = limit ? ordenadas.slice(0, limit) : ordenadas;
  const labels = causasTop.map(r => r.categoria);
  const valores = causasTop.map(r => r.valor);
  const total = ordenadas.reduce((a, b) => a + b.valor, 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Óbitos Registrados (SIM)',
        data: valores,
        backgroundColor: '#08588E',
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
          label: (ctx) => {
            const val = ctx.parsed.x;
            const pct = total > 0 ? ((val / total) * 100).toFixed(1).replace('.', ',') : '0';
            return ` ${formatNumber(val)} óbitos (${pct}% do total)`;
          }
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
          text: 'Capítulo CID-10',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        ticks: {
          autoSkip: false,
          font: { size: 11 }
        },
        grid: { display: false }
      }
    }
  };

  return (
    <div style={{ height: '360px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

/**
 * 5. Óbitos por Faixa Etária (SIM) - Ordenação Cronológica Progressiva
 */
export function SimIdadeChart({ rows = [] }) {
  // Agregar óbitos por faixa de idade caso haja múltiplos anos
  const mapa = new Map();
  rows.forEach(r => {
    const f = r.faixa || r.categoria;
    if (f && r.valor !== null && r.valor !== undefined) {
      mapa.set(f, (mapa.get(f) || 0) + Number(r.valor));
    }
  });

  // Função para ordenação cronológica estrita das faixas etárias
  const getOrdemFaixa = (label) => {
    const s = String(label).trim().toLowerCase();
    if (s.includes('menor') || s.startsWith('<')) return 0;
    const match = s.match(/^(\d+)/);
    if (match) return parseInt(match[1], 10);
    return 999; // 'Idade ignorada' ou sem informação ao final
  };

  const faixasOrdenadas = [...mapa.entries()]
    .map(([faixa, valor]) => ({ faixa, valor }))
    .filter(item => item.valor > 0 || !item.faixa.toLowerCase().includes('ignorad'))
    .sort((a, b) => getOrdemFaixa(a.faixa) - getOrdemFaixa(b.faixa));

  const labels = faixasOrdenadas.map(r => r.faixa);
  const valores = faixasOrdenadas.map(r => r.valor);
  const total = valores.reduce((a, b) => a + b, 0);

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
          label: (ctx) => {
            const val = ctx.parsed.x;
            const pct = total > 0 ? ((val / total) * 100).toFixed(1).replace('.', ',') : '0';
            return ` ${formatNumber(val)} óbitos (${pct}%)`;
          }
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
        ticks: {
          autoSkip: false,
          font: { size: 11 }
        },
        grid: { display: false }
      }
    }
  };

  return (
    <div style={{ height: '360px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

/**
 * 6. Notificações de Dengue / Arboviroses (InfoDengue / SINAN)
 */
export function DengueChart({ rows = [] }) {
  const [modo, setModo] = useState('dengue'); // 'dengue' | 'chikungunya' | 'todas'

  // Identificar anos únicos e ordenados
  const anosUnicos = [...new Set(rows.map(r => r.ano).filter(Boolean))].sort((a, b) => a - b);
  
  // Rótulos limpos para o eixo X (sem repetição de anos)
  const labels = anosUnicos.map(ano => {
    const isParcial = rows.some(r => r.ano === ano && r.parcial);
    return isParcial ? `${ano}* (parcial)` : String(ano);
  });

  // Função auxiliar para recuperar o valor por agravo e ano
  const getValor = (ano, agravoNome) => {
    const item = rows.find(r => r.ano === ano && (r.agravo || '').toLowerCase() === agravoNome);
    if (!item) return 0;
    if (item.valor !== null && item.valor !== undefined) return Number(item.valor);
    if (item.soma_observada !== null && item.soma_observada !== undefined) return Number(item.soma_observada);
    return 0;
  };

  const valoresDengue = anosUnicos.map(ano => getValor(ano, 'dengue'));
  const valoresChik = anosUnicos.map(ano => getValor(ano, 'chikungunya'));
  const valoresZika = anosUnicos.map(ano => getValor(ano, 'zika'));

  let datasets = [];

  if (modo === 'dengue') {
    datasets = [
      {
        type: 'bar',
        label: 'Casos Notificados de Dengue',
        data: valoresDengue,
        backgroundColor: anosUnicos.map(ano => ano === 2024 ? '#9C4221' : '#C05621'),
        hoverBackgroundColor: '#7B341E',
        borderRadius: 4,
        barPercentage: 0.65,
        yAxisID: 'y'
      }
    ];
  } else if (modo === 'chikungunya') {
    datasets = [
      {
        type: 'bar',
        label: 'Casos Notificados de Chikungunya',
        data: valoresChik,
        backgroundColor: '#805AD5',
        hoverBackgroundColor: '#6B46C1',
        borderRadius: 4,
        barPercentage: 0.65,
        yAxisID: 'y'
      }
    ];
  } else {
    // Modo comparativo com as 3 arboviroses (Eixo duplo)
    // Dengue no eixo esquerdo (y) em barras de milhar
    // Chikungunya e Zika no eixo direito (y1) com linhas e pontos destacados
    datasets = [
      {
        type: 'bar',
        label: 'Dengue (Eixo Esquerdo)',
        data: valoresDengue,
        backgroundColor: '#C05621',
        hoverBackgroundColor: '#9C4221',
        borderRadius: 4,
        barPercentage: 0.65,
        yAxisID: 'y',
        order: 2
      },
      {
        type: 'line',
        label: 'Chikungunya (Eixo Direito)',
        data: valoresChik,
        borderColor: '#805AD5',
        backgroundColor: '#805AD5',
        pointBackgroundColor: '#805AD5',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 2.5,
        tension: 0.2,
        yAxisID: 'y1',
        order: 1
      },
      {
        type: 'line',
        label: 'Zika (Eixo Direito)',
        data: valoresZika,
        borderColor: '#0B6B55',
        backgroundColor: '#0B6B55',
        pointBackgroundColor: '#0B6B55',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 2.5,
        tension: 0.2,
        yAxisID: 'y1',
        order: 0
      }
    ];
  }

  const data = { labels, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: modo === 'todas',
        position: 'top' 
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const val = ctx.parsed.y;
            const anoIndex = ctx.dataIndex;
            const ano = anosUnicos[anoIndex];
            const datasetLabel = ctx.dataset.label || 'Casos';
            const isParcial = rows.some(r => r.ano === ano && r.parcial);
            if (ano === 2024 && datasetLabel.includes('Dengue')) {
              return ` ${datasetLabel}: ${formatNumber(val)} (Pico Epidêmico Histórico)`;
            }
            if (isParcial) {
              return ` ${datasetLabel}: ${formatNumber(val)} (Parcial${ano === 2026 ? ' até SE38' : ''})`;
            }
            return ` ${datasetLabel}: ${formatNumber(val)} notificações`;
          }
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
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        max: modo === 'todas' ? 18000 : undefined,
        title: {
          display: true,
          text: modo === 'chikungunya' 
            ? 'Notificações de Chikungunya' 
            : modo === 'todas'
            ? 'Casos de Dengue (Eixo Esquerdo)'
            : 'Casos Notificados / Prováveis',
          color: modo === 'todas' ? '#C05621' : AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        ticks: { callback: v => formatNumber(v) },
        grid: { color: AXIS_GRID_COLOR }
      },
      y1: {
        type: 'linear',
        display: modo === 'todas',
        position: 'right',
        beginAtZero: true,
        suggestedMax: 45,
        title: {
          display: modo === 'todas',
          text: 'Chikungunya e Zika (Eixo Direito)',
          color: '#805AD5',
          font: { weight: '600', size: 12 }
        },
        ticks: { 
          callback: v => formatNumber(v),
          stepSize: 10
        },
        grid: { drawOnChartArea: false }
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {modo === 'dengue' && <span>Exibindo <strong>Série Histórica de Dengue</strong> (SINAN / InfoDengue)</span>}
          {modo === 'chikungunya' && <span>Exibindo <strong>Chikungunya</strong> em escala dedicada</span>}
          {modo === 'todas' && <span>Comparativo com <strong>Eixo Duplo</strong>: Dengue (escala à esquerda) vs. Chikungunya e Zika (escala à direita)</span>}
        </div>
        <div className="segmented" role="group" aria-label="Modo de visualização de arboviroses">
          <button 
            type="button" 
            aria-pressed={modo === 'dengue'} 
            onClick={() => setModo('dengue')}
          >
            Dengue
          </button>
          <button 
            type="button" 
            aria-pressed={modo === 'chikungunya'} 
            onClick={() => setModo('chikungunya')}
          >
            Chikungunya
          </button>
          <button 
            type="button" 
            aria-pressed={modo === 'todas'} 
            onClick={() => setModo('todas')}
          >
            Todas as Arboviroses
          </button>
        </div>
      </div>

      <div style={{ height: '320px', width: '100%' }}>
        <Bar data={data} options={options} />
      </div>

      <div style={{ marginTop: '12px', padding: '10px 14px', background: 'var(--subtle)', border: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <strong>Nota epidemiológica:</strong> Em <strong>2024</strong>, Unaí vivenciou o maior pico epidêmico de dengue da série histórica com <strong>16.687 notificações</strong> registradas. Os dados de <strong>2026*</strong> são parciais acumulados até a Semana Epidemiológica 38 (2.006 casos notificados de dengue).
        {modo === 'chikungunya' && (
          <span> No modo Chikungunya, as notificações são exibidas em escala vertical dedicada, permitindo o acompanhamento detalhado dos picos observados em 2024 (26 casos) e 2025 (39 casos).</span>
        )}
        {modo === 'todas' && (
          <span> No modo comparativo, Dengue utiliza o eixo esquerdo (escala de 0 a 18.000 casos), enquanto Chikungunya e Zika utilizam o eixo direito em destaque (escala dedicada de 0 a 45 notificações), permitindo a leitura e comparação simultânea de todas as arboviroses sem invisibilidade.</span>
        )}
      </div>
    </div>
  );
}

/**
 * 6b. Notificações Consolidadas de Dengue no DATASUS / TabNet (Ministério da Saúde)
 */
export function DengueDatasusChart({ rows = [] }) {
  const rowsValidas = rows.filter(r => r.ano);
  const anos = rowsValidas.map(r => r.parcial ? `${r.ano}* (parcial)` : String(r.ano));
  const casos = rowsValidas.map(r => r.valor || 0);

  const data = {
    labels: anos,
    datasets: [
      {
        label: 'Casos Prováveis Consolidados (DATASUS/TabNet)',
        data: casos,
        backgroundColor: '#DD6B20',
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
          label: (ctx) => ` ${formatNumber(ctx.parsed.y)} casos prováveis no TabNet`
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Ano do 1º Sintoma',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        grid: { color: AXIS_GRID_COLOR }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Casos Prováveis (excluídos descartados)',
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
        borderRadius: 4,
        barThickness: 14,
        maxBarThickness: 16,
        stack: 'censo2022'
      },
      {
        label: 'Mulheres',
        data: mulheres,
        backgroundColor: '#0B6B55',
        borderRadius: 4,
        barThickness: 14,
        maxBarThickness: 16,
        stack: 'censo2022'
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
        stacked: true,
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
        stacked: true,
        title: {
          display: true,
          text: 'Grupo Etário (Censo 2022)',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        ticks: {
          autoSkip: false,
          font: { size: 11 }
        },
        grid: { display: false }
      }
    }
  };

  return (
    <div style={{ height: '420px', width: '100%' }}>
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
            const val = ctx.parsed || 0;
            const pct = total > 0 ? ((val / total) * 100).toFixed(1).replace('.', ',') : '0';
            return ` ${ctx.label}: ${formatNumber(val)} pessoas (${pct}%)`;
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
  const rowsValidas = rows.filter(r => r.ano);
  const anos = rowsValidas.map(r => String(r.ano));
  const valores = rowsValidas.map(r => r.valor || 0);

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
          label: (ctx) => {
            const val = ctx.parsed.x || 0;
            const formatted = typeof val === 'number' ? val.toFixed(1).replace('.', ',') : val;
            return ` Cobertura: ${formatted}% (Meta PNI: 95%)`;
          }
        }
      }
    },
    scales: {
      x: {
        suggestedMax: 100,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cobertura Vacinal (%) — Meta PNI: 95%',
          color: AXIS_LABEL_COLOR,
          font: { weight: '600', size: 12 }
        },
        ticks: { callback: v => `${typeof v === 'number' ? String(v).replace('.', ',') : v}%` },
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
  const quadrimestres = [...new Set(rows.map(r => r.quadrimestre || r.periodo).filter(Boolean))]
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
          label: (ctx) => ` ${ctx.dataset.label}: ${formatNumber(ctx.parsed.y)} equipes (${Math.round(((ctx.parsed.y || 0) / 21) * 100)}%)`
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
        ticks: { 
          stepSize: 5,
          callback: v => formatNumber(v)
        },
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
            const val = ctx.parsed || 0;
            const pct = total > 0 ? ((val / total) * 100).toFixed(1).replace('.', ',') : '0';
            return ` ${ctx.label}: ${formatNumber(val)} estabelecimentos (${pct}%)`;
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
        yAxisID: 'y',
        order: 1
      },
      {
        type: 'line',
        label: 'Valor Total Aprovado (R$)',
        data: valoresReais,
        borderColor: '#0B6B55',
        backgroundColor: '#0B6B55',
        pointRadius: 4,
        tension: 0.3,
        yAxisID: 'y1',
        order: 0
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
        yAxisID: 'y',
        order: 1
      },
      {
        type: 'line',
        label: 'Média de Dias por Internação',
        data: mediaDias,
        borderColor: '#C05621',
        backgroundColor: '#C05621',
        pointRadius: 4,
        tension: 0.3,
        yAxisID: 'y1',
        order: 0
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
              const val = ctx.parsed.y || 0;
              const formatted = typeof val === 'number' ? val.toFixed(1).replace('.', ',') : val;
              return ` ${ctx.dataset.label}: ${formatted} dias / internação`;
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
        ticks: { callback: v => `${typeof v === 'number' ? String(v).replace('.', ',') : v} d` },
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
          label: (ctx) => ` ${ctx.dataset.label}: ${formatNumber(ctx.parsed.y)}`
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
        ticks: { 
          stepSize: 1,
          callback: v => formatNumber(v)
        },
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
