# Mapas Temáticos — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preparar um módulo local reutilizável de mapas temáticos, com página própria e piloto da rede de saúde e serviços de referência, sem custo adicional.

**Architecture:** A página `/mapas-de-saude/` do portal carregará um catálogo e um visualizador Leaflet comum. As camadas do piloto serão derivadas separadamente dos dados públicos do painel, usando GDAL local para reprojeção. O resultado será servido como arquivos estáticos, com scripts, estilos e dados na mesma origem.

**Tech Stack:** Node.js nativo, HTML/CSS/JavaScript, Leaflet 1.9.4 distribuído localmente e GDAL/PROJ do QGIS 3.44.8 já instalado.

**Spec:** `docs/superpowers/specs/2026-10-10-mapas-tematicos-design.md`, no repositório `expansao/painel`.

## Global Constraints

- Requisito obrigatório: custo adicional zero.
- GeoJSON em EPSG:4326, com coordenadas em longitude/latitude. Originais projetados serão preservados.
- O piloto não faz requisições de recursos a serviços de mapas externos.
- JSON originais, projetos QGIS e conteúdo do painel não são modificados.
- Nenhuma contratação, mudança de plano, nova cobrança ou publicação externa ocorre na etapa local.
- Metadados, datas históricas e limitações acompanham todas as camadas. Valores ausentes não viram zero.
- O estado inicial exibe os 26 locais dos três grupos de saúde; os seis de referência são ativáveis.

## Review Focus

- Catálogo ou camada inválida: o visualizador explica a falha e preserva o acesso ao contexto e à lista dos locais.
- Atributos com HTML: a consulta apresenta texto literal, sem interpretar conteúdo dos dados como marcação.
- Valores ausentes e categorias desconhecidas: ausência explícita; categoria inválida impede uma publicação ambígua.
- Bases diferentes de `/`: todos os recursos de mapas e links continuam dentro da base configurada.
- Celular e muitos controles: mapa, legenda, filtros e lista permanecem utilizáveis sem sobreposição nem rolagem horizontal.

## Área de trabalho e arquivos

Implementar num checkout isolado do portal, criado a partir do commit local `1daa8b10b94b56bd5d915358dac77ad1f70f47ed`. Usar uma pasta dentro do workspace, preferencialmente `expansao/mapas-piloto`, e a fonte absoluta de `expansao/painel` nos testes. Reaproveitar um checkout adequado caso já exista. Não criar projetos externos.

Arquivos do portal a criar:

- `maps/lib/theme-model.mjs`: validação do catálogo, camadas e regras visuais; busca e filtros puros.
- `maps/lib/render-page.mjs`: HTML da área de mapas, catálogo, controles, lista e metadados, com escape de texto.
- `maps/data/catalogue.json`: catálogo inicial e configuração do único tema disponível.
- `maps/data/rede-servicos/`: camadas GeoJSON, metadados e relatório de procedência derivados.
- `maps/web/viewer.mjs`: inicialização do Leaflet, carregamento e interação com mapa/lista.
- `maps/web/maps.css`: apresentação responsiva e institucional.
- `maps/vendor/leaflet/`: distribuição 1.9.4, imagens referenciadas pelo CSS e licença.
- `scripts/prepare-maps.mjs`: preparação local dos derivados usando dados públicos existentes e GDAL.
- `scripts/preview-maps.mjs`: servidor local de revisão e montagem da prévia com o painel compilado existente.
- `docs/mapas/FLUXO-QGIS.md`: instruções locais de produção, exportação, metadados e inclusão de temas.
- `tests/maps-data.test.mjs`, `tests/maps-model.test.mjs`, `tests/maps-page.test.mjs`: verificações de dados, reutilização, falhas e integração.

Modificar apenas o necessário em `scripts/build.mjs`, `package.json`, `.gitignore`, `README.md` e, se necessário, nos estilos compartilhados do portal. O publicador não receberá uma referência de produção nova nesta etapa.

## Task 1: Dados do piloto e procedência

**Files:** criar `scripts/prepare-maps.mjs`, `maps/data/rede-servicos/*`, `tests/maps-data.test.mjs`.

