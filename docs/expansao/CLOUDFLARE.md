# Migração autorizada para Cloudflare — 08/10/2026

## Objetivo e decisão

Publicar o ecossistema em um único projeto Cloudflare Pages Free, com código e compilação no GitHub. Manter repositórios independentes, portal na raiz e painel em `/painel-de-monitoramento/`. Não usar Functions, Workers de proxy, R2, banco ou produto pago.

A autorização do usuário para migrar substitui a proibição de Cloudflare da etapa anterior. Preparação e testes podem começar agora. A troca do domínio só acontece com o pacote temporário validado, zona DNS inteira conferida e reversão disponível. Acesso às contas e aceitação de termos são feitos pelo titular; credenciais não entram em código nem no chat.

## Plano de execução

1. Conferir backup, versões, DNS e acesso administrativo; preservar a origem GitHub.
2. Preparar pacote com base `/`, limites de arquivos, cabeçalhos de cache e segurança, caminhos canônicos e identificação da versão.
3. Preparar workflow de publicação manual com compilação sem segredos e envio em job separado. Direct Upload permite usar o compositor atual; o projeto não pode ser convertido em integração Git depois.
4. Criar projeto Pages Free e publicar temporariamente em `pages.dev`, com aviso de homologação e bloqueio de indexação.
5. Conferir páginas, indicadores, links antigos, slash final, 404, cabeçalhos, JSON, autoria, desktop e celular. Testar recuperação.
6. Exportar todos os registros da Hostinger, inclusive registros de e-mail, TXT, CAA e situação de DNSSEC/DS. Importar e conferir zona Cloudflare Free; manter primeiro a origem GitHub e sem mudanças em serviços de e-mail.
7. Revisar os nameservers atribuídos e alterar na Hostinger. Associar raiz e `www` ao projeto Pages, verificar certificado, preparar redirecionamento de `www` para raiz.
8. Publicar pacote aprovado sem aviso de homologação; conferir domínio, HTTPS, dados e caminhos. Registrar data real; manter recursos legados por pelo menos 14 dias.
9. Registrar atualização, backup, rollback e limites gratuitos. Preservar GitHub como alternativa de recuperação.

## Registro de execução

- Worktree existente `expansao/painel`, branch `codex/portal-modular`, reaproveitado; checkout original segue na versão `109d7d5`.
- Backup ZIP conhecido: SHA-256 `df8ccea778dd09bf2c71eb28997b74c0fb624e4669da1a0322a69364450bab33`.
- DNS público inicial: `apollo.dns-parking.com`, `athena.dns-parking.com`; A `185.199.108.153`, `.109.153`, `.110.153`, `.111.153`.
- Inicialmente não havia token Cloudflare no ambiente nem nos secrets. O titular abriu as contas e autorizou especificamente criar um token Pages e salvá-lo no GitHub.
- Titular abriu contas Cloudflare e Hostinger no Edge. Zona Hostinger exportada para backup local: quatro A, um CNAME `www` e o TXT de verificação GitHub; nenhum MX ou CAA. Domínio válido até 07/10/2027. Zona tem TTL 300 para os seis registros; consulta recursiva ainda apresentava cache com TTL maior.
- Testes do preparador: três falhas esperadas antes da implementação; depois 27/27 testes do publicador passaram. Validação exige base `/`, páginas reais, cinco JSON com hashes preservados, limites Free e ausência de arquivos de Functions/Workers.
- Decisão: gerar cabeçalhos e redirecionamentos num pacote de saída separado; não ampliar a política geral de arquivos públicos para aceitar configurações arbitrárias de servidor.
- Decisão: secret de envio somente no job de deploy; compilação e código dos módulos executados sem token Cloudflare. Workflow inicialmente manual, com geração de pacote sem envio como padrão.
- Revisão independente apontou sobreposição de Cache-Control e cache longo para imagens sem hash. Teste de regressão falhou antes da correção; cabeçalhos agora removem a regra global antes de definir immutable só em JS/CSS com hash. Imagens, fontes, dados e arquivos compartilhados sem hash permanecem com revalidação. Verificar também os cabeçalhos reais no destino antes de trocar o domínio.
- Projeto Direct Upload `sala-situacao-unai` criado na conta Cloudflare; plano Workers Free confirmado. Zona `saladesituacaounai.online` no plano Free ($0), delegação e ativação concluídas em 08/10/2026.
- Token de conta `Publicação Sala de Situação`: somente Pages Write/Editar, sem DNS, restrito à conta, sem expiração. Valor salvo exclusivamente como secret `CLOUDFLARE_API_TOKEN` no repositório de homologação; não registrado em arquivos ou chat. Remover/revogar ao encerrar sua necessidade; manter acesso de edição de workflows restrito.
- Variáveis do GitHub: `CLOUDFLARE_ACCOUNT_ID` e `CLOUDFLARE_PROJECT_NAME`. Job de envio em ambiente `cloudflare-pages`, sem checkout do código dos módulos. Token nunca disponível no job de compilação.
- Publicação automática de homologação: run `37799691442`, sucesso. Endereço `https://homologacao.sala-situacao-unai.pages.dev/`.
- Publicação automática de produção temporária: run `37800320892`, sucesso. Endereço `https://sala-situacao-unai.pages.dev/`. Commit do publicador `44728eade18fb22a212c2debcaf9a2317be2882b`; portal fixado em `2d6b9ea137000f2873b775ae8c47bb944cc41330`.
- Verificação HTTP remota dos dois ambientes: oito páginas HTTP 200, sete normalizações 301, página inexistente 404, cinco JSON preservados, cabeçalhos de segurança aplicados. HTML/dados/CSS compartilhado `no-cache`; CSS com hash `public, max-age=31536000, immutable`, sem sobreposição. Homologação não indexável; produção sem bloqueio noindex.
- Navegador: link antigo `/#/aps` em acesso direto encaminhou ao painel; APS, Busca Saúde e filtro Alvorada funcionaram. Autoria e revisão presentes no portal e painel. A tentativa de viewport móvel no Edge não alterou a largura efetiva; não contar essa tentativa como teste móvel concluído.
- Zona DNS conferida contra exportação: quatro A GitHub e um CNAME `www`; TXT de verificação adicionado porque não foi encontrado pela varredura. DNSSEC ausente na Hostinger e consulta pública sem DS. Servidores atribuídos: `chelsea.ns.cloudflare.com`, `zeus.ns.cloudflare.com`. Titular confirmou a delegação no momento da ação; formulário salvo e sucesso confirmado pela Hostinger.
- Sincronização de preferências de robôs mantida no padrão do onboarding. Não ativados produtos pagos nem serviços dinâmicos.

