# Sala de Situação de Saúde de Unaí

Portal web da versão 2 da Sala de Situação de Saúde de Unaí (MG). O projeto reúne indicadores, gráficos e informações territoriais para facilitar a consulta a dados públicos de saúde do município.

## Sobre o projeto

A Sala de Situação nasceu de uma necessidade prática: dados municipais de saúde estão distribuídos entre diferentes sistemas e bases, o que dificulta sua consulta e análise. A proposta é organizar essas informações em um único ambiente, com visualizações que ajudem moradores, técnicos e gestores a encontrar os dados por tema.

O portal está organizado em quatro áreas: **Atenção Primária à Saúde**, **Atenção Especializada e Hospitalar**, **Vigilância em Saúde** e **Gestão Estratégica, Demografia e Território**. A navegação também inclui o **Busca Saúde**, com pesquisa de serviços e informações de localização.

## Dados e transparência

O portal apresenta dados públicos em forma agregada. As fontes, os períodos e as notas disponíveis acompanham os respectivos indicadores. O conteúdo não deve incluir microdados nem informações que identifiquem pacientes. A disponibilidade varia conforme a fonte e o indicador.

Os dados que alimentam a aplicação ficam em `public/data/`. O script [`scripts/exportar_para_looker.py`](scripts/exportar_para_looker.py) transforma dados locais em arquivos CSV para uso em relatórios. A coleta direta por APIs e a atualização totalmente automatizada das fontes ainda são possibilidades para etapas futuras; este repositório não implementa esses processos.

## Tecnologias

- **React** e **JavaScript** para a aplicação web;
- **Vite** para desenvolvimento e compilação;
- **Chart.js** para gráficos interativos;
- **CSS** para apresentação e adaptação a diferentes telas;
- **Python** para a rotina de exportação de dados em CSV;
- **Node.js** para executar verificações automatizadas do projeto.

## Executar localmente

Requisitos: Node.js 22 ou superior e npm. A publicação automatizada usa Node.js 22.

```bash
npm ci
npm run dev
```

Para gerar e visualizar a versão compilada:

```bash
npm run build
npm run preview
```

Para executar as verificações automatizadas:

```bash
npm test
```

## Estrutura do repositório

```text
public/data/       Dados agregados usados pelo portal
src/               Aplicação, telas, componentes e gráficos
scripts/           Rotinas auxiliares, incluindo exportação para CSV
docs/              Guias e documentação do projeto
tests/             Verificações em JavaScript com Node.js
```

## Publicação

O domínio atual usa Cloudflare Pages, com o portal na raiz e este painel em `/painel-de-monitoramento/`. A compilação no GitHub reúne os módulos fixados em `modules.json`, verifica dados e links e publica somente o pacote estático. Homologar antes de atualizar a produção; siga [o procedimento Cloudflare](docs/expansao/CLOUDFLARE.md). Não há serviço pago adicional.

**Endereço público:** <https://saladesituacaounai.online/>

O workflow anterior em [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) e o endereço GitHub Pages permanecem como histórico da publicação inicial:

<https://victorfbio.github.io/sala-situacao-unai-v2/>

O registro do domínio permanece na Hostinger; DNS e hospedagem atuais usam Cloudflare. O [guia inicial de publicação e DNS](docs/publicacao.md) documenta a etapa anterior.

## Carregamento e acessibilidade

As seções detalhadas, gráficos e Busca Saúde são carregados ao abrir cada seção. A composição verifica a árvore inicial de JavaScript para impedir gráficos antecipados por dependências compartilhadas. Os pedidos simultâneos de dados compartilham a mesma operação; uma falha permite nova tentativa, preservando valores ausentes.

O atalho para o conteúdo preserva a seção e compensa a altura do cabeçalho. A apresentação pode ser pulada ou cancelada com Escape e respeita movimento reduzido e armazenamento indisponível. Inter e Manrope são servidas localmente; origem, hashes e licenças OFL ficam em `public/assets/fonts/licenses.json`. Arquivos com hash têm cache imutável; HTML e dados continuam revalidados.

## Segurança e manutenção

Leia a [política de segurança](SECURITY.md) antes de adicionar dados ou relatar uma vulnerabilidade. Credenciais nunca devem ser incluídas no código, nos dados públicos ou em variáveis `VITE_*`, que ficam acessíveis no navegador.

O Dependabot verifica atualizações de dependências e de GitHub Actions semanalmente. Pull requests executam testes, compilação e auditoria de dependências. O CodeQL analisa o JavaScript, o Python e as automações do repositório. As ações da publicação são fixadas por commit e recebem apenas as permissões necessárias. O [registro da auditoria inicial](docs/auditoria-seguranca.md) descreve o escopo e os resultados das verificações.
