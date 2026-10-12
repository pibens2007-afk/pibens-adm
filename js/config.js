/* ============================================================
   PIBENS ADM — Configurações globais
   ============================================================
   Centraliza:
   - URL da API (Apps Script)
   - Constantes do app
   - Textos padrão
   - Versão
   ============================================================ */

const CONFIG = {

  /* ---------- API ---------- */
  // URL do Web App do Apps Script (termine com /exec)
  API_URL: 'https://script.google.com/macros/s/AKfycbwUl-1KPF40lIc8FR8itFEYVkq5XhQlNXVvM6D_Hp2-3a2gaVAwg1AX1gZFS0hcaPeS_w/exec',

  // Timeout das requisições (em ms)
  API_TIMEOUT: 25000,

  /* ---------- AUTENTICAÇÃO ---------- */
  // Chave usada no localStorage pra guardar a sessão
  SESSAO_KEY: 'pibens_adm_sessao',

  // Duração da sessão (em dias)
  SESSAO_DIAS: 7,

  /* ---------- APP ---------- */
  APP_NAME: 'PIBENS ADM',
  APP_SHORT_NAME: 'PIBENS',
  APP_TAGLINE: 'Gestão eclesiástica com inteligência',
  APP_VERSION: '2.0.0',

  /* ---------- TABELAS (Supabase) ---------- */
  TABELAS: {
    MEMBROS:        'Membros',
    TALENTOS:       'BancoTalentos',
    AGENDA:         'Agenda'
  },

  /* ---------- DEFINIÇÃO DE CAMPOS POR TABELA ---------- */
  CAMPOS: {
    Membros: [
      { nome: 'Nome',              obrigatorio: true,  tipo: 'text' },
      { nome: 'Nascimento',        obrigatorio: true,  tipo: 'date' },
      { nome: 'CPF',               obrigatorio: true,  tipo: 'text' },
      { nome: 'RG',                obrigatorio: false, tipo: 'text' },
      { nome: 'Telefone',          obrigatorio: true,  tipo: 'text' },
      { nome: 'Email',             obrigatorio: false, tipo: 'email' },
      { nome: 'Endereço',          obrigatorio: false, tipo: 'text' },
      { nome: 'Bairro',            obrigatorio: false, tipo: 'text' },
      { nome: 'Cidade',            obrigatorio: false, tipo: 'text' },
      { nome: 'Estado',            obrigatorio: false, tipo: 'text' },
      { nome: 'CEP',               obrigatorio: false, tipo: 'text' },
      { nome: 'Estado Civil',      obrigatorio: false, tipo: 'select', opcoes: ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'Outro'] },
      { nome: 'Profissão',         obrigatorio: true,  tipo: 'text' },
      { nome: 'Talento',           obrigatorio: false, tipo: 'text' },
      { nome: 'Data de Batismo',   obrigatorio: false, tipo: 'date' },
      { nome: 'Data de Membro',    obrigatorio: false, tipo: 'date' },
      { nome: 'Observações',       obrigatorio: false, tipo: 'textarea' }
    ],
    BancoTalentos: [
      { nome: 'Nome',      obrigatorio: true,  tipo: 'text' },
      { nome: 'Talento',   obrigatorio: true,  tipo: 'text' },
      { nome: 'Telefone',  obrigatorio: false, tipo: 'text' },
      { nome: 'Email',     obrigatorio: false, tipo: 'email' }
    ],
    Agenda: [
      { nome: 'Data',      obrigatorio: true,  tipo: 'date' },
      { nome: 'Evento',    obrigatorio: true,  tipo: 'text' },
      { nome: 'Horario',   obrigatorio: false, tipo: 'text' },
      { nome: 'Local',     obrigatorio: false, tipo: 'text' },
      { nome: 'Descricao', obrigatorio: false, tipo: 'textarea' }
    ]
  },

  /* ---------- COLUNAS VISÍVEIS NA TABELA ---------- */
  COLUNAS_TABELA: {
    Membros:       ['Nome', 'Telefone', 'Talento'],
    BancoTalentos: ['Nome', 'Talento', 'Telefone'],
    Agenda:        ['Data', 'Evento', 'Horario', 'Local']
  },

  /* ---------- MENU LATERAL ---------- */
  MENU: [
    {
      secao: 'Principal',
      itens: [
        { id: 'dashboard',  label: 'Início',      icon: 'fa-home',        modulo: 'Dashboard' },
        { id: 'ia',         label: 'Assistente IA', icon: 'fa-robot',     modulo: 'IA' }
      ]
    },
    {
      secao: 'Cadastros',
      itens: [
        { id: 'membros',    label: 'Membros',     icon: 'fa-users',       modulo: 'Membros' },
        { id: 'talentos',   label: 'Talentos',    icon: 'fa-star',        modulo: 'BancoTalentos' },
        { id: 'agenda',     label: 'Agenda',      icon: 'fa-calendar-alt', modulo: 'Agenda' }
      ]
    }
  ],

  /* ---------- MENSAGENS PADRÃO ---------- */
  MSG: {
    ERRO_CONEXAO:     'Tempo esgotado. Verifique sua conexão e tente novamente.',
    ERRO_JSON:        'Resposta inválida do servidor.',
    ERRO_GENERICO:    'Ocorreu um erro. Tente novamente.',
    SENHA_INCORRETA:  'Senha incorreta.',
    LOGIN_SUCESSO:    'Bem-vindo!',
    SALVO_SUCESSO:    'Registro salvo com sucesso!',
    REMOVIDO_SUCESSO: 'Registro removido com sucesso!',
    CONFIRMA_REMOCAO: 'Confirma a remoção deste registro?',
    CARREGANDO:       'Carregando...'
  },

  /* ---------- DIAS DA SEMANA (pt-BR) ---------- */
  DIAS_SEMANA: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],

  /* ---------- MESES (pt-BR) ---------- */
  MESES: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
          'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

};

/* Congela pra evitar modificação acidental */
Object.freeze(CONFIG);
Object.freeze(CONFIG.TABELAS);
Object.freeze(CONFIG.CAMPOS);
Object.freeze(CONFIG.COLUNAS_TABELA);
Object.freeze(CONFIG.MSG);
Object.freeze(CONFIG.MENU);
Object.freeze(CONFIG.DIAS_SEMANA);
Object.freeze(CONFIG.MESES);

// Log de inicialização (ajuda a debugar no console)
console.log(`%c${CONFIG.APP_NAME} v${CONFIG.APP_VERSION}`, 'color:#2563eb;font-weight:bold;font-size:14px;');
console.log('%cConfig carregado', 'color:#64748b;font-size:11px;');
