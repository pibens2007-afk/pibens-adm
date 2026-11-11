/* ============================================================
   PIBENS ADM — API do Portal do Membro v1.0
   ============================================================
   Funções específicas pra gerenciar acessos do Portal do Membro
   ============================================================ */

const API_Portal = {

  _cacheAcessos: null,
  _cacheTs: 0,
  _cacheTtl: 120000,

  /**
   * Lista todos os acessos do Portal do Membro
   * Retorna array com: { membro_id, email, ativo, ultimo_login, criado_em, nome }
   * Usa cache de 2 minutos para evitar a chamada lenta (~25s) a cada re-render.
   */
  async listarAcessos(force = false) {
    const agora = Date.now();
    if (!force && this._cacheAcessos && (agora - this._cacheTs) < this._cacheTtl) {
      return this._cacheAcessos;
    }

    const dados = await API.call('portalListarAcessos');
    this._cacheAcessos = dados || [];
    this._cacheTs = agora;
    return this._cacheAcessos;
  },

  atualizarCache(dados) {
    this._cacheAcessos = dados || [];
    this._cacheTs = Date.now();
  },

  invalidarCache() {
    this._cacheAcessos = null;
    this._cacheTs = 0;
  },

  /**
   * Reseta a senha de um membro pra padrão pibens@2026
   * @param {string} membroId - ID do membro
   */
  async resetarSenha(membroId) {
    const r = await API.call('portalResetarSenha', [membroId]);
    // Log de auditoria
    API.log('editar', 'Portal do Membro', `Resetou senha do membro #${membroId}`).catch(() => {});
    return r;
  },

  /**
   * Ativa/desativa um acesso
   * @param {string} membroId - ID do membro
   * @param {boolean} ativo - true pra ativar, false pra bloquear
   */
  async alternarAtivo(membroId, ativo) {
    const r = await API.call('portalAlternarAtivo', [membroId, ativo]);
    const acao = ativo ? 'Desbloqueou' : 'Bloqueou';
    API.log('editar', 'Portal do Membro', `${acao} acesso do membro #${membroId}`).catch(() => {});
    return r;
  },

  /**
   * Remove o acesso de um membro
   * @param {string} membroId - ID do membro
   */
  async removerAcesso(membroId) {
    const r = await API.call('portalRemoverAcesso', [membroId]);
    API.log('remover', 'Portal do Membro', `Removeu acesso do membro #${membroId}`).catch(() => {});
    return r;
  }

};

console.log('%c[API-Portal] Módulo carregado', 'color:#64748b;font-size:11px;');
