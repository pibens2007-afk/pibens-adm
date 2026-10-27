/* ============================================================
   PIBENS ADM — Camada de API v3.2
   ============================================================ */

const API = {
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
      try { json = JSON.parse(texto); }
      catch (e) { throw new Error(CONFIG.MSG.ERRO_JSON); }

      if (!json.ok) throw new Error(json.erro || CONFIG.MSG.ERRO_GENERICO);
      return json.data;
    } catch (e) {
      clearTimeout(timeoutId);
      if (e.name === 'AbortError') throw new Error(CONFIG.MSG.ERRO_CONEXAO);
      if (e instanceof TypeError && e.message.includes('fetch')) throw new Error('Sem conexão com o servidor.');
      throw e;
    }
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
