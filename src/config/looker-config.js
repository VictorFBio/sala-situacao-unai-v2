/**
 * Configuração dos Relatórios do Google Looker Studio
 * Sala de Situação de Saúde de Unaí - V2
 * 
 * INSTRUÇÕES PARA O GESTOR / DESENVOLVEDOR:
 * 1. Crie seu relatório público gratuito no Google Looker Studio (lookerstudio.google.com).
 * 2. Clique em "Arquivo" > "Incorporar relatório" > "Habilitar incorporação".
 * 3. Selecione "Incorporar URL" e cole o link abaixo no tema correspondente.
 * 4. Deixe o campo vazio ("") se o relatório ainda estiver em desenvolvimento.
 *    O portal exibirá automaticamente o estado de espera e os gráficos nativos validados.
 * 
 * AVISO DE PRIVACIDADE:
 * Relatórios públicos incorporados do Looker Studio ficam acessíveis a qualquer pessoa na internet.
 * Conecte exclusivamente bases de dados agregadas de domínio público (sem dados individuais).
 */

export const LOOKER_CONFIG = {
  // Habilita ou desabilita globalmente os iframes do Looker Studio
  globalEnabled: true,
  
  // Mapeamento de relatórios por eixo temático
  reports: {
    // Eixo 1: Atenção Primária à Saúde
    aps: {
      title: "Painel Interativo de Atenção Primária · Looker Studio",
      embedUrl: "", // Cole aqui a URL de incorporação do Looker Studio quando criada
      description: "Equipes eSF, atendimentos individuais, visitas domiciliares e indicadores de desempenho C1."
    },
    
    // Eixo 2: Atenção Especializada & Hospitalar
    hospitalar: {
      title: "Painel de Atenção Hospitalar e Especializada · Looker Studio",
      embedUrl: "",
      description: "Rede de estabelecimentos CNES, internações SIH/SUS, valores e especialidades."
    },
    
    // Eixo 3: Vigilância em Saúde & Epidemiologia
    vigilancia: {
      title: "Painel de Vigilância Epidemiológica e Vitais · Looker Studio",
      embedUrl: "",
      description: "Monitoramento de arboviroses (Dengue), SRAG, nascimentos (SINASC) e mortalidade (SIM)."
    },
    
    // Eixo 4: Gestão Estratégica, População & Território
    gestao: {
      title: "Painel Demográfico e Indicadores Municipais · Looker Studio",
      embedUrl: "",
      description: "Pirâmide etária do Censo 2022, distribuição territorial e saneamento básico."
    }
  }
};
