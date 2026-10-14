/* ============================================================
   PIBENS ADM — API do Portal do Membro v1.0
   ============================================================
   Funções específicas pra gerenciar acessos do Portal do Membro
   ============================================================ */

const API_Portal = {

  /**
   * Lista todos os acessos do Portal do Membro
   * Retorna array com: { membro_id, email, ativo, ultimo_login, criado_em, nome }
   */
  listarAcessos() {
    return API.call('portalListarAcessos');
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
