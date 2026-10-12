/* ============================================================
   PIBENS ADM — Configurações globais v2.3
   ============================================================ */

const CONFIG = {

  API_URL: 'https://script.google.com/macros/s/AKfycbwUl-1KPF40lIc8FR8itFEYVkq5XhQlNXVvM6D_Hp2-3a2gaVAwg1AX1gZFS0hcaPeS_w/exec',
  API_TIMEOUT: 25000,

  SESSAO_KEY: 'pibens_adm_sessao',
  SESSAO_DIAS: 7,

  APP_NAME: 'PIBENS ADM',
  APP_SHORT_NAME: 'PIBENS',
  APP_TAGLINE: 'Gestão eclesiástica com inteligência',
  APP_VERSION: '2.3.0',

  TABELAS: {
    MEMBROS:     'Membros',
    TALENTOS:    'BancoTalentos',
    AGENDA:      'Agenda',
    FINANCEIRO:  'Financeiro',
    PRESENCAS:   'Presencas',
    ESCALAS:     'Escalas'
  },

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
    ],
    Financeiro: [
      { nome: 'Data',           obrigatorio: true,  tipo: 'date' },
      { nome: 'Tipo',           obrigatorio: true,  tipo: 'select', opcoes: ['Entrada', 'Saída'] },
      { nome: 'Valor',          obrigatorio: true,  tipo: 'number' },
      { nome: 'Categoria',      obrigatorio: true,  tipo: 'select', opcoes: [
          'Dízimo', 'Oferta', 'Missões', 'Doação', 'Evento',
          'Luz', 'Água', 'Aluguel', 'Salário Pastoral', 'Material', 'Manutenção', 'Outros'
      ]},
      { nome: 'Descricao',      obrigatorio: false, tipo: 'text' },
      { nome: 'Membro',         obrigatorio: false, tipo: 'text' },
      { nome: 'FormaPagamento', obrigatorio: false, tipo: 'select', opcoes: [
          'Dinheiro', 'PIX', 'Cartão', 'Transferência', 'Cheque'
      ]},
      { nome: 'Observacoes',    obrigatorio: false, tipo: 'textarea' }
    ],
    Presencas: [
      { nome: 'Data',             obrigatorio: true,  tipo: 'date' },
      { nome: 'Tipo',             obrigatorio: true,  tipo: 'select', opcoes: [
          'Culto de Domingo (manhã)',
          'Culto de Domingo (noite)',
          'Culto de Oração e família',
          'EBD',
          'Culto de Jovens',
          'Culto de Mulheres',
          'Culto de Homens',
          'Santa Ceia',
          'Outros'
      ]},
      { nome: 'Horario',          obrigatorio: false, tipo: 'text' },
      { nome: 'Tema',             obrigatorio: false, tipo: 'text' },
      { nome: 'Pregador',         obrigatorio: false, tipo: 'text' },
      { nome: 'TotalPresentes',   obrigatorio: true,  tipo: 'number' },
      { nome: 'MembrosPresentes', obrigatorio: false, tipo: 'text' },
      { nome: 'Visitantes',       obrigatorio: false, tipo: 'number' },
      { nome: 'Observacoes',      obrigatorio: false, tipo: 'textarea' }
    ],
    Escalas: [
      { nome: 'Data',             obrigatorio: true,  tipo: 'date' },
      { nome: 'Tipo',             obrigatorio: true,  tipo: 'select', opcoes: [
          'Culto de Domingo (manhã)',
          'Culto de Domingo (noite)',
          'Culto de Oração e família',
          'EBD',
          'Culto de Jovens',
          'Culto de Mulheres',
          'Culto de Homens',
          'Santa Ceia',
          'Outros'
      ]},
      { nome: 'Horario',          obrigatorio: false, tipo: 'text' },
      { nome: 'Louvor',           obrigatorio: false, tipo: 'text' },
      { nome: 'Instrumento',      obrigatorio: false, tipo: 'text' },
      { nome: 'Som',              obrigatorio: false, tipo: 'text' },
      { nome: 'Projecao',         obrigatorio: false, tipo: 'text' },
      { nome: 'Oracao',           obrigatorio: false, tipo: 'text' },
      { nome: 'Leitura',          obrigatorio: false, tipo: 'text' },
      { nome: 'Recepcao',         obrigatorio: false, tipo: 'text' },
      { nome: 'Dizimos',          obrigatorio: false, tipo: 'text' },
      { nome: 'Observacoes',      obrigatorio: false, tipo: 'textarea' }
    ]
  },

  COLUNAS_TABELA: {
    Membros:       ['Nome', 'Telefone', 'Talento'],
    BancoTalentos: ['Nome', 'Talento', 'Telefone'],
    Agenda:        ['Data', 'Evento', 'Horario', 'Local'],
    Financeiro:    ['Data', 'Tipo', 'Valor', 'Categoria', 'Descricao'],
    Presencas:     ['Data', 'Tipo', 'TotalPresentes', 'Visitantes', 'Pregador'],
    Escalas:       ['Data', 'Tipo', 'Louvor', 'Som', 'Projecao']
  },

  MENU: [
    {
      secao: 'Principal',
      itens: [
        { id: 'dashboard',  label: 'Início',        icon: 'fa-home',            modulo: 'Dashboard' },
        { id: 'ia',         label: 'Assistente IA', icon: 'fa-robot',           modulo: 'IA' }
      ]
    },
    {
      secao: 'Cadastros',
      itens: [
        { id: 'membros',    label: 'Membros',       icon: 'fa-users',           modulo: 'Membros' },
        { id: 'talentos',   label: 'Talentos',      icon: 'fa-star',            modulo: 'BancoTalentos' },
        { id: 'agenda',     label: 'Agenda',        icon: 'fa-calendar-alt',    modulo: 'Agenda' }
      ]
    },
    {
      secao: 'Cultos',
      itens: [
        { id: 'presenca',   label: 'Presença',      icon: 'fa-clipboard-check', modulo: 'Presenca' },
        { id: 'escalas',    label: 'Escalas',       icon: 'fa-list-check',      modulo: 'Escalas' }
      ]
    },
    {
      secao: 'Administração',
      itens: [
        { id: 'financeiro', label: 'Financeiro',    icon: 'fa-dollar-sign',     modulo: 'Financeiro' }
      ]
    }
  ],

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

  DIAS_SEMANA: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],

  MESES: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
          'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],

  FINANCEIRO: {
    CORES_CATEGORIA: {
      'Dízimo':            '#10b981',
      'Oferta':            '#059669',
      'Missões':           '#0891b2',
      'Doação':            '#06b6d4',
      'Evento':            '#8b5cf6',
      'Luz':               '#f59e0b',
      'Água':              '#0ea5e9',
      'Aluguel':           '#dc2626',
      'Salário Pastoral':  '#7c3aed',
      'Material':          '#f97316',
      'Manutenção':        '#ef4444',
      'Outros':            '#64748b'
    }
  },

  PRESENCA: {
    SEMANAS_AFASTADO: 4,
    CORES_TIPO: {
      'Culto de Domingo (manhã)':   '#2563eb',
      'Culto de Domingo (noite)':   '#1d4ed8',
      'Culto de Oração e família':  '#0891b2',
      'EBD':                        '#7c3aed',
      'Culto de Jovens':            '#f59e0b',
      'Culto de Mulheres':          '#e11d48',
      'Culto de Homens':            '#059669',
      'Santa Ceia':                 '#8b5cf6',
      'Outros':                     '#64748b'
    }
  },

  ESCALAS: {
    FUNCOES: [
      { campo: 'Louvor',      label: '🎤 Louvor',       cor: '#e11d48' },
      { campo: 'Instrumento', label: '🎸 Instrumento',  cor: '#f59e0b' },
      { campo: 'Som',         label: '🔊 Som',          cor: '#0891b2' },
      { campo: 'Projecao',    label: '📽️ Projeção',     cor: '#7c3aed' },
      { campo: 'Oracao',      label: '🙏 Oração',       cor: '#2563eb' },
      { campo: 'Leitura',     label: '📖 Leitura',      cor: '#059669' },
      { campo: 'Recepcao',    label: '👋 Recepção',     cor: '#f97316' },
      { campo: 'Dizimos',     label: '🎁 Dízimos',      cor: '#10b981' }
    ]
  }

};

Object.freeze(CONFIG);
Object.freeze(CONFIG.TABELAS);
Object.freeze(CONFIG.CAMPOS);
Object.freeze(CONFIG.COLUNAS_TABELA);
Object.freeze(CONFIG.MSG);
Object.freeze(CONFIG.MENU);
Object.freeze(CONFIG.DIAS_SEMANA);
Object.freeze(CONFIG.MESES);
Object.freeze(CONFIG.FINANCEIRO);
Object.freeze(CONFIG.PRESENCA);
Object.freeze(CONFIG.PRESENCA.CORES_TIPO);
Object.freeze(CONFIG.ESCALAS);
Object.freeze(CONFIG.ESCALAS.FUNCOES);

console.log(`%c${CONFIG.APP_NAME} v${CONFIG.APP_VERSION}`, 'color:#2563eb;font-weight:bold;font-size:14px;');
console.log('%cConfig carregado (v2.3)', 'color:#64748b;font-size:11px;');
