import React, { useState, useMemo, useId, useRef } from 'react';
import { 
  filtrarServicos, 
  projetarCamadas, 
  projetarFeicoes, 
  agruparMarcadores, 
  posicionarRaster, 
  centroAposZoom, 
  centroAposArrasto, 
  limitarCentroNoRaster, 
  geografiaNoPixel, 
  rotulosBairro, 
  rotulosMunicipaisVisiveis,
  gerarCSV
} from '../utils/dados-modelo';
import { DownloadCSV } from './ui';

const GRUPOS = {
  'UBS / ESF': { cor: '#08588E', simbolo: 'circle', label: 'UBS e Saúde da Família' },
  'Saúde especializada e gestão': { cor: '#137C70', simbolo: 'square', label: 'Saúde especializada e gestão' },
  'Urgência e emergência': { cor: '#B8493E', simbolo: 'cross', label: 'Urgência e emergência' },
  'Proteção social': { cor: '#966426', simbolo: 'diamond', label: 'Proteção social' },
  'Segurança pública': { cor: '#636B83', simbolo: 'triangle', label: 'Segurança pública' },
};

function Simbolo({ grupo, tamanho = 7 }) {
  const info = GRUPOS[grupo] || { cor: '#08588E', simbolo: 'circle' };
  const { cor, simbolo } = info;
  const r = tamanho;
  if (simbolo === 'square') return <rect x={-r} y={-r} width={r * 2} height={r * 2} rx="2" fill={cor} />;
  if (simbolo === 'cross') return <path d={`M${-r},${-r/3}H${-r/3}V${-r}H${r/3}V${-r/3}H${r}V${r/3}H${r/3}V${r}H${-r/3}V${r/3}H${-r}Z`} fill={cor} />;
  if (simbolo === 'diamond') return <path d={`M0,${-r-1}L${r+1},0L0,${r+1}L${-r-1},0Z`} fill={cor} />;
  if (simbolo === 'triangle') return <path d={`M0,${-r-1}L${r+1},${r}H${-r-1}Z`} fill={cor} />;
  return <circle r={r} fill={cor} />;
}

const CONTEXTO_BOUNDS = [199980, 8110000, 409820, 8255000];
const MAX_ZOOM = { entorno: 8, municipio: 8, urbano: 16 };

function limitesCidade(rows) {
  const pontos = rows.filter(r => !r.rural);
  if (!pontos.length) return CONTEXTO_BOUNDS;
  return [
    Math.min(...pontos.map(p => p.x)) - 900,
    Math.min(...pontos.map(p => p.y)) - 900,
    Math.max(...pontos.map(p => p.x)) + 900,
    Math.max(...pontos.map(p => p.y)) + 900
  ];
}

function escalar(b, zoom, centro) {
  const cx = centro?.[0] ?? (b[0] + b[2]) / 2;
  const cy = centro?.[1] ?? (b[1] + b[3]) / 2;
  const dx = (b[2] - b[0]) / zoom / 2;
  const dy = (b[3] - b[1]) / zoom / 2;
  return [cx - dx, cy - dy, cx + dx, cy + dy];
}

function pontoSVG(event, svg) {
  const c = svg?.getScreenCTM?.();
  if (c && svg.createSVGPoint) {
    const p = svg.createSVGPoint();
    p.x = event.clientX;
    p.y = event.clientY;
    const r = p.matrixTransform(c.inverse());
    return [r.x, r.y];
  }
  const rect = svg?.getBoundingClientRect?.();
  return rect?.width && rect?.height 
    ? [(event.clientX - rect.left) * 700 / rect.width, (event.clientY - rect.top) * 480 / rect.height]
    : null;
}