**Interfaces:**
- Consumes: `panelDir/public/data/mapa-servicos.json`, consultas `rede_geografica` e `mapa_contexto`.
- Produces: `prepareMapTheme({sourceFile, outputDir, ogrPath, preparedAt}) -> Promise<{metadata, files}>`; arquivos `locais.geojson`, `municipio.geojson`, `urbano.geojson`, `municipios.geojson`, `estados.geojson`, `metadata.json`, `provenance.json`.
- `metadata` contém título, fonte original, período, limitações, CRS de origem/publicação e grupos. `provenance` contém hashes de origem/derivados e contagens por grupo.

- [ ] Criar testes de procedência e preservação: 32 pontos, mesmos códigos e atributos públicos, grupos 18/5/3/4/2, ausência preservada, hash da origem idêntico antes/depois. Rejeitar coordenadas não finitas e códigos duplicados.
- [ ] Rodar `node --test tests/maps-data.test.mjs`; confirmar falha pela ausência da rotina ou dos derivados.
- [ ] Implementar preparação em EPSG:4326 com `ogr2ogr.exe`, sem leitura de atributos adicionais dos GeoPackages originais. Para a origem já sanitizada, construir as geometrias com `x/y` e preservar os dez campos públicos existentes; obter as geometrias de contexto de `mapa_contexto`.
- [ ] Conferir o ponto A01 com a referência transformada independentemente pelo GDAL a partir do GeoPackage: longitude `-46.902082006867`, latitude `-16.336028001428`, tolerância `0.000001` grau por eixo. GeoJSON publicado não declara o CRS UTM.
- [ ] Rodar os testes com os derivados reais e conferir todos os hashes e contagens. Registrar a consulta documental de 09/09/2026 separadamente da data de preparação.
- [ ] Registrar o conjunto concluído em um commit local.

GDAL disponível em `C:/Program Files/QGIS 3.44.8/bin/ogr2ogr.exe`; PROJ em `C:/Program Files/QGIS 3.44.8/share/proj`; GDAL_DATA em `C:/Program Files/QGIS 3.44.8/apps/gdal/share/gdal`. Não exigir essas ferramentas no navegador ou na hospedagem.

## Task 2: Catálogo reutilizável e regras de apresentação

**Files:** criar `maps/lib/theme-model.mjs`, `maps/data/catalogue.json`, `tests/maps-model.test.mjs`.

**Interfaces:**
- Consumes: metadados e arquivos da Task 1.
- Produces: `validateCatalogue(catalogue) -> catalogue`, `validateLayer(layer, geojson) -> geojson`, `filterFeatures(features, {search, groups}) -> Feature[]`, `styleForFeature(feature, layer) -> Object`.
- Catálogo: `{schemaVersion:1, themes:[{id,title,description,status,metadataPath,layers}]}`.
- Camada: `{id,label,path,geometryTypes,kind,visible,group,style,popupFields}`; `kind` será `points` ou `context`. Estilo temático opcional: `{field,classes:[{min,max,color,label}],missing:{color,label}}`, com faixa inferior inclusiva e superior exclusiva; último máximo pode ser nulo.

- [ ] Criar testes com o tema real: três grupos de saúde inicialmente visíveis, dois de referência desativados; busca sem distinguir acentos; camadas com caminhos locais válidos. Incluir uma segunda configuração apenas na fixture de teste para comprovar reutilização sem anunciar um segundo mapa público.
- [ ] Incluir testes de rejeição para caminho externo/traversal, identificador duplicado, grupo não configurado e geometria incompatível. Verificar valores nulos e ausentes na classe “Sem informação”, sem conversão para zero.
- [ ] Rodar `node --test tests/maps-model.test.mjs` e confirmar falha inicial.
- [ ] Implementar as interfaces puras e cadastrar “Rede de saúde e serviços de referência” como único tema disponível, identificado como piloto local.
- [ ] Rodar os testes e registrar o conjunto concluído em um commit local.

## Task 3: Página própria e visualizador Leaflet

**Files:** criar `maps/lib/render-page.mjs`, `maps/web/viewer.mjs`, `maps/web/maps.css`, `maps/vendor/leaflet/*`, `tests/maps-page.test.mjs`; modificar `scripts/build.mjs`.

**Interfaces:**
- Consumes: catálogo e funções da Task 2, GeoJSON e metadados da Task 1.
- Produces: `renderMapsPage({catalogue, basePath}) -> string` e `initMapsViewer({root, catalogue, basePath}) -> Promise<{destroy}>`.
- O build copia a área pública para `mapas-de-saude/` e injeta os scripts/estilos somente na página de mapas. Mantém `buildPortal(options)` compatível com seus chamadores atuais.

