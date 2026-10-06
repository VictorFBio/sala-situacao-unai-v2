import React, { useState, useMemo } from 'react';
import { Search, MapPin, Building, Cross, Navigation, Copy, Check, Filter } from 'lucide-react';

export default function BuscaSaudeMap({ services = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all'); // 'all', 'UBS / ESF', 'Complementar'
  const [viewScope, setViewScope] = useState('urbana'); // 'urbana' ou 'municipal'
  const [selectedService, setSelectedService] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  // Normalização para busca
  const normalize = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  // Filtragem dos serviços
  const filteredServices = useMemo(() => {
    const term = normalize(searchTerm);
    return services.filter(s => {
      const matchGroup = selectedGroup === 'all' 
        ? true 
        : selectedGroup === 'ubs' 
        ? s.grupo === 'UBS / ESF'
        : s.grupo !== 'UBS / ESF';
      const matchText = !term || normalize(`${s.codigo} ${s.nome} ${s.bairro} ${s.endereco}`).includes(term);
      return matchGroup && matchText;
    });
  }, [services, searchTerm, selectedGroup]);

  // Cálculo da escala e bounding box para o canvas SVG
  const { pointsOnMap, width, height } = useMemo(() => {
    const W = 800;
    const H = 480;
    const padding = 45;

    // Se escopo for urbano, focar no cluster da sede (30 pontos centrais)
    let pts = services;
    if (viewScope === 'urbana') {
      pts = services.filter(s => s.x < 310000); // 30 unidades da sede
    }

    if (!pts.length) return { pointsOnMap: [], width: W, height: H };

    const xs = pts.map(p => p.x);
    const ys = pts.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const dx = Math.max(maxX - minX, 1000);
    const dy = Math.max(maxY - minY, 1000);

    const scale = Math.min((W - padding * 2) / dx, (H - padding * 2) / dy);
    const offsetX = (W - dx * scale) / 2;
    const offsetY = (H - dy * scale) / 2;

    const mapped = filteredServices.map(s => {
      const px = offsetX + (s.x - minX) * scale;
      // Inverter Y pois coordenadas UTM aumentam para o norte e tela SVG para o sul
      const py = H - offsetY - (s.y - minY) * scale;
      return {
        ...s,
        px,
        py,
        isVisibleInScope: viewScope === 'municipal' || s.x < 310000
      };
    });

    return { pointsOnMap: mapped, width: W, height: H };
  }, [services, filteredServices, viewScope]);

  const handleCopy = (address, code) => {
    navigator.clipboard.writeText(address);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="map-container">
      {/* Cabeçalho do Mapa e Filtros */}
      <div className="map-header">
        <div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary-dark)', marginBottom: '4px' }}>
            Rede de Estabelecimentos Públicos de Saúde
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            32 serviços públicos georreferenciados em Unaí (18 UBS/ESF e 14 unidades complementares).
          </p>
        </div>

        {/* Controles de Escopo e Filtro */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div className="looker-toggle-group">
            <button 
              className={`looker-toggle-btn ${viewScope === 'urbana' ? 'active' : ''}`}
              onClick={() => setViewScope('urbana')}
            >
              Sede Urbana (30)
            </button>
            <button 
              className={`looker-toggle-btn ${viewScope === 'municipal' ? 'active' : ''}`}
              onClick={() => setViewScope('municipal')}
            >
              Todo Município (32)
            </button>
          </div>

          <div className="looker-toggle-group">
            <button 
              className={`looker-toggle-btn ${selectedGroup === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedGroup('all')}
            >
              Todos ({services.length})
            </button>
            <button 
              className={`looker-toggle-btn ${selectedGroup === 'ubs' ? 'active' : ''}`}
              onClick={() => setSelectedGroup('ubs')}
            >
              UBS / ESF (18)
            </button>
            <button 
              className={`looker-toggle-btn ${selectedGroup === 'comp' ? 'active' : ''}`}
              onClick={() => setSelectedGroup('comp')}
            >
              Complementar (14)
            </button>
          </div>
        </div>
      </div>

      {/* Barra de Busca de Unidade ou Bairro */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center' }}>
        <div className="map-search-bar" style={{ flex: 1 }}>
          <Search size={18} color="var(--color-text-muted)" />
          <input 
            type="text" 
            placeholder="Buscar por unidade, endereço ou bairro (ex.: Alvorada, Cachoeira, Centro)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
          Exibindo <strong>{filteredServices.length}</strong> de {services.length} locais
        </span>
      </div>

      {/* Canvas SVG Interativo */}
      <div style={{ position: 'relative' }}>
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="map-svg-canvas"
          role="img"
          aria-label="Mapa cartográfico das unidades de saúde de Unaí"
        >
          {/* Fundo e Linhas de Grid Sutis */}
          <rect width="100%" height="100%" fill="#EEF4F8" rx="12" />
          
          {/* Ilha de densidade urbana / contexto visual */}
          <circle cx={width * 0.48} cy={height * 0.52} r={Math.min(width, height) * 0.38} fill="#E1ECF4" opacity="0.7" />

          {/* Renderização dos Pinos das Unidades */}
          {pointsOnMap.map((p) => {
            if (!p.isVisibleInScope) return null;
            const isSelected = selectedService?.codigo === p.codigo;
            const isUbs = p.grupo === 'UBS / ESF';

            return (
              <g 
                key={p.codigo} 
                transform={`translate(${p.px}, ${p.py})`}
                onClick={() => setSelectedService(p)}
                style={{ cursor: 'pointer' }}
              >
                {/* Halo de Seleção */}
                {isSelected && (
                  <circle r="18" fill="var(--color-primary)" opacity="0.25" className="badge-status-dot" />
                )}
                
                {/* Círculo do Pino */}
                <circle 
                  r={isSelected ? "9" : "7"} 
                  fill={isUbs ? "#0B6B55" : "#08588E"} 
                  stroke="#FFFFFF" 
                  strokeWidth="2" 
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                />

                {/* Letra / Ícone identificador */}
                <text 
                  textAnchor="middle" 
                  dy="3" 
                  fill="#FFFFFF" 
                  fontSize="7" 
                  fontWeight="bold"
                >
                  {isUbs ? "+" : "H"}
                </text>

                {/* Rótulo Curto */}
                <text 
                  x="12" 
                  y="4" 
                  fontSize="10" 
                  fontWeight={isSelected ? "700" : "500"}
                  fill="var(--color-text-main)"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  paintOrder="stroke"
                >
                  {p.nome.replace('ESF ', '').replace('UBS ', '')}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Card Flutuante de Detalhes da Unidade Selecionada */}
        {selectedService && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            background: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--color-border)',
            maxWidth: '340px',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <span className="badge-version" style={{ background: selectedService.grupo === 'UBS / ESF' ? 'var(--color-accent-green-light)' : 'var(--color-primary-light)', color: selectedService.grupo === 'UBS / ESF' ? 'var(--color-accent-green)' : 'var(--color-primary)' }}>
                {selectedService.grupo}
              </span>
              <button 
                onClick={() => setSelectedService(null)}
                style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>

            <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: '4px' }}>
              {selectedService.nome}
            </h4>

            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
              Bairro: <strong>{selectedService.bairro || 'Sede'}</strong>
            </p>

            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-main)', marginBottom: '12px' }}>
              {selectedService.endereco}
            </p>

            <button 
              className="btn-header-rever"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => handleCopy(selectedService.endereco, selectedService.codigo)}
            >
              {copiedCode === selectedService.codigo ? (
                <>
                  <Check size={14} color="var(--color-success)" />
                  <span>Endereço Copiado!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copiar Endereço</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Lista / Tabela Acessível das Unidades */}
      <div style={{ marginTop: '24px' }}>
        <h4 style={{ fontSize: '1rem', color: 'var(--color-text-main)', marginBottom: '12px' }}>
          Lista das Unidades Encontradas ({filteredServices.length})
        </h4>

        <div style={{ maxHeight: '280px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
            <thead style={{ background: 'var(--color-bg-subtle)', position: 'sticky', top: 0 }}>
              <tr>
                <th style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)' }}>Unidade</th>
                <th style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)' }}>Tipo</th>
                <th style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)' }}>Bairro</th>
                <th style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)' }}>Endereço</th>
                <th style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)', textAlign: 'center' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((s, idx) => (
                <tr 
                  key={s.codigo} 
                  style={{ 
                    borderBottom: '1px solid var(--color-border-subtle)',
                    background: idx % 2 === 0 ? '#FFFFFF' : 'var(--color-bg-subtle)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedService(s)}
                >
                  <td style={{ padding: '8px 14px', fontWeight: 600, color: 'var(--color-primary-dark)' }}>{s.nome}</td>
                  <td style={{ padding: '8px 14px' }}>{s.grupo}</td>
                  <td style={{ padding: '8px 14px' }}>{s.bairro || '—'}</td>
                  <td style={{ padding: '8px 14px', color: 'var(--color-text-muted)' }}>{s.endereco}</td>
                  <td style={{ padding: '8px 14px', textAlign: 'center' }}>
                    <button 
                      title="Copiar endereço"
                      onClick={(e) => { e.stopPropagation(); handleCopy(s.endereco, s.codigo); }}
                      style={{ padding: '4px 8px', borderRadius: '4px', background: 'var(--color-bg-page)' }}
                    >
                      {copiedCode === s.codigo ? <Check size={12} color="var(--color-success)" /> : <Copy size={12} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
