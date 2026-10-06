import React from 'react';
import { ArrowLeft, MapPin, Info } from 'lucide-react';
import BuscaSaudeMap from '../components/BuscaSaudeMap';

export default function BuscaSaudeView({ data, onRouteChange }) {
  const mapaData = data?.mapa || {};
  const services = mapaData.queries?.rede_geografica?.rows || [];

  return (
    <div className="container" style={{ padding: '32px 24px' }}>
      {/* Navegação Superior */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          className="btn-header-rever"
          onClick={() => onRouteChange('#/')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={14} />
          <span>Voltar para a Página Inicial</span>
        </button>
      </div>

      {/* Cabeçalho */}
      <div style={{ marginBottom: '28px' }}>
        <span className="badge-version" style={{ marginBottom: '8px' }}>
          <MapPin size={13} />
          Módulo Georreferenciado
        </span>
        <h2 style={{ fontSize: '2rem', color: 'var(--color-primary-dark)', marginBottom: '6px' }}>
          Busca Saúde: Rede de Estabelecimentos de Unaí
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', maxWidth: '820px' }}>
          Localização espacial e endereços oficiais das 18 Unidades Básicas de Saúde (UBS/ESF) 
          e 14 serviços complementares de saúde do município de Unaí - MG.
        </p>
      </div>

      {/* Mapa Interativo de Serviços */}
      <BuscaSaudeMap services={services} />

      {/* Metadados Cartográficos */}
      <div style={{ background: 'var(--color-bg-subtle)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--color-primary-dark)', fontWeight: 700 }}>
          <Info size={16} />
          <span>Notas Metodológicas da Cartografia Municipal</span>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
          As coordenadas dos 32 serviços foram extraídas do acervo técnico QGIS em 09/09/2026 com projeção SIRGAS 2000 UTM Zone 23S (EPSG:31983). Trinta unidades localizam-se na janela da sede urbana de Unaí e duas em distritos rurais. Não equivale à totalidade dos 288 CNES cadastrados (que englobam clínicas privadas, consultórios e laboratórios), mas sim à rede pública assistencial de referência.
        </p>
      </div>
    </div>
  );
}
