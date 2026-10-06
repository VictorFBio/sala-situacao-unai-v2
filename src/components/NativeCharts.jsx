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
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Registrar componentes do Chart.js
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
 * Gráfico da Série Histórica de Nascimentos (SINASC 2015-2026)
 */
export function NascimentosChart({ rows = [] }) {
  const anosValidos = rows.filter(r => r.ano && r.valor !== null);
  const labels = anosValidos.map(r => r.parcial ? `${r.ano}* (parcial)` : String(r.ano));
  const valores = anosValidos.map(r => r.valor);

  const data = {
    labels,
    datasets: [
      {
        label: 'Nascidos Vivos Registrados (SINASC)',
        data: valores,
        borderColor: '#08588E',
        backgroundColor: 'rgba(8, 88, 142, 0.1)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#08588E',
        pointRadius: 4,
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
          footer: () => 'Fonte: Ministério da Saúde / SINASC'
        }
      }
    },
    scales: {
      y: { beginAtZero: false }
    }
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
}

/**
 * Gráfico de Mortalidade por Causas Básicas (SIM)
 */
export function CausasMorteChart({ rows = [] }) {
  // Pegar as 6 maiores causas por valor
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
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' }
    }
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}

/**
 * Gráfico de Notificações de Dengue / Arboviroses (InfoDengue / SINAN)
 */
export function DengueChart({ rows = [] }) {
  const anos = rows.map(r => String(r.ano || r.periodo || ''));
  const casos = rows.map(r => r.casos || r.valor || 0);

  const data = {
    labels: anos,
    datasets: [
      {
        label: 'Casos Notificados / Prováveis',
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
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  return (
    <div style={{ height: '280px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

/**
 * Gráfico de Atendimentos Mensais da Atenção Primária (Siaps / APS)
 */
export function ApsAtendimentosChart({ rows = [] }) {
  // Ordenar por data se existir
  const ultimos = rows.slice(-18);
  const labels = ultimos.map(r => r.competencia || r.mes || r.data || '');
  const valores = ultimos.map(r => r.valor || 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Atendimentos Individuais na APS',
        data: valores,
        borderColor: '#0B6B55',
        backgroundColor: 'rgba(11, 107, 85, 0.1)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#0B6B55',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: false }
    }
  };

  return (
    <div style={{ height: '280px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
}

/**
 * Gráfico de Faixas Etárias (Censo 2022)
 */
export function FaixasEtariasChart({ rows = [] }) {
  const faixas = rows.filter(r => r.faixa && r.valor !== null);
  const labels = faixas.map(r => r.faixa);
  const valores = faixas.map(r => r.valor);

  const data = {
    labels,
    datasets: [
      {
        label: 'População Residente (Pessoas)',
        data: valores,
        backgroundColor: '#08588E',
        borderRadius: 4
      }
    ]
  };

  const options = {
    indexAxis: 'y', // Barras horizontais para fácil leitura das faixas
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { beginAtZero: true }
    }
  };

  return (
    <div style={{ height: '340px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

/**
 * Gráfico de Internações Hospitalares por Especialidade (SIH/SUS)
 */
export function InternacoesEspecialidadeChart({ rows = [] }) {
  const labels = rows.map(r => r.especialidade || r.categoria || '');
  const valores = rows.map(r => r.internacoes || r.valor || 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Internações Aprovadas no SUS',
        data: valores,
        backgroundColor: '#2B6CB0',
        borderRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true }
    }
  };

  return (
    <div style={{ height: '280px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}
