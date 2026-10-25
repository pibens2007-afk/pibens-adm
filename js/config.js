/* ============================================================
   PIBENS ADM — Configurações Globais
   ============================================================ */

const _AUTORIA_PIBENS_ADM_ = Object.freeze({
  autor: 'Fabio Silva dos Anjos', email: 'fabio110386@gmail.com', projeto: 'PIBENS ADM', ano: 2026,
  hash: 'a7f3e9b2c4d5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1', versao: 'Autoria v1.0'
});

function _assinaturaAutoralPibensAdm2026_Fabio() { return 'PIBENS ADM © 2026 Fabio Silva dos Anjos — Hash: a7f3e9b2'; }

console.log('%c⚠️ CÓDIGO PROTEGIDO', 'color:#dc2626;font-size:22px;font-weight:900;text-shadow:1px 1px 3px rgba(0,0,0,0.3);');
console.log('%c© 2026 PIBENS ADM — Todos os direitos reservados\nDesenvolvido por: Fabio Silva dos Anjos\nContato: fabio110386@gmail.com\nHash de autoria: a7f3e9b2c4d5f6a7...\n\nEste código é propriedade intelectual protegida.\nO uso não autorizado é proibido por lei.', 'color:#475569;font-size:13px;line-height:1.7;font-family:monospace;');

