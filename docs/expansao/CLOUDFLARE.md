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
- Nenhum token Cloudflare encontrado no ambiente nem nos secrets listados dos repositórios. Dashboard solicitou login; solicitado acesso ao titular.
- Zona completa, cobrança da conta, projeto Pages, DNSSEC e certificado de destino ainda não verificados.
- Titular abriu contas Cloudflare e Hostinger no Edge. Zona Hostinger exportada para backup local: quatro A, um CNAME `www` e o TXT de verificação GitHub; nenhum MX ou CAA. Domínio válido até 07/10/2027. Zona tem TTL 300 para os seis registros; consulta recursiva ainda apresentava cache com TTL maior.
- Testes do preparador: três falhas esperadas antes da implementação; depois 27/27 testes do publicador passaram. Validação exige base `/`, páginas reais, cinco JSON com hashes preservados, limites Free e ausência de arquivos de Functions/Workers.
- Decisão: gerar cabeçalhos e redirecionamentos num pacote de saída separado; não ampliar a política geral de arquivos públicos para aceitar configurações arbitrárias de servidor.
- Decisão: secret de envio somente no job de deploy; compilação e código dos módulos executados sem token Cloudflare. Workflow inicialmente manual, com geração de pacote sem envio como padrão.
- Revisão independente apontou sobreposição de Cache-Control e cache longo para imagens sem hash. Teste de regressão falhou antes da correção; cabeçalhos agora removem a regra global antes de definir immutable só em JS/CSS com hash. Imagens, fontes, dados e arquivos compartilhados sem hash permanecem com revalidação. Verificar também os cabeçalhos reais no destino antes de trocar o domínio.

## Reversão

Antes da troca: manter registros anteriores na Hostinger e o Pages GitHub ativo. Depois da troca dos nameservers, a zona Cloudflare deve conservar os registros GitHub anteriores em backup para restabelecer essa origem em caso de falha. A propagação e caches DNS impedem garantir retorno instantâneo. Não remover domínio do GitHub, excluir implementações, trocar DS ou ativar DNSSEC sem revisão da situação efetiva.

## Documentação oficial

- https://developers.cloudflare.com/pages/get-started/direct-upload/
- https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/
- https://developers.cloudflare.com/pages/platform/limits/
- https://developers.cloudflare.com/pages/configuration/custom-domains/
- https://developers.cloudflare.com/pages/configuration/headers/
- https://developers.cloudflare.com/pages/configuration/redirects/
