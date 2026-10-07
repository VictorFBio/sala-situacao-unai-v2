# Auditoria inicial de segurança

Data: 7 de outubro de 2026. Repositório: `VictorFBio/sala-situacao-unai-v2`.

## Escopo e resultados

Foi examinado o histórico disponível em todos os refs locais, até o commit `3c4249e`, com 11 commits e 45 arquivos rastreados, além das mudanças de documentação e publicação preparadas nesta revisão.

| Verificação | Resultado observado |
| --- | --- |
| Gitleaks 8.30.1, histórico completo, saída com valores ocultos | Nenhuma credencial reconhecida |
| Busca contextual em 86 blobs históricos de texto | Nenhum campo de identificação de pacientes, CPF válido ou e-mail encontrado |
| Arquivos rastreados de ambiente, chaves e bases brutas | Nenhum encontrado |
| Alertas de secret scanning do GitHub | Nenhum alerta aberto encontrado |
| `npm audit` | Nenhuma vulnerabilidade conhecida reportada |
| `npm test` | 19 testes aprovados, sem falhas |
| `npm run build` | Compilação de produção concluída |

Os dados publicados em `public/data/` são agregados. Os recursos de imagem rastreados são logos institucionais e imagens cartográficas. Não foram encontrados arquivos de pacientes ou planilhas brutas rastreadas.

## Proteções da publicação

- Testes e compilação antes do deploy.
- Publicação somente do pacote `dist/`.
- GitHub Actions fixadas por hash de commit.
- Permissão de leitura no build; escrita em Pages e identidade temporária somente no deploy.
- Dependabot para npm e GitHub Actions.
- CodeQL com consultas estendidas para JavaScript, Python e GitHub Actions.
- Testes, auditoria de dependências e compilação em pull requests.
- Exclusão de arquivos de ambiente, chaves privadas e dados brutos locais.
- Política de relato privado de vulnerabilidades e revisão de agregados.
- Verificação da propriedade do domínio na conta GitHub.

## Verificação da publicação

A revisão foi publicada nos commits `e52baf7` e `4051c01`. A nova varredura Gitleaks nos 13 commits disponíveis não encontrou credenciais. O workflow de publicação e a verificação de testes, auditoria e compilação concluíram com sucesso no GitHub. O CodeQL concluiu a análise das três áreas de código sem alertas abertos.

O domínio `saladesituacaounai.online` está verificado no GitHub, com certificado aprovado para o domínio principal e `www`, e HTTPS obrigatório ativado. Os quatro registros A e o CNAME foram conferidos em resolvedores públicos.

Foram verificados os 20 arquivos de `dist/` no site público: todos responderam com HTTP 200. O conteúdo dos JSON corresponde ao build local; somente as quebras de linha diferem entre Windows e Linux. Os endereços HTTP, `www` e `victorfbio.github.io/sala-situacao-unai-v2/` redirecionaram para `https://saladesituacaounai.online/`.

As sete telas e as 13 abas dos painéis foram percorridas no navegador, incluindo a busca de estabelecimento e o fundo de satélite do mapa. Não houve erros ou avisos registrados no console nessa inspeção. A inspeção da publicação não revalida, por si só, as informações epidemiológicas nas fontes originais.

## Limitações

Os resultados descrevem o conteúdo e as vulnerabilidades reconhecidas na data da inspeção. Busca automática não detecta todo tipo de segredo ou risco de reidentificação. Arquivos não rastreados, outros repositórios e sistemas externos não fazem parte deste escopo. Cada nova base ou integração deve passar por revisão antes de ser publicada.