const CONFIG = {

  API_URL: 'https://script.google.com/macros/s/AKfycbwUl-1KPF40lIc8FR8itFEYVkq5XhQlNXVvM6D_Hp2-3a2gaVAwg1AX1gZFS0hcaPeS_w/exec',
  API_TIMEOUT: 25000,

  SESSAO_KEY: 'pibens_adm_sessao',
  SESSAO_DIAS: 7,

  APP_NAME: 'PIBENS ADM',
  APP_SHORT_NAME: 'PIBENS',
  APP_TAGLINE: 'Gestão eclesiástica com inteligência',
  APP_VERSION: '4.4.0',

  TABELAS: {
    MEMBROS:      'Membros',
    TALENTOS:     'BancoTalentos',
    AGENDA:       'Agenda',
    FINANCEIRO:   'Financeiro',
    PRESENCAS:    'Presencas',
    ESCALAS:      'Escalas',
    DISCIPULADO:  'Discipulado',
    LOGS:         'Logs',
    MURAL:        'Mural'
  },

  MINISTERIOS: [
    { nome: 'Ministério de Homens',         cor: '#2563eb', icon: 'fa-male' },
    { nome: 'Ministério de Mulheres',       cor: '#e11d48', icon: 'fa-female' },
    { nome: 'Ministério de Jovens',         cor: '#7c3aed', icon: 'fa-user-tie' },
    { nome: 'Ministério de Adolescentes',   cor: '#0891b2', icon: 'fa-user-graduate' },
    { nome: 'Ministério de Crianças',       cor: '#f59e0b', icon: 'fa-child' },
    { nome: 'Ministério de Evangelismo',    cor: '#059669', icon: 'fa-bullhorn' },
    { nome: 'Ministério de Levitas',        cor: '#8b5cf6', icon: 'fa-music' },
    { nome: 'Ministério de Ação Social',    cor: '#f97316', icon: 'fa-hand-holding-heart' },
    { nome: 'Ministério de Intercessão',    cor: '#dc2626', icon: 'fa-praying-hands' },
    { nome: 'Ministério Infantil',          cor: '#ec4899', icon: 'fa-baby' },
    { nome: 'Missões',                      cor: '#0891b2', icon: 'fa-globe' },
    { nome: 'Diaconato',                    cor: '#6366f1', icon: 'fa-hand-holding' },
    { nome: 'Pastoral',                     cor: '#7c2d12', icon: 'fa-bible' },
    { nome: 'Liderança',                    cor: '#a16207', icon: 'fa-crown' },
    { nome: 'Louvor',                       cor: '#be185d', icon: 'fa-guitar' },
    { nome: 'Outros',                       cor: '#64748b', icon: 'fa-ellipsis-h' }
  ],

  CAMPOS: {
    Membros: [
      { nome: 'Nome',                obrigatorio: true,  tipo: 'text' },
      { nome: 'Apelido',             obrigatorio: false, tipo: 'text' },
      { nome: 'Sexo',                obrigatorio: false, tipo: 'select', opcoes: ['Masculino', 'Feminino'] },
      { nome: 'Cargo de Liderança',  obrigatorio: false, tipo: 'text' },
      { nome: 'Nascimento',          obrigatorio: true,  tipo: 'date' },
      { nome: 'CPF',                 obrigatorio: false, tipo: 'text' },
      { nome: 'RG',                  obrigatorio: false, tipo: 'text' },
      { nome: 'Telefone',            obrigatorio: true,  tipo: 'text' },
      { nome: 'Email',               obrigatorio: false, tipo: 'email' },
      { nome: 'Endereço',            obrigatorio: false, tipo: 'text' },
      { nome: 'Bairro',              obrigatorio: false, tipo: 'text' },
      { nome: 'Cidade',              obrigatorio: false, tipo: 'text' },
      { nome: 'Estado',              obrigatorio: false, tipo: 'text' },
      { nome: 'CEP',                 obrigatorio: false, tipo: 'text' },
      { nome: 'Estado Civil',        obrigatorio: false, tipo: 'select', opcoes: ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'Outro'] },
      { nome: 'Nome do Cônjuge',     obrigatorio: false, tipo: 'text' },
      { nome: 'Parentesco',          obrigatorio: false, tipo: 'text' },
      { nome: 'Profissão',           obrigatorio: false, tipo: 'text' },
      { nome: 'Já foi batizado?',    obrigatorio: false, tipo: 'select', opcoes: ['SIM', 'NÃO'] },
      { nome: 'Data de Batismo',     obrigatorio: false, tipo: 'date' },
      { nome: 'Situação',            obrigatorio: false, tipo: 'select', opcoes: ['Ativo', 'Inativo'] },
      { nome: 'Categoria',           obrigatorio: false, tipo: 'select', opcoes: ['Membro', 'Frequentador', 'Visitante'] },
      { nome: 'Função',              obrigatorio: false, tipo: 'text' },
      { nome: 'Talento',             obrigatorio: false, tipo: 'text' },
      { nome: 'Data de Membro',      obrigatorio: false, tipo: 'date' },
      { nome: 'Observações',         obrigatorio: false, tipo: 'textarea' }
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
          'Culto de Domingo (manhã)', 'Culto de Domingo (noite)',
          'Culto de Oração e família', 'EBD', 'Culto de Jovens',
          'Culto de Mulheres', 'Culto de Homens', 'Santa Ceia', 'Outros'
      ]},
      { nome: 'Tema',             obrigatorio: false, tipo: 'text' },
      { nome: 'Pregador',         obrigatorio: false, tipo: 'text' },
      { nome: 'TotalPresentes',   obrigatorio: true,  tipo: 'number' },
      { nome: 'Visitantes',       obrigatorio: false, tipo: 'text' },
      { nome: 'Link do Culto',    obrigatorio: false, tipo: 'url' },
      { nome: 'Observacoes',      obrigatorio: false, tipo: 'textarea' }
    ],
    Escalas: [
      { nome: 'Data',             obrigatorio: true,  tipo: 'date' },
      { nome: 'Tipo',             obrigatorio: true,  tipo: 'select', opcoes: [
          'Culto de Domingo (manhã)', 'Culto de Domingo (noite)',
          'Culto de Oração e família', 'EBD', 'Culto de Jovens',
          'Culto de Mulheres', 'Culto de Homens', 'Santa Ceia', 'Outros'
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
    ],
    Discipulado: [
      { nome: 'Nome',          obrigatorio: true,  tipo: 'text' },
      { nome: 'DataDecisao',   obrigatorio: true,  tipo: 'date' },
      { nome: 'Idade',         obrigatorio: false, tipo: 'number' },
      { nome: 'Telefone',      obrigatorio: false, tipo: 'text' },
      { nome: 'Endereco',      obrigatorio: false, tipo: 'text' },
      { nome: 'Discipulador',  obrigatorio: false, tipo: 'text' },
      { nome: 'Etapa',         obrigatorio: true,  tipo: 'select', opcoes: [
          'Novo Convertido', 'Em Discipulado', 'Pronto para Batismo', 'Batizado'
      ]},
      { nome: 'DataBatismo',   obrigatorio: false, tipo: 'date' },
      { nome: 'Observacoes',   obrigatorio: false, tipo: 'textarea' }
    ],
    Mural: [
      { nome: 'Titulo',       obrigatorio: true,  tipo: 'text' },
      { nome: 'Mensagem',     obrigatorio: true,  tipo: 'textarea' },
      { nome: 'Tipo',         obrigatorio: true,  tipo: 'select', opcoes: ['Info', 'Importante', 'Urgente', 'Evento'] },
      { nome: 'Prioridade',   obrigatorio: true,  tipo: 'select', opcoes: ['Normal', 'Importante', 'Urgente'] },
      { nome: 'Autor',        obrigatorio: false, tipo: 'text' },
      { nome: 'Fixo',         obrigatorio: false, tipo: 'select', opcoes: ['Sim', 'Não'] },
      { nome: 'DataExpira',   obrigatorio: false, tipo: 'date' }
    ]
  },

  COLUNAS_TABELA: {
    Membros:       ['Nome', 'Telefone', 'Ministérios', 'Situação'],
    BancoTalentos: ['Nome', 'Talento', 'Telefone'],
    Agenda:        ['Data', 'Evento', 'Horario', 'Local'],
    Financeiro:    ['Data', 'Tipo', 'Valor', 'Categoria', 'Descricao'],
    Presencas:     ['Data', 'Tipo', 'TotalPresentes', 'Visitantes', 'Pregador'],
    Escalas:       ['Data', 'Tipo', 'Louvor', 'Som', 'Projecao'],
    Discipulado:   ['Nome', 'Etapa', 'Discipulador', 'DataDecisao'],
    Mural:         ['Titulo', 'Tipo', 'Autor']
  },

  MENU: [
    {
      secao: 'Principal',
      itens: [
        { id: 'dashboard',     label: 'Início',            icon: 'fa-home',            modulo: 'Dashboard' },
        { id: 'mural',         label: 'Mural',             icon: 'fa-bullhorn',        modulo: 'Mural' },
        { id: 'calendario',    label: 'Calendário Batista', icon: 'fa-bookmark',       modulo: 'Calendario' },
        { id: 'aniversarios',  label: 'Aniversariantes',   icon: 'fa-birthday-cake',   modulo: 'Aniversariantes' },
        { id: 'ia',            label: 'Assistente IA',     icon: 'fa-robot',           modulo: 'IA' }
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
      secao: 'Pastoral',
      itens: [
        { id: 'diretoria',      label: 'Diretoria',         icon: 'fa-crown',         modulo: 'Diretoria' },
        { id: 'discipulado',    label: 'Discipulado',       icon: 'fa-seedling',      modulo: 'Discipulado' },
        { id: 'pedidos-oracao', label: 'Pedidos de Oração', icon: 'fa-praying-hands', modulo: 'PedidosOracao' }
      ]
    },
    {
      secao: 'Administração',
      itens: [
        { id: 'financeiro',  label: 'Financeiro',  icon: 'fa-dollar-sign',     modulo: 'Financeiro' },
        { id: 'relatorios',  label: 'Relatórios',  icon: 'fa-file-pdf',        modulo: 'Relatorios' },
        { id: 'logs',        label: 'Log de Atividades', icon: 'fa-history',   modulo: 'Logs' }
      ]
    },
    {
      secao: 'Integrações',
      itens: [
        { id: 'portal-membro', label: 'Portal do Membro', icon: 'fa-mobile-alt', modulo: 'PortalMembro' },
        { id: 'enquetes',      label: 'Enquetes',         icon: 'fa-poll',       modulo: 'Enquetes' },
        { id: 'testemunhos',   label: 'Testemunhos',      icon: 'fa-microphone', modulo: 'Testemunhos' }
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
  DIAS_SEMANA_ABREV: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'],

  MESES: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],

  FINANCEIRO: {
    CORES_CATEGORIA: {
      'Dízimo': '#10b981', 'Oferta': '#059669', 'Missões': '#0891b2',
      'Doação': '#06b6d4', 'Evento': '#8b5cf6', 'Luz': '#f59e0b',
      'Água': '#0ea5e9', 'Aluguel': '#dc2626', 'Salário Pastoral': '#7c3aed',
      'Material': '#f97316', 'Manutenção': '#ef4444', 'Outros': '#64748b'
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
  },

  DISCIPULADO: {
    ETAPAS: [
      { nome: 'Novo Convertido',      cor: '#0891b2', icon: 'fa-seedling',  progresso: 25 },
      { nome: 'Em Discipulado',       cor: '#2563eb', icon: 'fa-book-open', progresso: 50 },
      { nome: 'Pronto para Batismo',  cor: '#f59e0b', icon: 'fa-check',     progresso: 75 },
      { nome: 'Batizado',             cor: '#059669', icon: 'fa-water',     progresso: 100 }
    ]
  },

  ANIVERSARIANTES: {
    DIAS_SEMANA_DESTAQUE: 7,
    MENSAGENS_WHATS: [
      'Olá {nome}! 🎉 A liderança da igreja quer te desejar um feliz aniversário! Que Deus te abençoe ricamente neste novo ano de vida. Parabéns! 🎂🙏',
      'Parabéns, {nome}! 🎉 Que este novo ano seja repleto de bênçãos, saúde e alegria. A igreja se alegra com você! 🎂✨',
      'Feliz aniversário, {nome}! 🎂 Que o Senhor continue te guiando e abençoando. Um forte abraço de toda a igreja! 🙏🎉'
    ]
  },

  FAIXAS_ETARIAS: [
    { nome: 'Criança',       min: 0,  max: 11, cor: '#0891b2', icon: 'fa-child' },
    { nome: 'Adolescente',   min: 12, max: 17, cor: '#2563eb', icon: 'fa-user-graduate' },
    { nome: 'Jovem',         min: 18, max: 21, cor: '#7c3aed', icon: 'fa-user-tie' },
    { nome: 'Adulto',        min: 22, max: 59, cor: '#059669', icon: 'fa-user' },
    { nome: 'Idoso',         min: 60, max: 200, cor: '#f59e0b', icon: 'fa-user-clock' }
  ],

  RELATORIOS: [
    { id: 'membros',      nome: 'Membros',           icon: 'fa-users',           cor: '#2563eb', desc: 'Total, ativos, categorias, ministérios, faixa etária' },
    { id: 'financeiro',   nome: 'Financeiro',        icon: 'fa-dollar-sign',     cor: '#059669', desc: 'Entradas, saídas, saldo, top categorias' },
    { id: 'presenca',     nome: 'Presença',          icon: 'fa-clipboard-check', cor: '#0891b2', desc: 'Cultos, média, top membros, afastados' },
    { id: 'escalas',      nome: 'Escalas',           icon: 'fa-list-check',      cor: '#7c3aed', desc: 'Escalas futuras, vagas em aberto' },
    { id: 'discipulado',  nome: 'Discipulado',       icon: 'fa-seedling',        cor: '#f59e0b', desc: 'Por etapa, prontos para batismo' },
    { id: 'aniversarios', nome: 'Aniversariantes',   icon: 'fa-birthday-cake',   cor: '#e11d48', desc: 'Do mês, por dia' }
  ],

  LOGS: {
    TIPOS: [
      { id: 'login',    nome: 'Login',         icon: 'fa-sign-in-alt',    cor: '#2563eb' },
      { id: 'criar',    nome: 'Criar',         icon: 'fa-plus-circle',    cor: '#059669' },
      { id: 'editar',   nome: 'Editar',        icon: 'fa-edit',           cor: '#f59e0b' },
      { id: 'remover',  nome: 'Remover',       icon: 'fa-trash',          cor: '#dc2626' },
      { id: 'ia',       nome: 'IA',            icon: 'fa-robot',          cor: '#7c3aed' },
      { id: 'logout',   nome: 'Logout',        icon: 'fa-sign-out-alt',   cor: '#64748b' }
    ],
    RETENCAO_DIAS: 365
  },

  MURAL: {
    TIPOS: [
      { id: 'Info',        nome: 'Informativo',  cor: '#2563eb', icon: 'fa-info-circle',      bg: '#eff6ff' },
      { id: 'Importante',  nome: 'Importante',   cor: '#f59e0b', icon: 'fa-exclamation-circle', bg: '#fef3c7' },
      { id: 'Urgente',     nome: 'Urgente',      cor: '#dc2626', icon: 'fa-bell',             bg: '#fee2e2' },
      { id: 'Evento',      nome: 'Evento',       cor: '#7c3aed', icon: 'fa-calendar-star',    bg: '#ede9fe' }
    ],
    PRIORIDADES: [
      { id: 'Normal',      cor: '#64748b', ordem: 1 },
      { id: 'Importante',  cor: '#f59e0b', ordem: 2 },
      { id: 'Urgente',     cor: '#dc2626', ordem: 3 }
    ]
  }

};

Object.freeze(CONFIG);
Object.freeze(CONFIG.TABELAS);
Object.freeze(CONFIG.MINISTERIOS);
Object.freeze(CONFIG.CAMPOS);
Object.freeze(CONFIG.COLUNAS_TABELA);
Object.freeze(CONFIG.MSG);
Object.freeze(CONFIG.MENU);
Object.freeze(CONFIG.DIAS_SEMANA);
Object.freeze(CONFIG.DIAS_SEMANA_ABREV);
Object.freeze(CONFIG.MESES);
Object.freeze(CONFIG.FINANCEIRO);
Object.freeze(CONFIG.PRESENCA);
Object.freeze(CONFIG.PRESENCA.CORES_TIPO);
Object.freeze(CONFIG.ESCALAS);
Object.freeze(CONFIG.ESCALAS.FUNCOES);
Object.freeze(CONFIG.DISCIPULADO);
Object.freeze(CONFIG.DISCIPULADO.ETAPAS);
Object.freeze(CONFIG.ANIVERSARIANTES);
Object.freeze(CONFIG.ANIVERSARIANTES.MENSAGENS_WHATS);
Object.freeze(CONFIG.FAIXAS_ETARIAS);
Object.freeze(CONFIG.RELATORIOS);
Object.freeze(CONFIG.LOGS);
Object.freeze(CONFIG.LOGS.TIPOS);
Object.freeze(CONFIG.MURAL);
Object.freeze(CONFIG.MURAL.TIPOS);
Object.freeze(CONFIG.MURAL.PRIORIDADES);

console.log(`%c${CONFIG.APP_NAME} v${CONFIG.APP_VERSION}`, 'color:#2563eb;font-weight:bold;font-size:14px;');
console.log('%c© 2026 Fabio Silva dos Anjos — Uso não autorizado é proibido.', 'color:#dc2626;font-size:11px;');
