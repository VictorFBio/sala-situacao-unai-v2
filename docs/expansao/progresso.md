# Execução — expansão aprovada em 08/10/2026

Base: 109d7d5bb90a7b71f4313d341620b57f39b09d37.

## Limites da autorização

Implementar portal mínimo, infraestrutura de módulos e homologação. Preservar produção e DNS para a avaliação de 15/10. Não migrar para Cloudflare, não ativar serviços pagos e não implementar todas as aplicações futuras nesta etapa.

## Decisões de execução

- O recurso nativo de worktree não reconheceu o repositório na pasta pai. Foi criado um worktree local `expansao/painel`, branch `codex/portal-modular`; a cópia principal permanece intacta.
- Portal sem dependências externas: HTML estático gerado por Node.js, identidade atual e fontes de sistema. Sem framework adicional.
- Catálogo preserva duas dimensões: estado do cadastro legado e consultas realmente presentes no pacote. Não inferir cargas por associação de nomes.
- Workflow atual de produção permanece intacto. Composição será habilitada em workflow separado de homologação; ativação em produção requer revisão posterior.
- Backups do Git e de `dist/` foram criados em `expansao/01_Backup`, com SHA-256.

## Etapas

1. Backup e isolamento: concluídos.
2. Testes de contratos de portal, carregamento e publicação: falhas iniciais observadas; implementação passou.
3. Portal e compositor: implementados. 24 testes do painel e 4 do portal passaram na composição; JSON comparados byte a byte.
4. CI, segurança, documentação e recuperação: workflows independentes e guia central implementados. Ensaio do pacote de referência publicado com sucesso na homologação (run 37788406687).
5. Homologação e revisão: revisão independente concluída; duas correções materiais implementadas com testes de regressão. Publicação integrada concluída (run 37789759819); PR #9 em rascunho. Testes e compilação do PR e CI do portal aprovados. CodeQL encontrou duas condições de corrida nos scripts; correção usa descritor aberto para validar e ler o mesmo arquivo, sem consulta de caminho seguida de leitura por caminho. Aguardar nova análise do commit final.

## Decisões e revisão

Ruling: o workflow de produção permanece idêntico à base — preservar a avaliação de 15/10 — ativação posterior precisa de PR específico e aprovação.

Ruling: MIT aplicada somente ao código novo do portal — direitos do painel anterior e marcas não foram auditados — licença do acervo anterior permanece decisão institucional pendente.

Ruling: proteção de main, 2FA e configuração administrativa do publicador ficam após a avaliação — não alterar configurações do ambiente preservado — confirmar pelo titular antes da ativação.

Revisão independente: P1 saída de módulo não era submetida à política de publicação; corrigido validando cada saída e o pacote final, inclusive revisão e hash de PDF/CSV. P2 saída do portal conservava arquivos retirados; corrigido com diretório temporário e substituição após sucesso. Os dois testes novos falharam antes da correção e passaram depois.

Verificação local: catálogo encontrou “imunizacao” sem acentos; link antigo `/#/aps` encaminhou ao painel no caminho correto; HTTP 503 simulado mostrou indisponibilidade e “Tentar novamente” recuperou indicadores sem alterar ausência. Homologação publicada conferida no navegador; portal também conferido com viewport 390 × 844, oito links no menu e sem overflow horizontal. Capturas em `expansao/qa`. Compilação local exigiu execução fora do sandbox devido a bloqueio EPERM de realpath/rename; não houve redução de proteção do site.
