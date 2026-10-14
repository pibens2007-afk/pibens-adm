/* ============================================================
   PIBENS ADM — API do Portal do Membro
   ============================================================
   Funções específicas pra gerenciar acessos do Portal
   ============================================================ */

const API_Portal = {

  async listarAcessos() {
    const r = await API.chamar('portalListarAcessos', []);
    return r || [];
  },

  async resetarSenha(membroId) {
    return await API.chamar('portalResetarSenha', [membroId]);
  },

  async alternarAtivo(membroId, ativo) {
    return await API.chamar('portalAlternarAtivo', [membroId, ativo]);
  },

  async removerAcesso(membroId) {
    return await API.chamar('portalRemoverAcesso', [membroId]);
  }

};

console.log('%c[API-Portal] Módulo carregado', 'color:#64748b;font-size:11px;');
