/* ============================================================
   PIBENS ADM — Camada de API v3.0
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

      try {
        json = JSON.parse(texto);
      } catch (e) {
        console.error('[API] Resposta não-JSON:', texto.substring(0, 300));
        throw new Error(CONFIG.MSG.ERRO_JSON);
      }

      if (!json.ok) throw new Error(json.erro || CONFIG.MSG.ERRO_GENERICO);
      return json.data;

    } catch (e) {
      clearTimeout(timeoutId);
      if (e.name === 'AbortError') throw new Error(CONFIG.MSG.ERRO_CONEXAO);
      if (e instanceof TypeError && e.message.includes('fetch')) throw new Error('Sem conexão com o servidor.');
      throw e;
    }
  },

  login(senha) { return this.call('login', [senha]); },
  validarCodigo(codigo) { return this.call('validarCodigo', [codigo]); },
  reenviarCodigo() { return this.call('reenviarCodigo'); },

  listar(tabela) { return this.call('listarRegistros', [tabela]); },

  async salvar(tabela, dados, id = null) {
    const r = await this.call('salvarRegistro', [tabela, dados, id]);
    const acao = id ? 'editar' : 'criar';
    const descricao = id
      ? `Editou ${tabela}: ${dados.Nome || dados.Titulo || dados.Evento || '#' + id}`
      : `Criou ${tabela}: ${dados.Nome || dados.Titulo || dados.Evento || 'novo registro'}`;
    this.log(acao, tabela, descricao).catch(() => {});
    return r;
  },

  // ⚠️ AQUI ESTÁ A CORREÇÃO DO BOTÃO APAGAR
  async remover(id, tabela = null, nomeRegistro = null) {
    // Envia o ID e a TABELA para o Apps Script
    const r = await this.call('removerRegistro', [id, tabela]);
    
    const descricao = `Removeu registro${tabela ? ' de ' + tabela : ''}${nomeRegistro ? ': ' + nomeRegistro : ' #' + id}`;
    this.log('remover', tabela || 'Sistema', descricao).catch(() => {});
    return r;
  },

  banners() { return this.call('getHomeBanners'); },

  async devocional() {
    const r = await this.call('devocionalDiario');
    this.log('ia', 'IA', 'Gerou Devocional Diário').catch(() => {});
    return r;
  },

  async duvidaBiblica(q) {
    const r = await this.call('duvidaBiblica', [q]);
    const preview = q.substring(0, 60) + (q.length > 60 ? '...' : '');
    this.log('ia', 'IA', `Perguntou: "${preview}"`).catch(() => {});
    return r;
  },

  async log(acao, modulo, descricao) {
    try {
      const usuario = this._getUsuarioLogado();
      return await this.call('gravarLog', [{
        Acao: acao, Modulo: modulo, Descricao: descricao,
        Usuario: usuario.email, UsuarioNome: usuario.nome,
        Data: new Date().toISOString()
      }]);
    } catch (e) { return null; }
  },

  async listarLogs(filtros = {}) { return this.call('listarLogs', [filtros]); },

  _getUsuarioLogado() {
    try {
      const raw = localStorage.getItem('pibens_adm_usuario');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { email: 'lider@pibens', nome: 'Líder' };
  },

  salvarUsuarioLogado(usuario) {
    try { localStorage.setItem('pibens_adm_usuario', JSON.stringify(usuario)); } catch (e) {}
  }

};

console.log('%c[API] Módulo carregado v3.0', 'color:#64748b;font-size:11px;');
