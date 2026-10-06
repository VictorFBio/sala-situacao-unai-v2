# Sala de Situação de Saúde de Unaí — V2

Portal web institucional moderno e responsivo para visualização, monitoramento e governança de dados públicos de saúde do município de **Unaí (MG)**.

---

## Destaques da Versão 2 (V2)

1. **Animação de Abertura Imersiva ("Dois Portões")**:
   - Os logotipos oficiais da Prefeitura de Unaí (esquerda) e do SUS (direita) entram como dois portões cerimoniais, realizam uma pulsação conjunta sincronizada no centro e abrem-se revelando o portal, acomodando-se de forma contínua no cabeçalho fixo.
   - Suporte a `sessionStorage` para exibição na primeira visita e botão *"Pular"* ou *"Rever Abertura"*.

2. **Arquitetura Baseada nos 4 Grandes Eixos Estratégicos** (Inspirada no InfoSaúde DF):
   - **Eixo 1 — Atenção Primária**: Equipes eSF, programa Mais Acesso à APS (C1), consultas e visitas de ACS.
   - **Eixo 2 — Atenção Especializada & Hospitalar**: Estabelecimentos CNES e internações SIH/SUS por especialidade.
   - **Eixo 3 — Vigilância em Saúde**: Arboviroses (Dengue InfoDengue/SINAN), nascimentos (SINASC) e mortalidade (SIM).
   - **Eixo 4 — Gestão Estratégica & População**: Censo IBGE 2022, pirâmide etária e saneamento básico.

3. **Integração Pronta com o Google Looker Studio**:
   - Cada eixo possui moldura institucional para incorporar relatórios gratuitos via iframe a partir de [`src/config/looker-config.js`](src/config/looker-config.js).
   - Modo fallback inteligente: enquanto a URL não estiver configurada, o portal exibe gráficos nativos locais com os dados oficiais validados.

4. **Busca Saúde — Mapa Cartográfico Interativo em SVG**:
   - Mapeamento dos 32 serviços públicos de saúde de Unaí (18 UBS/ESF e 14 complementares) com busca por bairro, filtros e detalhes de endereço.

---

## Como Executar Localmente

```powershell
# Instalar dependências (já instaladas)
npm install

# Iniciar servidor de desenvolvimento com Hot Reload
npm run dev

# Compilar para produção
npm run build

# Executar bateria de testes de integridade
npm test
```

---

## Transparência e Segurança
- Todos os dados apresentados são agregados de domínio público.
- Nenhum microdado individual ou identificador de paciente está presente.
- A V1 publicada no GitHub Pages permanece 100% inalterada e funcional.
