# Segurança

## Relatar uma vulnerabilidade

Use **Security → Report a vulnerability** neste repositório para comunicar uma falha em privado. Não publique credenciais, identificadores pessoais, dados de pacientes ou uma prova de exploração em issues públicas.

## Conteúdo permitido

O repositório e o site são públicos. Publique somente código, materiais institucionais autorizados e dados agregados, com fonte, período e limitações. Antes de atualizar uma base, confira também se recortes pequenos ou combinações de atributos permitem identificar uma pessoa.

Não inclua nomes de pacientes, CPF, CNS, prontuários, endereços residenciais, datas de nascimento individuais, senhas, tokens, chaves de API ou arquivos brutos contendo essas informações. Os endereços e contatos de estabelecimentos de saúde devem ser de divulgação pública.

## Credenciais e arquivos locais

- `.gitignore` exclui arquivos de ambiente, chaves privadas, entradas brutas e exportações locais. Essa exclusão não remove arquivos já publicados nem substitui uma revisão.
- Variáveis `VITE_*` são incorporadas ao JavaScript enviado ao navegador. Não são um local seguro para segredos.
- Qualquer futura integração que exija segredo deve usar um serviço no servidor, com controle de acesso. O portal atual é estático.
- Se uma credencial for exposta, revogue ou rotacione imediatamente. Remover o texto do último commit não elimina a exposição no histórico.

## Atualizações

A publicação exige testes e compilação bem-sucedidos. Pull requests também executam testes, compilação e auditoria de dependências. Dependabot acompanha dependências e ações, sem mesclar atualizações automaticamente. Revise as mudanças e as verificações antes de integrar cada atualização.