- [ ] Criar testes que geram o portal com base `/` e `/homologacao/`, conferem catálogo, título, arquivos locais, licença, links de download, lista inicial e notas metodológicas. Exigir texto escapado em campos com `<script>` e rejeitar URLs externas de recursos do mapa.
- [ ] Rodar `node --test tests/maps-page.test.mjs` e confirmar falha inicial.
- [ ] Obter gratuitamente a distribuição oficial Leaflet 1.9.4, armazenar versão, licença e hashes. Incluir todos os recursos necessários localmente; nenhuma CDN no HTML/CSS/JavaScript do piloto.
- [ ] Implementar página institucional com catálogo e visualizador. Controles: busca, cinco grupos, contexto, município/sede urbana, zoom, lista e legenda. Três grupos de saúde começam ativos. Usar `textContent` ou nós DOM nos dados das consultas.
- [ ] Implementar carregamento explícito e estados de erro por camada. Lista e metadados são gerados no HTML e permanecem acessíveis com JavaScript indisponível. Falha do Leaflet preserva esse conteúdo e informa o problema.
- [ ] Garantir que mapa/lista compartilhem busca, grupos e seleção; filtros podem produzir zero resultados com mensagem clara. Ponto selecionado fica visível e o popup mostra observação e qualidade da localização.
- [ ] Rodar os testes da página e os testes existentes do portal. Registrar o conjunto concluído em um commit local.

## Task 4: Prévia local, revisão e fluxo do QGIS

**Files:** criar `scripts/preview-maps.mjs`, `docs/mapas/FLUXO-QGIS.md`; modificar `package.json`, `.gitignore` e `README.md`; gerar evidências fora da raiz publicada.

**Interfaces:**
- Consumes: build do portal e pacote compilado existente do painel, sem modificar os originais.
- Produces: `npm run preview:mapas -- --panel=CAMINHO --legacy=PACOTE --port=4174`, com servidor vinculado apenas a `127.0.0.1`. Saída local mostra o endereço de `/mapas-de-saude/`.

- [ ] Montar a prévia em uma pasta de saída própria, copiando o pacote existente e sobrepondo somente as páginas/recursos do novo portal. Conferir que a cópia do painel mantém os hashes de dados. Servidor deve normalizar caminhos, impedir traversal e definir MIME correto para GeoJSON, scripts, imagens e CSS.
- [ ] Rodar a suíte completa do portal com `PANEL_SOURCE` apontando para a fonte verificada. No sandbox Windows, usar diretório temporário dentro do checkout para evitar o erro de renomeação observado no TEMP padrão.
- [ ] Abrir a prévia local e conferir interações reais: 26 locais de saúde iniciais, 32 ao ativar as referências, busca, zero resultados, seleção de ponto/lista, popups, contexto, enquadramentos e downloads.
- [ ] Conferir larguras de 1440 px e 390 px, foco/teclado e inexistência de rolagem horizontal. Testar falha deliberada de uma camada na prévia e verificar mensagem, lista e metadados acessíveis. Capturar evidências da interface e das requisições, comprovando recursos locais.
- [ ] Verificar GeoJSON baixado, todos os links locais, hashes dos dados do painel e os limites gratuitos existentes no preparador Cloudflare, sem enviar pacote externo.
- [ ] Documentar como preparar vetores no QGIS, exportar GeoJSON longitude/latitude, registrar simbologia/metadados e acrescentar um tema ao catálogo. Explicar como dados ausentes são tratados e que uma mudança local exige nova publicação.
- [ ] Realizar revisão independente do resultado completo, corrigir problemas relevantes e repetir apenas as verificações afetadas. Registrar o conjunto concluído em um commit local.
- [ ] Entregar endereço da prévia, localização dos arquivos, resultados das verificações e limitações. A versão estará pronta para revisão; a publicação externa será uma etapa posterior específica.

## Execução proposta

Recomendação: implementação pelo próprio assistente neste chat, em checkout isolado, seguindo as quatro tarefas e com uma revisão independente ao final. As tarefas compartilham catálogo, camadas e DOM; executar essa sequência mantém a integração simples. A aprovação deste plano não autoriza contratação ou publicação externa.
