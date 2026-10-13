/* ============================================================
   PIBENS ADM — Camada de API v2.9
   ============================================================
   Responsável por:
   - Fazer requisições POST pro Apps Script
   - Tratar timeout (25s com AbortController)
   - Gravar log de auditoria automaticamente
   - Atalhos específicos (login, OTP, CRUD, IA)
   ============================================================ */

const API = {

  /* ----------------------------------------------------------
     Requisição principal
     ---------------------------------------------------------- */
  async call(funcao, args = []) {
    if (!funcao) throw new Error('Função não especificada.');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);

    try {
      const resp = await fetch(CONFIG.API_URL, {
        method: 'POST',
        cache: 'no-store',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ funcao, args }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const texto = await resp.text();
      let json;

      try {
        json = JSON.parse(texto);
      } catch (e) {
        console.error('[API] Resposta não-JSON:', texto.substring(0, 300));
        throw new Error(CONFIG.MSG.ERRO_JSON);
      }

      if (!json.ok) {
        throw new Error(json.erro || CONFIG.MSG.ERRO_GENERICO);
      }

      return json.data;

    } catch (e) {
      clearTimeout(timeoutId);

      if (e.name === 'AbortError') {
        throw new Error(CONFIG.MSG.ERRO_CONEXAO);
      }

      if (e instanceof TypeError && e.message.includes('fetch')) {
        throw new Error('Sem conexão com o servidor. Verifique sua internet.');
      }

      throw e;
    }
  },

  /* ----------------------------------------------------------
     AUTENTICAÇÃO
     ---------------------------------------------------------- */
  login(senha) {
    return this.call('login', [senha]);
  },

  validarCodigo(codigo) {
    return this.call('validarCodigo', [codigo]);
  },

  reenviarCodigo() {
    return this.call('reenviarCodigo');
  },

  /* ----------------------------------------------------------
     CRUD GENÉRICO COM LOG AUTOMÁTICO
     ---------------------------------------------------------- */
  listar(tabela) {
    return this.call('listarRegistros', [tabela]);
  },

  async salvar(tabela, dados, id = null) {
    const r = await this.call('salvarRegistro', [tabela, dados, id]);

    // Grava log automaticamente (sem bloquear)
    const acao = id ? 'editar' : 'criar';
    const descricao = id
      ? `Editou ${tabela}: ${dados.Nome || dados.Evento || dados.Descricao || '#' + id}`
      : `Criou ${tabela}: ${dados.Nome || dados.Evento || dados.Descricao || 'novo registro'}`;

    this.log(acao, tabela, descricao).catch(() => {});

    return r;
  },

  async remover(id, tabela = null, nomeRegistro = null) {
    const r = await this.call('removerRegistro', [id]);

    // Grava log automaticamente
    const descricao = `Removeu registro${tabela ? ' de ' + tabela : ''}${nomeRegistro ? ': ' + nomeRegistro : ' #' + id}`;
    this.log('remover', tabela || 'Sistema', descricao).catch(() => {});

    return r;
  },

  /* ----------------------------------------------------------
     BANNERS
     ---------------------------------------------------------- */
  banners() {
    return this.call('getHomeBanners');
  },

  /* ----------------------------------------------------------
     IA (GROQ) — com log automático
     ---------------------------------------------------------- */
  async devocional() {
    const r = await this.call('devocionalDiario');
    this.log('ia', 'IA', 'Gerou Devocional Diário').catch(() => {});
    return r;
  },

  async resumirAgenda() {
    const r = await this.call('resumirAgenda');
    this.log('ia', 'IA', 'Gerou resumo de agenda').catch(() => {});
    return r;
  },

  async duvidaBiblica(q) {
    const r = await this.call('duvidaBiblica', [q]);
    const preview = q.substring(0, 60) + (q.length > 60 ? '...' : '');
    this.log('ia', 'IA', `Perguntou: "${preview}"`).catch(() => {});
    return r;
  },

  async relatorioMensal() {
    const r = await this.call('relatorioMensal');
    this.log('ia', 'IA', 'Gerou relatório mensal').catch(() => {});
    return r;
  },

  /* ----------------------------------------------------------
     FINANCEIRO
     ---------------------------------------------------------- */
  listarFinanceiro() {
    return this.listar(CONFIG.TABELAS.FINANCEIRO);
  },

  salvarFinanceiro(dados, id = null) {
    return this.salvar(CONFIG.TABELAS.FINANCEIRO, dados, id);
  },

  removerFinanceiro(id) {
    return this.remover(id, CONFIG.TABELAS.FINANCEIRO);
  },

  /* ----------------------------------------------------------
     LOG DE AUDITORIA
     ---------------------------------------------------------- */

  /**
   * Grava uma ação no log
   * @param {string} acao - login | criar | editar | remover | ia | logout
   * @param {string} modulo - Módulo onde aconteceu (Membros, Financeiro, etc.)
   * @param {string} descricao - Descrição da ação
   */
  async log(acao, modulo, descricao) {
    try {
      // Identifica o usuário atual (sessão)
      const usuario = this._getUsuarioLogado();

      return await this.call('gravarLog', [{
        Acao: acao,
        Modulo: modulo,
        Descricao: descricao,
        Usuario: usuario.email,
        UsuarioNome: usuario.nome,
        Data: new Date().toISOString()
      }]);
    } catch (e) {
      // Falha silenciosa (não bloqueia a ação principal)
      console.warn('[LOG] Falha ao gravar:', e.message);
      return null;
    }
  },

  /**
   * Lista logs (só pra consulta — não permite editar)
   */
  async listarLogs(filtros = {}) {
    return this.call('listarLogs', [filtros]);
  },

  /**
   * Pega informações do usuário logado (da sessão)
   */
  _getUsuarioLogado() {
    try {
      const raw = localStorage.getItem('pibens_adm_usuario');
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignora */ }

    return {
      email: 'lider@pibens',
      nome: 'Líder'
    };
  },

  /**
   * Salva o usuário logado (chamado após OTP bem-sucedido)
   */
  salvarUsuarioLogado(usuario) {
    try {
      localStorage.setItem('pibens_adm_usuario', JSON.stringify(usuario));
    } catch (e) { /* ignora */ }
  }

};

/* ----------------------------------------------------------
   Helper: executa uma chamada com tratamento de erro
   ---------------------------------------------------------- */
async function APIComErro(fn, mostrarToast = true) {
  try {
    return await fn();
  } catch (e) {
    console.error('[API]', e);
    if (mostrarToast && typeof UI !== 'undefined') {
      UI.toast(e.message || CONFIG.MSG.ERRO_GENERICO, 'error');
    }
    throw e;
  }
}

console.log('%c[API] Módulo carregado (v2.9 com Log)', 'color:#64748b;font-size:11px;');
