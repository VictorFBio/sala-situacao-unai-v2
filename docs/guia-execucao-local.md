# Guia de Execução e Visualização Local — Sala de Situação de Unaí V2

Este guia explica como executar, inspecionar e testar localmente o portal da V2 no computador do desenvolvedor ou gestor.

---

## 1. Requisitos
- Node.js v18+ (instalado no ambiente: v24.15)
- Python 3.10+ (opcional, para servir a pasta `dist` estaticamente)

---

## 2. Opções de Execução Local

### Opção A: Servidor de Desenvolvimento React + Vite (com Hot Reload)
Ideal para fazer alterações no código e ver o resultado instantaneamente:

```powershell
cd "sala-situacao-unai-v2"
npm run dev
```

Abra no navegador o endereço indicado (geralmente `http://localhost:3000/` ou `http://localhost:5173/`).

---

### Opção B: Visualização da Produção Compilada (Pasta `dist`)
Para inspecionar exatamente o pacote otimizado pronto para publicação:

```powershell
cd "sala-situacao-unai-v2"
npm run preview
```
Ou com Python diretamente:
```powershell
python -m http.server 8080 --bind 127.0.0.1 --directory "sala-situacao-unai-v2/dist"
```

Abra `http://localhost:8080/`.

---

## 3. Testes Automatizados de Integridade

Para rodar a bateria de testes de integridade dos dados, coordenadas e segurança:

```powershell
cd "sala-situacao-unai-v2"
npm test
```
