# Dicionário de Dados e Metadados — Sala de Situação de Unaí V2

Este documento cataloga os indicadores, fontes oficiais, períodos e limitações metodológicas dos dados consolidados na versão 2.

---

## 1. Demografia e Território
- **População Residente**: 86.619 pessoas (Censo 2022).
  - *Fonte:* IBGE, Censo Demográfico 2022, tabela 4714, variável 93.
  - *Limitação:* Retrato censitário de 2022; não representa projeções contínuas de 2026.
- **Faixas Etárias**:
  - 0 a 14 anos: 16.803 pessoas (19,4% da população).
  - 60 anos ou mais: 12.646 pessoas (14,6% da população).
  - *Fonte:* IBGE, tabela 9514, variável 93.
- **Território**:
  - Área municipal: 8.447 km² (IBGE 2025).
  - Densidade demográfica: ~10,25 hab/km².

---

## 2. Rede Assistencial (CNES)
- **Total de Estabelecimentos Ativos**: 288 estabelecimentos.
  - *Fonte:* Cadastro Nacional de Estabelecimentos de Saúde (CNES), consulta em 29/09/2026.
  - *Limitação:* Inclui clínicas privadas, laboratórios, consultórios e serviços públicos; não afere capacidade operacional exclusiva pelo SUS.
- **Unidades Básicas de Saúde (Tipo 02)**: 20 unidades cadastradas.
- **Serviços Públicos Georreferenciados (Busca Saúde)**: 32 serviços.
  - 18 Unidades Básicas de Saúde da Família (UBS/ESF).
  - 14 Serviços complementares (UPA, CAPS, Policlínica, Farmácias, Vigilância).
  - *Fonte:* Acervo cartográfico QGIS da residência (extração em 09/09/2026). Projeção SIRGAS 2000 UTM Zone 23S.

---

## 3. Atenção Primária à Saúde (APS)
- **Equipes de Saúde da Família (eSF)**: 21 equipes válidas para custeio no 1º quadrimestre de 2026.
  - *Fonte:* Sistema de Informação para a Atenção Primária à Saúde (Siaps) do Ministério da Saúde.
- **Classificação C1 (Mais Acesso à APS)**: 21 equipes com homologação no padrão C1.
- **Atendimentos Individuais**: 16.366 registros no mês de referência (07/2026).
  - *Limitação:* Registros de consultas médicas e de enfermagem; contagem de eventos, não de indivíduos únicos.
- **Visitas Domiciliares de ACS**: 36.431 registros no mês de referência (07/2026).

---

## 4. Vigilância em Saúde e Eventos Vitais
- **Nascidos Vivos (SINASC)**:
  - Série temporal: 2015 a 2026 (arquivos da sede municipal atualizados em 05/10/2026).
  - *Limitação:* 2015-2024 consolidados; 2025 ano observado; 2026 período parcial até a data de corte.
- **Mortalidade Geral e por Causas (SIM)**:
  - Série temporal: 2015 a 2026.
  - *Causas Principais:* Capítulos CID-10 (Doenças do aparelho circulatório, Neoplasias, Causas externas e Aparelho respiratório).
- **Arboviroses (Dengue / Chikungunya)**:
  - Série histórica anual e série semanal recente (InfoDengue / Fiocruz e SINAN).
  - *Limitação:* Casos notificados e prováveis por semana epidemiológica; sujeitos a encerramento de investigação.
- **Síndromes Respiratórias Agudas Graves (SRAG)**:
  - Sistema de Informação de Vigilância Epidemiológica da Gripe (SIVEP-Gripe).
