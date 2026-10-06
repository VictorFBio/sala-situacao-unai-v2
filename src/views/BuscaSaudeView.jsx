import React from 'react';
import { PageHeader, Note } from '../components/ui';
import BuscaSaudeMap from '../components/BuscaSaudeMap';

export default function BuscaSaudeView({ data, onRouteChange }) {
  const queries = data?.queries || {};
  const redeGeografica = queries.rede_geografica || { rows: [], source: {} };
  const mapaContexto = queries.mapa_contexto || { rows: [] };
  const territorioCenso = queries.territorio_censo || { rows: [] };
  const imagemSatMetadata = data?.imagemSatelite || null;

  return (
    <div className="container page">
      <PageHeader
        eyebrow="Módulo Georreferenciado"
        title="Busca Saúde: Rede de Estabelecimentos de Unaí"
        onRouteChange={onRouteChange}
      >
        Localização espacial, imagens orbitais de satélite (Sentinel-2) e endereços oficiais das 
        18 Unidades Básicas de Saúde (UBS/ESF) e 14 serviços complementares de saúde do município de Unaí - MG.
      </PageHeader>

      {/* Componente Cartográfico Interativo */}
      <BuscaSaudeMap 
        redeGeografica={redeGeografica}
        mapaContexto={mapaContexto}
        territorioCenso={territorioCenso}
        imagemSatMetadata={imagemSatMetadata}
      />

      <div style={{ marginTop: '24px' }}>
        <Note title="Notas Metodológicas da Cartografia Municipal">
          <ul>
            <li>As coordenadas dos 32 serviços foram georreferenciadas no acervo técnico QGIS em 09/09/2026 com projeção SIRGAS 2000 UTM Zone 23S (EPSG:31983).</li>
            <li>Trinta unidades localizam-se na janela da sede urbana de Unaí e duas em distritos rurais. Não equivale à totalidade dos 288 CNES cadastrados (que englobam consultórios privados, clínicas e laboratórios), mas sim à rede pública assistencial de referência.</li>
            <li>As imagens de satélite são ortomosaicos históricos Sentinel-2 L2A capturados pelo programa Copernicus da Agência Espacial Europeia (ESA).</li>
          </ul>
        </Note>
      </div>
    </div>
  );
}
