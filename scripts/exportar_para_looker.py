import json
import csv
import os

data_dir = "sala-situacao-unai-v2/public/data"
output_dir = "sala-situacao-unai-v2/dados_looker_studio"
os.makedirs(output_dir, exist_ok=True)

with open(f"{data_dir}/dashboard-data.json", "r", encoding="utf-8") as f:
    dashboard = json.load(f)

with open(f"{data_dir}/mapa-servicos.json", "r", encoding="utf-8") as f:
    mapa = json.load(f)

queries = dashboard.get("queries", {})

# -------------------------------------------------------------
# 1. ATENÇÃO PRIMÁRIA (APS)
# -------------------------------------------------------------
aps_rows = []
for r in queries.get("aps_individuais", {}).get("rows", []):
    aps_rows.append({
        "competencia": r.get("competencia") or r.get("data") or r.get("mes"),
        "ano": str(r.get("ano", "")),
        "indicador": "Atendimentos Individuais",
        "quantidade": r.get("valor", 0),
        "equipes_esf_custeio": 21,
        "equipes_c1": 21,
        "fonte": "Siaps / Ministério da Saúde"
    })

for r in queries.get("aps_visitas", {}).get("rows", []):
    aps_rows.append({
        "competencia": r.get("competencia") or r.get("data") or r.get("mes"),
        "ano": str(r.get("ano", "")),
        "indicador": "Visitas Domiciliares (ACS)",
        "quantidade": r.get("valor", 0),
        "equipes_esf_custeio": 21,
        "equipes_c1": 21,
        "fonte": "Siaps / Ministério da Saúde"
    })

with open(f"{output_dir}/01_atencao_primaria_unai.csv", "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["competencia", "ano", "indicador", "quantidade", "equipes_esf_custeio", "equipes_c1", "fonte"])
    writer.writeheader()
    writer.writerows(aps_rows)
print(f"Exportado: 01_atencao_primaria_unai.csv ({len(aps_rows)} linhas)")

# -------------------------------------------------------------
# 2. ATENÇÃO HOSPITALAR (SIH/SUS)
# -------------------------------------------------------------
hosp_rows = []
for r in queries.get("sih_internacoes", {}).get("rows", []):
    hosp_rows.append({
        "ano": r.get("ano"),
        "especialidade": r.get("especialidade") or r.get("categoria"),
        "internacoes": r.get("valor", 0),
        "fonte": "SIH / SUS / Ministério da Saúde"
    })

with open(f"{output_dir}/02_atencao_hospitalar_unai.csv", "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["ano", "especialidade", "internacoes", "fonte"])
    writer.writeheader()
    writer.writerows(hosp_rows)
print(f"Exportado: 02_atencao_hospitalar_unai.csv ({len(hosp_rows)} linhas)")

# -------------------------------------------------------------
# 3. VIGILÂNCIA E VITAIS (SINASC, SIM, DENGUE)
# -------------------------------------------------------------
vitais_dict = {}
for r in queries.get("nascimentos_anuais", {}).get("rows", []):
    ano = r.get("ano")
    if ano:
        vitais_dict.setdefault(ano, {})["nascidos_vivos"] = r.get("valor")
        vitais_dict[ano]["nascidos_situacao"] = "Parcial / Observado" if r.get("parcial") else "Consolidado"

for r in queries.get("obitos_anuais", {}).get("rows", []):
    ano = r.get("ano")
    if ano:
        vitais_dict.setdefault(ano, {})["obitos_gerais"] = r.get("valor")
        vitais_dict[ano]["obitos_situacao"] = "Parcial / Observado" if r.get("parcial") else "Consolidado"

for r in queries.get("arboviroses_anual", {}).get("rows", []):
    ano = r.get("ano")
    if ano:
        vitais_dict.setdefault(ano, {})["casos_dengue"] = r.get("valor") or r.get("casos")

vitais_rows = []
for ano in sorted(vitais_dict.keys()):
    v = vitais_dict[ano]
    vitais_rows.append({
        "ano": ano,
        "nascidos_vivos_sinasc": v.get("nascidos_vivos", ""),
        "obitos_gerais_sim": v.get("obitos_gerais", ""),
        "casos_dengue_infodengue": v.get("casos_dengue", ""),
        "situacao": v.get("nascidos_situacao", "Oficial"),
        "municipio": "Unaí (MG)",
        "codigo_ibge": "3170404"
    })

with open(f"{output_dir}/03_vigilancia_vitais_unai.csv", "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["ano", "nascidos_vivos_sinasc", "obitos_gerais_sim", "casos_dengue_infodengue", "situacao", "municipio", "codigo_ibge"])
    writer.writeheader()
    writer.writerows(vitais_rows)
print(f"Exportado: 03_vigilancia_vitais_unai.csv ({len(vitais_rows)} linhas)")

# -------------------------------------------------------------
# 4. MORTALIDADE POR CAUSAS (SIM - CID-10)
# -------------------------------------------------------------
causas_rows = []
for r in queries.get("sim_causas", {}).get("rows", []):
    causas_rows.append({
        "causa_capitulo": r.get("categoria") or r.get("causa"),
        "obitos_total": r.get("valor", 0),
        "ano_referencia": "Série SIM 2024",
        "fonte": "SIM / Secretaria Municipal de Saúde de Unaí"
    })

with open(f"{output_dir}/04_mortalidade_causas_unai.csv", "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["causa_capitulo", "obitos_total", "ano_referencia", "fonte"])
    writer.writeheader()
    writer.writerows(causas_rows)
print(f"Exportado: 04_mortalidade_causas_unai.csv ({len(causas_rows)} linhas)")

# -------------------------------------------------------------
# 5. DEMOGRAFIA E FAIXAS ETÁRIAS (CENSO 2022)
# -------------------------------------------------------------
demo_rows = []
for r in queries.get("populacao_idade_sexo", {}).get("rows", []):
    demo_rows.append({
        "faixa_etaria": r.get("faixa") or r.get("categoria"),
        "populacao_residente": r.get("valor", 0),
        "ano_censo": 2022,
        "fonte": "IBGE Censo Demográfico 2022, Tabela 9514"
    })

with open(f"{output_dir}/05_demografia_censo_unai.csv", "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["faixa_etaria", "populacao_residente", "ano_censo", "fonte"])
    writer.writeheader()
    writer.writerows(demo_rows)
print(f"Exportado: 05_demografia_censo_unai.csv ({len(demo_rows)} linhas)")

# -------------------------------------------------------------
# 6. MAPA DE SERVIÇOS DE SAÚDE
# -------------------------------------------------------------
servicos_rows = []
for r in mapa.get("queries", {}).get("rede_geografica", {}).get("rows", []):
    servicos_rows.append({
        "codigo": r.get("codigo"),
        "nome": r.get("nome"),
        "grupo": r.get("grupo"),
        "bairro": r.get("bairro"),
        "endereco": r.get("endereco"),
        "municipio": "Unaí (MG)",
        "coordenada_x_utm": r.get("x"),
        "coordenada_y_utm": r.get("y")
    })

with open(f"{output_dir}/06_rede_servicos_saude_unai.csv", "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["codigo", "nome", "grupo", "bairro", "endereco", "municipio", "coordenada_x_utm", "coordenada_y_utm"])
    writer.writeheader()
    writer.writerows(servicos_rows)
print(f"Exportado: 06_rede_servicos_saude_unai.csv ({len(servicos_rows)} linhas)")
