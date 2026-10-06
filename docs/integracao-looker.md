# Guia de Integração com o Google Looker Studio — Sala de Situação de Unaí V2

Este guia orienta gestores de saúde, residentes e técnicos sobre como conectar relatórios interativos gratuitos do **Google Looker Studio** ao portal da Sala de Situação de Unaí (V2).

---

## 1. Princípios de Segurança e Conformidade
> [!IMPORTANT]
> **Aviso de Privacidade e Transparência:**
> Os relatórios públicos incorporados do Looker Studio ficam acessíveis a qualquer pessoa na internet através do iframe.
> - **Permitido:** Bases de dados agregadas municipais (totais de nascimentos, óbitos, atendimentos, taxas, percentuais e indicadores sintetizados).
> - **Rigorosamente Proibido:** Microdados com dados pessoais, nomes de pacientes, números de prontuário, CPF ou identificação individual.

---

## 2. Passo a Passo para Criar e Vincular o Relatório

### Passo 1: Preparar os Dados no Google Sheets ou CSV
1. Acesse o [Google Drive](https://drive.google.com/) e crie uma planilha no Google Sheets contendo a base agregada (ex.: atendimentos mensais da APS ou dados de vacinação).
2. Certifique-se de que a planilha possui colunas claras: `Ano`, `Mês`, `Indicador`, `Valor`, `Fonte`.

### Passo 2: Criar o Relatório no Looker Studio
1. Acesse [lookerstudio.google.com](https://lookerstudio.google.com/) (gratuito com qualquer conta Google).
2. Clique em **Criar &gt; Relatório**.
3. Selecione o conector **Google Planilhas** e aponte para a planilha que você preparou.
4. Monte seus filtros (ex.: filtro de ano, seleção de equipe) e gráficos (linhas, barras, cartões).

### Passo 3: Habilitar o Acesso Público e a Incorporação
1. No canto superior direito, clique em **Compartilhar**.
2. Em **Acesso geral**, altere para **"Qualquer pessoa com o link pode ver"**.
3. No menu superior do Looker Studio, vá em **Arquivo &gt; Incorporar relatório**.
4. Marque a opção **"Habilitar incorporação"**.
5. Selecione a opção **"Incorporar URL"** (não o código iframe completo, apenas a URL).
6. Copie a URL que se parece com:
   `https://lookerstudio.google.com/embed/reporting/1a2b3c4d-5e6f.../page/...`

### Passo 4: Configurar no Portal V2
1. Abra o arquivo [`src/config/looker-config.js`](../src/config/looker-config.js).
2. Localize o eixo correspondente (`aps`, `hospitalar`, `vigilancia` ou `gestao`).
3. Cole a URL copiada no campo `embedUrl`:
   ```javascript
   export const LOOKER_CONFIG = {
     globalEnabled: true,
     reports: {
       aps: {
         title: "Painel Interativo de Atenção Primária · Looker Studio",
         embedUrl: "https://lookerstudio.google.com/embed/reporting/SEU_LINK_AQUI/page/p_1",
         description: "Equipes eSF, atendimentos e visitas domiciliares."
       },
       // ...
     }
   };
   ```
4. Salve o arquivo. O portal recarregará automaticamente com o iframe integrado dentro da moldura institucional!

---

## 3. O que acontece se o link não for configurado?
Se `embedUrl` estiver vazio (`""`), o portal entra em **modo fallback automático**:
- Exibe o banner informativo com o selo institucional *"Looker Studio Preparado"*;
- Exibe automaticamente os **gráficos e tabelas nativos** alimentados pela base validada local de Unaí;
- O portal permanece 100% apresentável, informativo e funcional para os cidadãos.
