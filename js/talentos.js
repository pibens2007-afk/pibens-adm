/* ============================================================
   PIBENS ADM — Módulo Talentos v2.1
   ============================================================ */

const Talentos = {

  _dados: [],

  async render() {
    const c = document.getElementById('content');
    if (!c) return;
    c.innerHTML = UI.loading('Carregando talentos...');

    try {
      const dados = await API.listar(CONFIG.TABELAS.TALENTOS);
      this._dados = dados || [];
      this._renderTudo();
    } catch (e) { c.innerHTML = `<div class="empty-state"><div class="empty-state-text">${UI.escapar(e.message)}</div></div>`; }
  },

  _renderTudo() {
    const c = document.getElementById('content');
    const lista = this._dados;

    c.innerHTML = `
      <div class="data-card" style="margin-bottom:24px; background:linear-gradient(135deg, #7c3aed, #8b5cf6); color:#fff; border:none; padding:24px; border-radius:16px;">
        <h2 style="margin:0 0 8px 0; font-size:22px; display:flex; align-items:center; gap:8px;"><i class="fas fa-star"></i> Banco de Talentos</h2>
        <p style="margin:0; font-size:14px; opacity:0.9;">${lista.length} talento(s) registrado(s)</p>
      </div>

      <div class="data-card" style="padding:0; overflow:hidden;">
        <table class="data-table">
          <thead style="background:#1e293b; color:#fff;"><tr><th>Nome</th><th>Talento</th><th>Contato</th></tr></thead>
          <tbody>
            ${lista.length === 0 ? '<tr><td colspan="3" style="text-align:center; padding:20px;">Nenhum talento registrado</td></tr>' : ''}
            ${lista.map(t => {
              const telLimpo = (t.Telefone || '').replace(/\D/g, '');
              const nomeChamada = t.Nome.split(' ')[0];
              const msgWpp = encodeURIComponent(`Olá ${nomeChamada}, a paz do Senhor! Vimos que você tem o talento de "${t.Talento}" e gostaríamos de saber se você gostaria de servir conosco. Deus te abençoe!`);
              
              return `
                <tr>
                  <td><strong>${UI.escapar(t.Nome)}</strong></td>
                  <td><span class="badge" style="background:#ede9fe; color:#7c3aed;">${UI.escapar(t.Talento)}</span></td>
                  <td>
                    ${telLimpo ? `<a href="https://wa.me/55${telLimpo}?text=${msgWpp}" target="_blank" class="btn btn-sm" style="background:#25D366; color:#fff; display:inline-flex; align-items:center; gap:6px;"><i class="fab fa-whatsapp"></i> Chamar</a>` : '<span style="color:#94a3b8; font-size:12px;">Sem telefone</span>'}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
};
console.log('%c[Talentos] Módulo carregado v2.1', 'color:#64748b;font-size:11px;');
