/* ============================================================
   PIBENS ADM — Camada de API v3.2
   ============================================================ */

const API = {
  _idempotentes: ['listarRegistros', 'listarLogs', 'getHomeBanners', 'portalListarAcessos'],

  _ehIdempotente(funcao) {
    return this._idempotentes.includes(funcao) || /^(listar|get|portalListar)/i.test(funcao);
  },

  async call(funcao, args = [], opcoes = {}) {
    if (!funcao) throw new Error('Função não especificada.');

    const maxTentativas = opcoes.tentativas || (this._ehIdempotente(funcao) ? 2 : 1);
    const timeout = opcoes.timeout || CONFIG.API_TIMEOUT;
    let ultimoErro = null;

    for (let tentativa = 1; tentativa <= maxTentativas; tentativa++) {
      try {
        return await this._executar(funcao, args, timeout);
      } catch (e) {
        ultimoErro = e;
        if (!e.transitorio || tentativa === maxTentativas) throw e;
        await new Promise((r) => setTimeout(r, 700 * tentativa));
      }
    }

    throw ultimoErro;
  },

  async _executar(funcao, args, timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

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

      if (resp.redirected && /accounts\.google\.com|servicelogin/i.test(resp.url)) {
        throw this._erroAutorizacao();
      }

      const texto = await resp.text();
      const tipo = resp.headers.get('content-type') || '';

      if (tipo.includes('text/html') || texto.trim().startsWith('<')) {
        throw this._erroAutorizacao();
      }

      let json;
      try { json = JSON.parse(texto); }
      catch (e) { throw this._erroRespostaInvalida(); }

      if (!json.ok) {
        const erro = new Error(json.erro || CONFIG.MSG.ERRO_GENERICO);
        erro.transitorio = false;
        throw erro;
      }

      return json.data;

    } catch (e) {
      clearTimeout(timeoutId);

      if (e.name === 'AbortError') {
        const erro = new Error(CONFIG.MSG.ERRO_CONEXAO);
        erro.transitorio = true;
        throw erro;
      }

      if (e instanceof TypeError && /fetch|network|failed/i.test(e.message)) {
        const erro = new Error(CONFIG.MSG.ERRO_SEM_CONEXAO);
        erro.transitorio = true;
        throw erro;
      }

      throw e;
    }
  },

  _erroAutorizacao() {
    const erro = new Error(CONFIG.MSG.ERRO_AUTORIZACAO);
    erro.transitorio = false;
    erro.codigo = 'AUTORIZACAO';
    return erro;
  },

  _erroRespostaInvalida() {
    const erro = new Error(CONFIG.MSG.ERRO_JSON);
    erro.transitorio = false;
    erro.codigo = 'RESPOSTA';
    return erro;
  },

  login(email, senha) { return this.call('login', [email, senha]); },
  validarCodigo(email, codigo) { return this.call('validarCodigo', [email, codigo]); },
  reenviarCodigo(email) { return this.call('reenviarCodigo', [email]); },

  listar(tabela) { return this.call('listarRegistros', [tabela]); },

  async salvar(tabela, dados, id = null) {
    const r = await this.call('salvarRegistro', [tabela, dados, id]);
    const acao = id ? 'editar' : 'criar';
    const descricao = id ? `Editou ${tabela}: ${dados.Nome || dados.Titulo || dados.Evento || '#' + id}` : `Criou ${tabela}: ${dados.Nome || dados.Titulo || dados.Evento || 'novo'}`;
    this.log(acao, tabela, descricao).catch(() => {});
    return r;
  },

  async remover(id, tabela = null, nomeRegistro = null) {
    const r = await this.call('removerRegistro', [id, tabela]);
    const descricao = `Removeu registro${tabela ? ' de ' + tabela : ''}${nomeRegistro ? ': ' + nomeRegistro : ' #' + id}`;
    this.log('remover', tabela || 'Sistema', descricao).catch(() => {});
    return r;
  },

  banners() { return this.call('getHomeBanners'); },

  async log(acao, modulo, descricao) {
    try {
      const usuario = this._getUsuarioLogado();
      return await this.call('gravarLog', [{ Acao: acao, Modulo: modulo, Descricao: descricao, Usuario: usuario.email, UsuarioNome: usuario.nome, Data: new Date().toISOString() }]);
    } catch (e) { return null; }
  },

  async listarLogs(filtros = {}) { return this.call('listarLogs', [filtros]); },

  _getUsuarioLogado() {
    try { const raw = localStorage.getItem('pibens_adm_usuario'); if (raw) return JSON.parse(raw); } catch (e) {}
    return { email: 'sistema@pibens', nome: 'Sistema' };
  }
};
console.log('%c[API] Módulo carregado v3.2', 'color:#64748b;font-size:11px;');