function centroPares(a, b) {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

function distancia(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function rotulosSemColisao(rotulos, width, height) {
  const ocupados = [];
  const resultado = [];
  for (const r of [...rotulos].sort((a, b) => b.quantidade - a.quantidade || a.nome.localeCompare(b.nome, 'pt-BR'))) {
    const w = Math.min(150, Math.max(42, r.nome.length * 5.7 + 12));
    const h = 18;
    const opcoes = [[10, -h - 3], [10, 3], [-w - 10, -h - 3], [-w - 10, 3]];
    for (const [dx, dy] of opcoes) {
      const box = { x: r.px + dx, y: r.py + dy, w, h };
      if (box.x < 3 || box.y < 3 || box.x + box.w > width - 3 || box.y + box.h > height - 3) continue;
      if (ocupados.some(b => box.x < b.x + b.w + 3 && box.x + box.w + 3 > b.x && box.y < b.y + b.h + 2 && box.y + box.h + 2 > b.y)) continue;
      ocupados.push(box);
      resultado.push({ ...r, x: box.x, y: box.y, w });
      break;
    }
  }
  return resultado;
}

export default function BuscaSaudeMap({ 
  redeGeografica = { rows: [], source: {} }, 
  mapaContexto = { rows: [] }, 
  territorioCenso = { rows: [] },
  imagemSatMetadata = null,
  vistaInicial = 'municipio'
}) {
  const [vista, setVista] = useState(vistaInicial);
  const [fundo, setFundo] = useState('malha');
  const [zoom, setZoom] = useState(1);
  const [centro, setCentro] = useState(null);
  const [selecionado, setSelecionado] = useState(null);
  const [busca, setBusca] = useState('');
  const [grupoFiltro, setGrupoFiltro] = useState('all');
  const [rotulosAtivos, setRotulosAtivos] = useState(vistaInicial === 'urbano');

  const svgRef = useRef(null);
  const gesto = useRef({ pontos: new Map(), modo: null, suprimirClique: false });
  const uid = useId().replace(/:/g, '');

  const satMetadata = imagemSatMetadata || {
    acquisitionDate: '2026-08-21',
    overviewResolutionMeters: 40,
    resolutionMeters: 10,
    attribution: 'Copernicus Sentinel-2 L2A; processamento ESA; distribuição Earth Search / AWS Open Data',
    license: 'Copernicus Sentinel Data Terms and Conditions; acesso gratuito',
    bounds: {
      contexto: [199980, 8110000, 409820, 8255000],
      urbano: [295209.29, 8186775.08, 299548.25, 8197987.19]
    },
    tiles: []
  };

  const dataImagemSatelite = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })
    .format(new Date(`${satMetadata.acquisitionDate}T12:00:00Z`));

  const redeRows = redeGeografica.rows || [];
  const camadas = mapaContexto.rows || [];

  const parseGeo = (camadaNome) => {
    const row = camadas.find(r => r.camada === camadaNome);
    if (!row || !row.geometria) return { type: 'FeatureCollection', features: [] };
    try {
      return typeof row.geometria === 'string' ? JSON.parse(row.geometria) : row.geometria;
    } catch {
      return { type: 'FeatureCollection', features: [] };
    }
  };

  const municipio = useMemo(() => parseGeo('municipio'), [camadas]);
  const urbano = useMemo(() => parseGeo('urbano'), [camadas]);
  const municipios = useMemo(() => parseGeo('municipios'), [camadas]);
  const estados = useMemo(() => parseGeo('estados'), [camadas]);

  const largura = 700;
  const altura = 480;

  const base = useMemo(() => {
    return projetarCamadas(municipio, urbano, [], { width: largura, height: altura });
  }, [municipio, urbano]);

  const boundsPadrao = base?.bounds || CONTEXTO_BOUNDS;
  const b = vista === 'urbano' 
    ? limitesCidade(redeRows) 
    : vista === 'entorno' 
    ? CONTEXTO_BOUNDS 
    : boundsPadrao;

  const margemMapa = vista === 'entorno' ? 0 : 32;
  const filtrados = useMemo(() => {
    return filtrarServicos(redeRows, grupoFiltro, busca);
  }, [redeRows, grupoFiltro, busca]);

  const limitesVisiveis = useMemo(() => {
    return escalar(b, zoom, centro);
  }, [b, zoom, centro]);

  const mapa = useMemo(() => {
    return projetarCamadas(municipio, urbano, filtrados, {
      width: largura,
      height: altura,
      bounds: limitesVisiveis,
      padding: margemMapa
    }) || { limite: '', urbano: '', bounds: limitesVisiveis, metrosPorPixel: 100, pontos: [] };
  }, [municipio, urbano, filtrados, limitesVisiveis, margemMapa]);

  const imagemSatelite = fundo === 'satelite' ? './assets/satelite/sentinel2-contexto-regional.webp' : null;
  const satSedeUrbana = './assets/satelite/sentinel2-sede-urbana.webp';

  const posicaoImagem = useMemo(() => {
    if (!imagemSatelite || !satMetadata.bounds.contexto) return null;
    return posicionarRaster(satMetadata.bounds.contexto, mapa.bounds, largura, altura, margemMapa);
  }, [imagemSatelite, satMetadata, mapa.bounds, margemMapa]);

  const posicaoImagemUrbana = useMemo(() => {
    if (fundo !== 'satelite' || vista !== 'urbano' || !satMetadata.bounds.urbano) return null;
    return posicionarRaster(satMetadata.bounds.urbano, mapa.bounds, largura, altura, margemMapa);
  }, [fundo, vista, satMetadata, mapa.bounds, margemMapa]);

  const feicoesMunicipios = useMemo(() => {
    return vista === 'entorno' ? projetarFeicoes(municipios, limitesVisiveis, largura, altura, margemMapa) : [];
  }, [vista, municipios, limitesVisiveis, margemMapa]);

  const feicoesEstados = useMemo(() => {
    return vista === 'entorno' ? projetarFeicoes(estados, limitesVisiveis, largura, altura, margemMapa) : [];
  }, [vista, estados, limitesVisiveis, margemMapa]);

  const rotulosMunicipais = useMemo(() => {
    return rotulosMunicipaisVisiveis(feicoesMunicipios, largura, altura);
  }, [feicoesMunicipios]);

  const codigos = useMemo(() => new Set(mapa.pontos.map(p => p.codigo)), [mapa.pontos]);
  const visiveis = useMemo(() => filtrados.filter(p => codigos.has(p.codigo)), [filtrados, codigos]);

  const atual = visiveis.find(p => p.codigo === selecionado) || null;
  const grupos = useMemo(() => agruparMarcadores(mapa.pontos, 20), [mapa.pontos]);

  const rotulosBairros = useMemo(() => {
    if (!rotulosAtivos || vista !== 'urbano') return [];
    return rotulosSemColisao(rotulosBairro(mapa.pontos), largura, altura);
  }, [rotulosAtivos, vista, mapa.pontos]);

  const trocarVista = (v) => {
    setVista(v);
    setZoom(1);
    setCentro(null);
    setSelecionado(null);
    setRotulosAtivos(v === 'urbano');
    gesto.current.modo = null;
    gesto.current.pontos.clear();
  };

  const aproximar = (g) => {
    const pts = g.pontos;
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    if (vista !== 'urbano' && pts.every(p => !p.rural)) {
      trocarVista('urbano');
      setSelecionado(pts[0].codigo);
      return;
    }
    const z = Math.min(zoom * 2, MAX_ZOOM[vista]);
    setZoom(z);
    setCentro(limitarCentroNoRaster(b, z, [cx, cy], satMetadata.bounds.contexto));
    setSelecionado(pts[0].codigo);
  };

  const zoomPara = (z, pixel = [largura / 2, altura / 2]) => {
    const novo = Math.max(1, Math.min(MAX_ZOOM[vista], z));
    if (novo === zoom) return;
    const c = centroAposZoom(b, zoom, centro, pixel, novo, largura, altura, margemMapa);
    setZoom(novo);
    if (c) setCentro(limitarCentroNoRaster(b, novo, c, satMetadata.bounds.contexto));
  };

  const deslocar = (dx, dy) => {
    const bb = mapa.bounds;
    const next = [
      ((bb[0] + bb[2]) / 2) + dx * (bb[2] - bb[0]) * 0.25,
      ((bb[1] + bb[3]) / 2) + dy * (bb[3] - bb[1]) * 0.25
    ];
    setCentro(limitarCentroNoRaster(b, zoom, next, satMetadata.bounds.contexto));
  };

  const iniciarGesto = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const pixel = pontoSVG(e, svgRef.current);
    if (!pixel) return;
    const g = gesto.current;
    g.suprimirClique = false;
    g.pontos.set(e.pointerId, pixel);
    try { e.target.setPointerCapture(e.pointerId); } catch {}
    if (g.pontos.size === 1) {
      g.modo = {
        tipo: 'arrasto',
        id: e.pointerId,
        inicio: pixel,
        centro: centro ?? [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2],
        metrosPorPixel: mapa.metrosPorPixel,
        movido: false
      };
    }
    if (g.pontos.size >= 2) {
      const pares = [...g.pontos.entries()].slice(0, 2);
      const meio = centroPares(pares[0][1], pares[1][1]);
      g.modo = {
        tipo: 'pinça',
        ids: pares.map(p => p[0]),
        distancia: Math.max(1, distancia(pares[0][1], pares[1][1])),
        meio,
        centro: centro ?? [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2],
        zoom,
        ancora: geografiaNoPixel(limitesVisiveis, meio, largura, altura, margemMapa),
        metrosPorPixel: mapa.metrosPorPixel,
        movido: false
      };
    }
  };

  const moverGesto = (e) => {
    const g = gesto.current;
    if (!g.pontos.has(e.pointerId)) return;
    const pixel = pontoSVG(e, svgRef.current);
    if (!pixel) return;
    g.pontos.set(e.pointerId, pixel);
    if (g.modo?.tipo === 'arrasto') {
      const m = g.modo;
      const delta = [pixel[0] - m.inicio[0], pixel[1] - m.inicio[1]];
      if (Math.hypot(...delta) > 4) m.movido = true;
      if (m.movido) {
        const next = centroAposArrasto(m.centro, delta, m.metrosPorPixel);
        if (next) setCentro(limitarCentroNoRaster(b, zoom, next, satMetadata.bounds.contexto));
      }
    } else if (g.modo?.tipo === 'pinça') {
      const m = g.modo;
      const p1 = g.pontos.get(m.ids[0]);
      const p2 = g.pontos.get(m.ids[1]);
      if (!p1 || !p2) return;
      const meio = centroPares(p1, p2);
      const z = Math.max(1, Math.min(MAX_ZOOM[vista], m.zoom * distancia(p1, p2) / m.distancia));
      if (distancia(meio, m.meio) > 2 || Math.abs(z - m.zoom) > 0.02) m.movido = true;
      const escalaNova = (1 / m.metrosPorPixel) * z / m.zoom;
      if (m.ancora && escalaNova > 0) {
        const next = [m.ancora[0] - (meio[0] - largura / 2) / escalaNova, m.ancora[1] + (meio[1] - altura / 2) / escalaNova];
        setZoom(z);
        setCentro(limitarCentroNoRaster(b, z, next, satMetadata.bounds.contexto));
      }
    }
    if (g.modo?.movido) e.preventDefault();
  };

  const finalizarGesto = (e) => {
    const g = gesto.current;
    const modo = g.modo;
    if (!g.pontos.has(e.pointerId)) return;
    g.pontos.delete(e.pointerId);
    if (modo?.movido) {
      g.suprimirClique = true;
      setTimeout(() => { g.suprimirClique = false; }, 350);
    }
    if (g.pontos.size === 1) {
      const [id, pixel] = [...g.pontos.entries()][0];
      g.modo = {
        tipo: 'arrasto',
        id,
        inicio: pixel,
        centro: centro ?? [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2],
        metrosPorPixel: mapa.metrosPorPixel,
        movido: false
      };
    } else {
      g.modo = null;
    }
  };

  const cliqueCapturado = (e) => {
    if (gesto.current.suprimirClique) {
      e.preventDefault();
      e.stopPropagation();
      gesto.current.suprimirClique = false;
    }
  };

  const rodaMapa = (e) => {
    e.preventDefault();
    const pixel = pontoSVG(e, svgRef.current);
    if (pixel) zoomPara(zoom * Math.exp(-e.deltaY * 0.0015), pixel);
  };

  const escalaAlvo = mapa.metrosPorPixel * 110;
  const expo = 10 ** Math.floor(Math.log10(escalaAlvo));
  const escala = [1, 2, 5, 10].map(x => x * expo).filter(x => x <= escalaAlvo).at(-1) || 1000;
  const pxEscala = escala / mapa.metrosPorPixel;
  const maxZoom = MAX_ZOOM[vista];

  const handleCopiarEndereco = (endereco) => {
    if (!endereco) return;
    navigator.clipboard?.writeText?.(endereco);
  };

  return (
    <div className="map-card" aria-label="Mapa da rede de serviços de saúde de Unaí">
      {/* Barra Superior de Controles e Filtros */}
      <div className="map-bar">
        <div className="map-bar-group">
          {/* Seletor de Enquadramento */}
          <div className="segmented" role="group" aria-label="Enquadramento do mapa">
            <button 
              type="button" 
              aria-pressed={vista === 'municipio'} 
              onClick={() => trocarVista('municipio')}
            >
              Município inteiro
            </button>
            <button 
              type="button" 
              aria-pressed={vista === 'urbano'} 
              onClick={() => trocarVista('urbano')}
            >
              Sede urbana
            </button>
            <button 
              type="button" 
              aria-pressed={vista === 'entorno'} 
              onClick={() => trocarVista('entorno')}
            >
              Entorno regional
            </button>
          </div>

          {/* Seletor de Fundo: Malha vs Satélite Sentinel-2 */}
          <div className="segmented" role="group" aria-label="Fundo do mapa">
            <button 
              type="button" 
              aria-pressed={fundo === 'malha'} 
              onClick={() => setFundo('malha')}
            >
              Malha
            </button>
            <button 
              type="button" 
              aria-pressed={fundo === 'satelite'} 
              onClick={() => setFundo('satelite')}
            >
              Satélite
            </button>
          </div>

          {/* Toggle de bairros (disponível na vista urbana) */}
          {vista === 'urbano' && (
            <label className="check-inline">
              <input 
                type="checkbox" 
                checked={rotulosAtivos} 
                onChange={(e) => setRotulosAtivos(e.target.checked)} 
              />
              Nomes de bairros nos endereços
            </label>
          )}
        </div>

        {/* Filtro por tipo de serviço */}
        <div className="chart-select">
          <label htmlFor={`${uid}-grupo`}>Tipo de serviço:</label>
          <select 
            id={`${uid}-grupo`} 
            value={grupoFiltro} 
            onChange={(e) => setGrupoFiltro(e.target.value)}
          >
            <option value="all">Todos os serviços ({redeRows.length})</option>
            {Object.entries(GRUPOS).map(([gKey, gInfo]) => (
              <option key={gKey} value={gKey}>{gInfo.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Barra de Busca de Localidade */}
      <div className="map-search">
        <label htmlFor={`${uid}-busca`}>Buscar local:</label>
        <input 
          id={`${uid}-busca`} 
          type="search" 
          placeholder="Nome, bairro ou endereço..." 
          value={busca} 
          onChange={(e) => setBusca(e.target.value)} 
        />
        <span role="status">
          {visiveis.length} {visiveis.length === 1 ? 'local' : 'locais'} nesta vista
        </span>
        {busca && (
          <button 
            type="button" 
            onClick={() => setBusca('')}
            style={{ border: 'none', background: 'transparent', color: 'var(--blue)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
          >
            Limpar busca
          </button>
        )}
      </div>

      {/* Corpo Principal: SVG Canvas + Painel Lateral */}
      <div className="map-body">
        <div>
          <div className="map-canvas" data-fundo={fundo}>
            {/* Rótulo Superior Esquerdo de Localização */}
            <div className="map-rotulo">
              <strong>{vista === 'entorno' ? 'ENTORNO DE UNAÍ' : 'UNAÍ'}</strong>
              <span>
                {vista === 'municipio' 
                  ? 'Território municipal' 
                  : vista === 'urbano' 
                  ? 'Sede urbana · entorno dos serviços' 
                  : 'Municípios vizinhos · MG, GO e DF'}
              </span>
            </div>

            {/* Canvas SVG Interativo */}
            <svg 
              ref={svgRef} 
              viewBox={`0 0 ${largura} ${altura}`} 
              role="group" 
              aria-label={`Mapa de Unaí e do entorno, ${visiveis.length} locais nesta vista. Arraste para mover, use a roda ou o gesto de pinça para aproximar.`} 
              onWheel={rodaMapa} 
              onPointerDown={iniciarGesto} 
              onPointerMove={moverGesto} 
              onPointerUp={finalizarGesto} 
              onPointerCancel={finalizarGesto} 
              onClickCapture={cliqueCapturado}
            >
              <defs>
                <clipPath id={`${uid}-recorte`}>
                  <rect width={largura} height={altura} />
                </clipPath>
                <pattern id={`${uid}-grade`} width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M50 0H0V50" fill="none" stroke="currentColor" strokeWidth=".5" />
                </pattern>
              </defs>

              {fundo === 'malha' && (
                <rect width={largura} height={altura} fill={`url(#${uid}-grade)`} className="map-grid" />
              )}

              <g clipPath={`url(#${uid}-recorte)`}>
                {/* Imagens Sentinel-2 Satélite (Contexto Regional e Sede Urbana) */}
                {imagemSatelite && posicaoImagem && (
                  <image 
                    href={imagemSatelite} 
                    x={posicaoImagem.x} 
                    y={posicaoImagem.y} 
                    width={posicaoImagem.width} 
                    height={posicaoImagem.height} 
                    preserveAspectRatio="none" 
                    className="map-sat-img" 
                    aria-hidden="true" 
                  />
                )}
                {posicaoImagemUrbana && (
                  <image 
                    href={satSedeUrbana} 
                    x={posicaoImagemUrbana.x} 
                    y={posicaoImagemUrbana.y} 
                    width={posicaoImagemUrbana.width} 
                    height={posicaoImagemUrbana.height} 
                    preserveAspectRatio="none" 
                    className="map-sat-img" 
                    aria-hidden="true" 
                  />
                )}

                {/* Camadas Vetoriais IBGE: Estados, Municípios Vizinhos e Malha Municipal */}
                {feicoesEstados.map(f => (
                  <path key={`uf-${f.uf}`} d={f.path} className="map-uf" data-uf={f.uf} fillRule="evenodd" />
                ))}
                {feicoesMunicipios.map(f => (
                  <path key={`municipio-${f.uf}-${f.nome}`} d={f.path} className="map-vizinho" data-uf={f.uf} fillRule="evenodd" />
                ))}

                <path d={mapa.limite} className="map-limite" fillRule="evenodd" />
                <path d={mapa.urbano} className="map-urbano" fillRule="evenodd" />

                {rotulosMunicipais.map(f => (
                  <text key={`nome-${f.uf}-${f.nome}`} x={f.px} y={f.py} textAnchor="middle" className={`map-nome-mun ${f.nome === 'Unaí' ? 'is-unai' : ''}`}>
                    {f.nome}
                  </text>
                ))}

                {/* Marcadores e Clusters das Unidades de Saúde */}
                {grupos.map(g => {
                  const p = g.pontos[0];
                  const cluster = g.pontos.length > 1;
                  const ativo = g.pontos.some(item => item.codigo === selecionado);
                  const nome = cluster ? `${g.pontos.length} locais próximos. Clique para aproximar` : p.nome;

                  return (
                    <g 
                      key={p.codigo} 
                      className={`map-marker ${ativo ? 'is-selected' : ''}`} 
                      transform={`translate(${g.px} ${g.py})`} 
                      role="button" 
                      tabIndex="0" 
                      aria-label={nome} 
                      aria-pressed={ativo} 
                      onClick={() => cluster ? aproximar(g) : setSelecionado(p.codigo)} 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          cluster ? aproximar(g) : setSelecionado(p.codigo);
                        }
                      }}
                    >
                      <title>{cluster ? nome : `${p.nome} · ${p.grupo} · localização aproximada`}</title>
                      <circle r={cluster ? 19 : 15} className="map-halo" />
                      {cluster ? (
                        <>
                          <circle r="15" fill="#08588E" />
                          <text textAnchor="middle" dy=".35em" className="map-num">{g.pontos.length}</text>
                        </>
                      ) : (
                        <Simbolo grupo={p.grupo} />
                      )}
                      {!cluster && vista === 'municipio' && p.rural && (
                        <text x="20" y="4" className="map-localidade">{p.nome.replace('ESF ', '')}</text>
                      )}
                    </g>
                  );
                })}

                {/* Rótulos dos Bairros */}
                {rotulosBairros.map(r => (
                  <g key={`bairro-${r.nome}`} className="map-bairro" pointerEvents="none" aria-label={`${r.nome}, informado em ${r.quantidade} endereço${r.quantidade === 1 ? '' : 's'}`}>
                    <rect x={r.x} y={r.y} width={r.w} height="18" rx="2" />
                    <text x={r.x + 6} y={r.y + 12}>{r.nome}</text>
                  </g>
                ))}
              </g>

              {/* Indicador do Norte Cartográfico */}
              <g transform={`translate(${largura - 35} 40)`} aria-label="Norte da quadrícula">
                <path d="M0 22V-8m0 0-5 8m5-8 5 8" fill="none" stroke="currentColor" strokeWidth="2" />
                <text y="-14" textAnchor="middle" fontSize="13" fontWeight="bold">N</text>
              </g>

              {/* Barra de Escala Dinâmica */}
              <g transform={`translate(25 ${altura - 26})`} aria-label={`Escala: ${escala} metros`}>
                <rect x="-7" y="-23" width={pxEscala + 22} height="36" rx="2" className="map-escala-fundo" />
                <path d={`M0 -5V0H${pxEscala}V-5`} stroke="currentColor" strokeWidth="2" fill="none" />
                <text y="-9" fontSize="11" fontWeight="600">{escala >= 1000 ? `${escala / 1000} km` : `${escala} m`}</text>
              </g>
            </svg>

            {/* Controles de Navegação de Zoom (+, -, reset) */}
            <div className="map-nav" aria-label="Navegação do mapa">
              <button type="button" aria-label="Ampliar mapa" disabled={zoom >= maxZoom} onClick={() => zoomPara(zoom * 2)}>+</button>
              <button type="button" aria-label="Reduzir mapa" disabled={zoom <= 1} onClick={() => zoomPara(zoom / 2)}>−</button>
              <button type="button" aria-label="Restaurar enquadramento" onClick={() => { setZoom(1); setCentro(null); }}>↺</button>
            </div>

            {/* Controles de Deslocamento Pan */}
            {zoom > 1 && (
              <div className="map-pan" role="group" aria-label="Mover mapa">
                <button type="button" aria-label="Mover para oeste" onClick={() => deslocar(-1, 0)}>←</button>
                <button type="button" aria-label="Mover para norte" onClick={() => deslocar(0, 1)}>↑</button>
                <button type="button" aria-label="Mover para sul" onClick={() => deslocar(0, -1)}>↓</button>
                <button type="button" aria-label="Mover para leste" onClick={() => deslocar(1, 0)}>→</button>
              </div>
            )}
          </div>

          {/* Legenda dos Símbolos e Camadas */}
          <div className="map-legenda" aria-label="Legenda do mapa">
            {Object.entries(GRUPOS).map(([grupo, g]) => (
              <span key={grupo}>
                <svg viewBox="-12 -12 24 24" aria-hidden="true">
                  <Simbolo grupo={grupo} tamanho={6} />
                </svg>
                {g.label}
              </span>
            ))}
            <span><i style={{ border: '1px solid #9FBCD2', background: '#D6E4EF' }} /> Área urbanizada · IBGE 2019</span>
            {vista === 'entorno' && (
              <>
                <span><i style={{ borderTop: '1.5px solid #718B9B', background: 'transparent' }} /> Limites municipais · IBGE 2025</span>
                <span><i style={{ borderTop: '2px dashed #A5683F', background: 'transparent' }} /> Estados: MG, GO e DF</span>
              </>
            )}
          </div>

          <p className="map-hint">
            {grupos.some(g => g.pontos.length > 1) ? 'Os números agrupam locais próximos. Clique no círculo para aproximar. ' : 'Clique em um símbolo no mapa ou na lista ao lado para ver o endereço. '}
            Arraste para mover; use a roda do mouse ou pinça para ampliar. A área azul é referência estatística urbana do IBGE.
            {vista === 'urbano' && rotulosAtivos ? ' Os bairros são os informados nos endereços oficiais cadastrados.' : ''}
          </p>

          {/* Proveniência e Créditos da Imagem de Satélite */}
          {fundo === 'satelite' && (
            <div className="map-credit">
              <span>
                Imagem Sentinel‑2 L2A de <strong>{dataImagemSatelite}</strong> · Resolução regional: {satMetadata.overviewResolutionMeters} m; sede urbana: {satMetadata.resolutionMeters} m. Imagem histórica de sensoriamento remoto, não em tempo real.
              </span>
              <details>
                <summary>Créditos técnicos e proveniência</summary>
                <p style={{ marginTop: '4px', fontSize: '0.74rem' }}>
                  {satMetadata.attribution}. {satMetadata.license}
                </p>
                {satMetadata.tiles && satMetadata.tiles.length > 0 && (
                  <ul>
                    {satMetadata.tiles.map(t => (
                      <li key={t.id}>
                        <a href={t.url} target="_blank" rel="noopener noreferrer">{t.id}</a> · SHA-256: <code>{t.sha256.slice(0, 16)}...</code>
                      </li>
                    ))}
                  </ul>
                )}
              </details>
            </div>
          )}
        </div>

        {/* Painel Lateral: Detalhes da Unidade Selecionada ou Lista de Locais */}
        <aside className="map-panel" aria-label="Consulta dos serviços">
          {atual ? (
            <div className="map-detail" aria-live="polite">
              <div className="map-detail-top">
                <span>{atual.codigo} · {GRUPOS[atual.grupo]?.label || atual.grupo}</span>
                <button type="button" aria-label="Fechar detalhes do local" onClick={() => setSelecionado(null)}>×</button>
              </div>
              <h3>{atual.nome}</h3>
              <dl>
                <dt>Endereço</dt>
                <dd>{atual.endereco || 'Não informado na base'}</dd>
                <dt>Bairro ou localidade</dt>
                <dd>{atual.bairro || 'Sede'}</dd>
                <dt>Referência de Coleta</dt>
                <dd>Consulta oficial em setembro de 2026</dd>
              </dl>
              <p className="caveat">Localização aproximada · validação em campo contínua</p>
              {atual.observacao && <p className="obs">{atual.observacao}</p>}
              <div style={{ marginTop: '12px' }}>
                <button 
                  type="button" 
                  className="btn-download" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => handleCopiarEndereco(atual.endereco)}
                >
                  Copiar endereço
                </button>
              </div>
            </div>
          ) : (
            <div className="map-invite">
              <span>Consulta por local</span>
              <h3>Onde estão os serviços?</h3>
              <p>Selecione um ponto no mapa ou clique em um local na lista abaixo para consultar endereço e referências.</p>
            </div>
          )}

          <div className="map-list-title">
            <strong>Locais nesta vista</strong>
            <span>{visiveis.length} de {redeRows.length}</span>
          </div>

          {visiveis.length > 0 ? (
            <ul className="map-list">
              {visiveis.map(p => (
                <li key={p.codigo}>
                  <button 
                    type="button" 
                    aria-pressed={selecionado === p.codigo} 
                    onClick={() => setSelecionado(p.codigo)}
                  >
                    <svg viewBox="-12 -12 24 24" aria-hidden="true">
                      <Simbolo grupo={p.grupo} />
                    </svg>
                    <span className="t">
                      <strong>{p.nome}</strong>
                      <small>{p.bairro || p.grupo}</small>
                    </span>
                    <span className="cod">{p.codigo}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="map-empty">
              Nenhum serviço encontrado nesta vista. Ajuste a busca, selecione outro grupo ou redefina o enquadramento.
            </div>
          )}
        </aside>
      </div>

      {/* Rodapé do Mapa com Metadados e Botão Baixar CSV */}
      <div className="map-foot">
        <div>
          <span>Limite municipal e entorno: IBGE 2025 | Área urbanizada: IBGE 2019 | Projeção SIRGAS 2000 UTM 23S (EPSG:31983)</span>
        </div>
        <div>
          <DownloadCSV 
            rows={visiveis} 
            source={redeGeografica.source || { label: 'Cadastro Técnico QGIS / SMS Unaí', period: '09/09/2026' }} 
            queryId="rede_geografica" 
            label="Baixar locais desta vista (CSV)" 
          />
        </div>
      </div>
    </div>
  );
}
