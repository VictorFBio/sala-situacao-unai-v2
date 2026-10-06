import React from 'react';

export default function KPICard({ title, value, unit, period, source, status, alert }) {
  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        {status && (
          <span className="eixo-card-badge">
            {status}
          </span>
        )}
      </div>

      <div className="kpi-value">
        {value !== null && value !== undefined ? value : "Pendente"}
      </div>

      {unit && <div className="kpi-unit">{unit}</div>}

      <div className="kpi-footer">
        {period && <span>Período: <strong>{period}</strong></span>}
        {source && <span title={source}>Fonte: <strong>{source.length > 28 ? source.slice(0, 26) + '...' : source}</strong></span>}
      </div>
    </div>
  );
}
