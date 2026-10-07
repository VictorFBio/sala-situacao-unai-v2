# Publicação e domínio

O portal estático é publicado pelo GitHub Pages. A Hostinger administra o domínio e o DNS.

## GitHub Pages

- Repositório: `VictorFBio/sala-situacao-unai-v2`.
- Origem de publicação: GitHub Actions.
- Branch: `main`.
- Workflow: `.github/workflows/deploy-pages.yml`.
- Pacote publicado: `dist/`, gerado depois de `npm ci`, `npm test` e `npm run build`.
- Domínio personalizado: `saladesituacaounai.online`.

O domínio deve estar configurado em **Settings → Pages** antes de apontar o DNS para o GitHub. Em publicações por Actions, a configuração de domínio é mantida no GitHub; não depende de um arquivo `CNAME` no repositório.

## DNS na Hostinger

Nameservers: `apollo.dns-parking.com` e `athena.dns-parking.com`.

| Tipo | Nome | Valor | TTL |
| --- | --- | --- | --- |
| A | @ | 185.199.108.153 | 300 |
| A | @ | 185.199.109.153 | 300 |
| A | @ | 185.199.110.153 | 300 |
| A | @ | 185.199.111.153 | 300 |
| CNAME | www | victorfbio.github.io | 300 |

Mantenha também o TXT `_github-pages-challenge-VictorFBio` usado para verificar a propriedade do domínio na conta GitHub. Seu valor é um código público de verificação DNS, não uma credencial da aplicação.

Não mantenha o antigo A `2.57.91.91` junto dos IPs do GitHub. Não use registros curinga para esta publicação. Outros registros de serviços, como e-mail, devem ser preservados quando existirem.

## HTTPS e redirecionamento

O certificado TLS é fornecido pelo GitHub Pages. Depois de sua emissão, mantenha **Enforce HTTPS** habilitado em **Settings → Pages**. O domínio principal é `saladesituacaounai.online`; o GitHub Pages redireciona o endereço com `www` para ele quando ambos estão corretamente configurados.

Alterações de DNS e emissão de certificado podem levar algum tempo. Confira a execução do workflow, o diagnóstico de DNS do Pages e o acesso HTTPS antes de considerar uma publicação concluída.

Referências: [domínio personalizado](https://docs.github.com/pt/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), [verificação do domínio](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages) e [workflows do Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
