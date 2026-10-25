/* ============================================================
   PIBENS ADM — Módulo Diretoria e Cargos v1.0
   ============================================================ */

const Diretoria = {

  _dados: [],

  async render() {
    const c = document.getElementById('content');
    c.innerHTML = UI.loading('Carregando diretoria...');

    try {
      const dados = await API.call('adminListarCargos');
      this._dados = dados || [];
      this._renderTudo();
    } catch (e) {
      c.innerHTML = `<div class="empty-state"><div class="empty-state-icon" style="color:#dc2626;"><i class="fas fa-exclamation-triangle"></i></div><div class="empty-state-title">Erro</div><div class="empty-state-text">${UI.escapar(e.message)}</div></div>`;
    }
  },

  _renderTudo() {
    const c = document.getElementById('content');
    
    // Agrupa por cargo
    const grupos = {};
    this._dados.forEach(d => {
      if (!grupos[d.cargo]) grupos[d.cargo] = [];
      grupos[d.cargo].push(d);
    });

    c.innerHTML = `
      <div class="membros-toolbar" style="margin-bottom:24px;">
        <div style="flex:1;"></div>
        <div class="membros-filtros">
          <button class="btn btn-success" onclick="Diretoria.novo()">
            <i class="fas fa-plus"></i> Novo Cargo
          </button>
        </div>
      </div>

      ${Object.keys(grupos).length === 0 ? UI.emptyState('Nenhum cargo cadastrado', 'Defina a diretoria e os líderes da igreja.', '') : ''}

      ${Object.keys(grupos).map(cargo => `
        <div class="data-card" style="margin-bottom:16px; padding:20px;">
          <h3 style="font-size:16px; color:#1e293b; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-bottom:16px;">
            <i class="fas fa-crown" style="color:#f59e0b; margin-right:8px;"></i> ${cargo}
          </h3>
          <div style="display:flex; gap:12px; flex-wrap:wrap;">
            ${grupos[cargo].map(d => `
              <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:12px 16px; border-radius:12px; display:flex; align-items:center; gap:12px;">
                <div class="avatar" style="width:40px; height:40px; font-size:16px;">${(d.nome_membro || '?').charAt(0).toUpperCase()}</div>
                <div>
                  <strong style="display:block; color:#1e293b; font-size:14px;">${UI.escapar(d.nome_membro || 'Membro Removido')}</strong>
                  <span style="font-size:12px; color:#64748b;">${d.apelido ? '('+d.apelido+')' : 'Membro'}</span>
                </div>
                <button class="btn btn-danger btn-sm" onclick="Diretoria.remover('${d.id}')" style="margin-left:12px; padding:4px 8px;">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    `;
  },

  novo() {
    const html = `
      <div class="form-secao">
        <div class="form-group">
          <label class="form-label form-label-required">Cargo / Função</label>
          <select class="form-select" id="dir-cargo">
            <option value="Pastor Presidente">Pastor Presidente</option>
            <option value="Vice-Presidente">Vice-Presidente</option>
            <option value="1º Secretário">1º Secretário</option>
            <option value="2º Secretário">2º Secretário</option>
            <option value="1º Tesoureiro">1º Tesoureiro</option>
            <option value="2º Tesoureiro">2º Tesoureiro</option>
            <option value="Líder de Louvor">Líder de Louvor</option>
            <option value="Líder de Jovens">Líder de Jovens</option>
            <option value="Líder de Mulheres">Líder de Mulheres</option>
            <option value="Líder de Homens">Líder de Homens</option>
            <option value="Líder de Missões">Líder de Missões</option>
            <option value="Diácono">Diácono</option>
            <option value="Presbítero">Presbítero</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label form-label-required">Membro</label>
          <select class="form-select" id="dir-membro">
            <option value="">Carregando membros...</option>
          </select>
        </div>
      </div>
    `;

    const botoes = `
      <button class="btn btn-neutral" onclick="UI.closeModal()">Cancelar</button>
      <button class="btn btn-success" onclick="Diretoria._salvar()"><i class="fas fa-save"></i> Salvar Cargo</button>
    `;

    UI.openModal('👑 Adicionar à Diretoria', html, botoes);

    // Preenche o select de membros
    API.listar(CONFIG.TABELAS.MEMBROS).then(membros => {
      const select = document.getElementById('dir-membro');
      if (!select) return;
      select.innerHTML = '<option value="">— Selecione o membro —</option>' + 
        membros.sort((a,b) => a.Nome.localeCompare(b.Nome)).map(m => `<option value="${m.sheetRowIndex}">${m.Nome} ${m.Apelido ? '('+m.Apelido+')' : ''}</option>`).join('');
    });
  },

  async _salvar() {
    const cargo = document.getElementById('dir-cargo').value;
    const membroId = document.getElementById('dir-membro').value;

    if (!membroId) return UI.toast('Selecione um membro', 'error');

    try {
      await API.call('adminCriarCargo', [cargo, membroId]);
      UI.toast('Cargo adicionado!', 'success');
      UI.closeModal();
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  },

  async remover(id) {
    const ok = await UI.confirmar('Remover este membro da diretoria?', 'Remover');
    if (!ok) return;
    try {
      await API.call('adminRemoverCargo', [id]);
      UI.toast('Removido!', 'success');
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  }

};
console.log('%c[Diretoria] Módulo carregado v1.0', 'color:#64748b;font-size:11px;');
