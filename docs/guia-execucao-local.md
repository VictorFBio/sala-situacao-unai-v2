# Executar e verificar o portal localmente

Use Node.js 22 ou superior e npm. Execute os comandos abaixo dentro da pasta do repositório.

## Instalação e desenvolvimento

```powershell
npm ci
npm run dev
```

Abra o endereço informado pelo Vite no terminal. A configuração atual usa a porta 3000, quando disponível.

## Versão de produção

```powershell
npm test
npm run build
npm run preview
```

Abra o endereço informado pelo comando de visualização. A pasta `dist/` contém os arquivos publicados, incluindo os dados de `public/data/`. O servidor de visualização é destinado à inspeção local.

## Verificações

`npm test` executa os testes existentes de integridade, dados, interface e segurança. `npm audit` consulta vulnerabilidades conhecidas nas dependências. Essas verificações complementam a revisão do conteúdo e não garantem, isoladamente, a ausência de dados pessoais ou falhas.

A configuração da publicação está em [publicacao.md](publicacao.md), e as regras de conteúdo público estão em [SECURITY.md](../SECURITY.md).
