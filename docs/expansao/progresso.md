# Execução — expansão aprovada em 08/10/2026

Base: 109d7d5bb90a7b71f4313d341620b57f39b09d37.

## Limites da autorização

Escopo inicial: portal mínimo, infraestrutura de módulos e homologação, preservando produção para 15/10. Posteriormente, em 08/10, o titular autorizou migrar para Cloudflare e reorganizar o domínio agora. Também autorizou criar e salvar o token de publicação no GitHub e confirmou a delegação DNS no momento da ação. Serviços pagos e implementação de todas as aplicações futuras continuam fora do escopo. Estado efetivo e operação em [CLOUDFLARE.md](CLOUDFLARE.md).

## Decisões de execução

- O recurso nativo de worktree não reconheceu o repositório na pasta pai. Foi criado um worktree local `expansao/painel`, branch `codex/portal-modular`; a cópia principal permanece intacta.
- Portal sem dependências externas: HTML estático gerado por Node.js, identidade atual e fontes de sistema. Sem framework adicional.
- Catálogo preserva duas dimensões: estado do cadastro legado e consultas realmente presentes no pacote. Não inferir cargas por associação de nomes.
- Workflow GitHub original permanece intacto. Composição e publicação Cloudflare habilitadas em workflow separado, com referências aprovadas; domínio ativado após testes e confirmação de delegação.
- Backups do Git e de `dist/` foram criados em `expansao/01_Backup`, com SHA-256.

## Etapas

1. Backup e isolamento: concluídos.
2. Testes de contratos de portal, carregamento e publicação: falhas iniciais observadas; implementação passou.
3. Portal e compositor: implementados. 24 testes do painel e 4 do portal passaram na composição; JSON comparados byte a byte.
4. CI, segurança, documentação e recuperação: workflows independentes e guia central implementados. Ensaio do pacote de referência publicado com sucesso na homologação (run 37788406687).
5. Homologação e revisão: revisão independente concluída; duas correções materiais implementadas com testes de regressão. Publicação integrada concluída (run 37789759819); PR #9 em rascunho. Testes e compilação do PR e CI do portal aprovados. CodeQL encontrou duas condições de corrida nos scripts; correção usa descritor aberto para validar e ler o mesmo arquivo, sem consulta de caminho seguida de leitura por caminho. Nova análise CodeQL e CI aprovadas no commit publicado `44728eade18fb22a212c2debcaf9a2317be2882b`.

## Decisões e revisão

Decisão: manter workflow GitHub anterior como contingência. A produção Cloudflare usa workflow separado no repositório de homologação, pacote estático e commit aprovado, com envio em job sem checkout dos módulos.

Ruling: MIT aplicada somente ao código novo do portal — direitos do painel anterior e marcas não foram auditados — licença do acervo anterior permanece decisão institucional pendente.

Ruling: proteção de main, 2FA e recuperação administrativa não foram alteradas nesta transição; confirmação pelo titular continua pendente e deve ser registrada como tarefa de governança.

Revisão independente: P1 saída de módulo não era submetida à política de publicação; corrigido validando cada saída e o pacote final, inclusive revisão e hash de PDF/CSV. P2 saída do portal conservava arquivos retirados; corrigido com diretório temporário e substituição após sucesso. Os dois testes novos falharam antes da correção e passaram depois.

Verificação local: catálogo encontrou “imunizacao” sem acentos; link antigo `/#/aps` encaminhou ao painel no caminho correto; HTTP 503 simulado mostrou indisponibilidade e “Tentar novamente” recuperou indicadores sem alterar ausência. Homologação publicada conferida no navegador; portal também conferido com viewport 390 × 844, oito links no menu e sem overflow horizontal. Capturas em `expansao/qa`. Compilação local exigiu execução fora do sandbox devido a bloqueio EPERM de realpath/rename; não houve redução de proteção do site.

## Cloudflare

Projeto Pages Free `sala-situacao-unai` criado e workflow automático verificado com secret restrito a Pages Editar. Prévia e produção temporária publicadas a partir de `44728eade18fb22a212c2debcaf9a2317be2882b`. Oito páginas, sete redirecionamentos, 404, cinco JSON preservados e cabeçalhos reais passaram nos dois ambientes. Revisão independente encontrou sobreposição de cache; teste de regressão e conferência HTTP confirmaram a correção.

Delegação DNS salva e confirmada pela Hostinger e por dois resolvedores públicos. Zona e certificado universal ativos; domínio principal associado ao Pages e pacote publicado efetivamente em `https://saladesituacaounai.online/` em 08/10/2026. Raiz e `www` usam CNAME do projeto com proxy; TXT GitHub preservado. TLS Full (strict), HTTPS obrigatório e redirecionamento canônico de `www` para raiz configurados e testados.

Reteste público de produção aprovado: oito páginas, sete normalizações, 404, cinco JSON e cabeçalhos. Browser Cache TTL da zona ajustado de quatro horas para respeitar cabeçalhos existentes, corrigindo sobreposição do CSS compartilhado. Link antigo via `www` preservou query e fragmento APS; indicadores, recarga, mapa e busca Alvorada funcionaram, sem erros ou avisos no console observado. Recursos legados mantidos pelo menos até 22/10/2026. Checkouts e workflow GitHub anteriores preservados. Verificação diária atualizada para produção e homologações; executada localmente com sucesso.
