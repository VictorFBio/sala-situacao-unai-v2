# Exportação de dados para o Looker Studio

## Estado atual

O portal usa gráficos nativos em React e Chart.js. Não há relatórios Looker incorporados, arquivo `src/config/looker-config.js` ou configuração de iframe nesta versão.

O script `scripts/exportar_para_looker.py` exporta dados locais para CSV como apoio à criação de relatórios externos. Ele não consulta APIs nem atualiza as fontes do portal.

## Executar a exportação

O script atual usa caminhos relativos à pasta que contém o repositório. Com Python instalado, execute a partir dessa pasta:

```powershell
python sala-situacao-unai-v2/scripts/exportar_para_looker.py
```

Os arquivos são gravados em `sala-situacao-unai-v2/dados_looker_studio/` e ficam excluídos do Git por serem CSV. Revise os resultados, os campos fixos do script e as fontes antes de usá-los em qualquer relatório publicado.

## Relatórios externos

Os CSV podem servir de entrada para uma planilha ou para um relatório no Looker Studio. A criação, as permissões e a atualização desse relatório são operações separadas da publicação do portal.

Uma futura incorporação ao site exige implementação, revisão de segurança e verificação própria. Compartilhe somente agregados autorizados; nunca microdados de pacientes ou identificadores pessoais. Consulte [SECURITY.md](../SECURITY.md).