## Atualizar a publicação

No repositório `VictorFBio/sala-situacao-unai-homologacao`, executar **Preparar e publicar Cloudflare Pages**, com o SHA completo e revisado do publicador:

```sh
gh workflow run cloudflare.yml --repo VictorFBio/sala-situacao-unai-homologacao -f publisher_revision=SHA_COMPLETO_APROVADO -f ambiente=homologacao -f publicar=true
```

Conferir a prévia e seus dados. Após aprovação, repetir com `ambiente=producao`. O workflow envia a produção para a branch `main` do projeto Pages; homologação para `homologacao`. `publicar=false` gera somente o artefato ZIP para revisão, com retenção de três dias. Salvar pacotes aprovados em backup independente; retenção de artefatos não é backup durável.

O GitHub continua sendo a fonte do código e o executor da compilação. A hospedagem Cloudflare recebe somente o pacote estático; Direct Upload não significa integração Git nativa. Não habilitar Functions ou Workers nem adicionar outros escopos ao token para atualizar arquivos estáticos.

## Delegação e corte de origem

Em 08/10/2026 o titular confirmou a troca no momento da ação. A Hostinger confirmou os servidores `chelsea.ns.cloudflare.com` e `zeus.ns.cloudflare.com`; o registro e sua renovação continuam na Hostinger. Consultas públicas em 1.1.1.1 e 8.8.8.8 às 15:33 UTC já reconheceram ambos os nameservers.

Durante a espera pelo reconhecimento da zona e emissão do certificado universal, os quatro A e o CNAME `www` foram mantidos **somente DNS**, apontando ao GitHub. Depois da zona ativa e certificado ativo, o assistente Pages substituiu os quatro A por CNAME da raiz e atualizou `www`; ambos apontam a `sala-situacao-unai.pages.dev`, com proxy ativado. O TXT de verificação GitHub permanece somente DNS. Registro e renovação permanecem na Hostinger.

Domínio principal ativado em **08/10/2026**: Pages mostra `saladesituacaounai.online` e `www.saladesituacaounai.online` ativos, SSL habilitado. Certificado universal ativo para raiz e wildcard, validade informada até 06/01/2027. TLS de origem **Full (strict)** e **Always Use HTTPS** ativados. Redirecionamento de `www` na borda confirmado com HTTPS válido.

Regra gratuita **WWW para o portal principal**: `https://www.saladesituacaounai.online/*` → `https://saladesituacaounai.online/${1}`, HTTP 301, preservando query string. HTTP da raiz redireciona para HTTPS. O teste no navegador preservou também `#/aps`, encaminhado pelo portal ao painel.

O teste público encontrou Browser Cache TTL padrão de quatro horas sobrepondo o `no-cache` do CSS compartilhado. Configuração alterada para **Respect Existing Headers**; reteste em 08/10 às 18:13 UTC aprovado no domínio principal. Oito páginas 200, sete normalizações 301, 404 correto, cinco JSON preservados, HTML/dados/CSS compartilhado `no-cache`, JS/CSS com hash `immutable` e cabeçalhos de segurança. Não foi necessário desativar cache nem purgar toda a zona. APS, recarga, busca Alvorada, autoria e retorno ao portal conferidos no domínio; console sem erros ou avisos na navegação observada.

Recursos legados na raiz deverão permanecer **pelo menos até 22/10/2026**, contando 14 dias da ativação efetiva. Sua retirada exige publicação revisada. O checkout e workflow GitHub original permanecem preservados; não remover a reserva/verificação do domínio nesta fase.

Limitação da última verificação: captura automatizada do evento de download CSV no Edge excedeu o tempo de espera; não registrar esse novo download como confirmado. O download já havia sido conferido na homologação anterior; dados, botão, busca e mapa continuam presentes. A tentativa não alterou código ou dados.

## Reversão

Antes da troca: manter registros anteriores na Hostinger e o Pages GitHub ativo. Depois da troca dos nameservers, a zona Cloudflare deve conservar os registros GitHub anteriores em backup para restabelecer essa origem em caso de falha. A propagação e caches DNS impedem garantir retorno instantâneo. Não remover domínio do GitHub, excluir implementações, trocar DS ou ativar DNSSEC sem revisão da situação efetiva.

## Documentação oficial

- https://developers.cloudflare.com/pages/get-started/direct-upload/
- https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/
- https://developers.cloudflare.com/pages/platform/limits/
- https://developers.cloudflare.com/pages/configuration/custom-domains/
- https://developers.cloudflare.com/pages/configuration/headers/
- https://developers.cloudflare.com/pages/configuration/redirects/
