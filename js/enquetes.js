/* ============================================================
   PIBENS ADM — Módulo Enquetes v1.0
   ============================================================
   © 2026 Fabio Silva dos Anjos — Todos os direitos reservados
   ============================================================ */

const Enquetes = {

  _dados: [],

  /* ----------------------------------------------------------
     RENDER PRINCIPAL
     ---------------------------------------------------------- */
  async render() {
    const c = document.getElementById('content');
    if (!c) return;

    c.innerHTML = UI.loading('Carregando enquetes...');

    try {
      const dados = await API.call('adminEnquetesListar');
      this._dados = dados || [];
      this._renderTudo();
    } catch (e) {
      c.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon" style="color:#dc2626;"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="empty-state-title">Erro ao carregar</div>
          <div class="empty-state-text">${UI.escapar(e.message)}</div>
          <button class="btn btn-primary" onclick="Enquetes.render()">
            <i class="fas fa-sync"></i> Tentar de novo
          </button>
        </div>
      `;
    }
  },

  _renderTudo() {
    const c = document.getElementById('content');
    const ativas = this._dados.filter(e => e.status === 'ativa');
    const encerradas = this._dados.filter(e => e.status === 'encerrada');

    c.innerHTML = `
      <div class="membros-stats">
        <div class="membros-stat">
          <i class="fas fa-poll" style="color:#8B5CF6;"></i>
          <div>
            <span class="membros-stat-value">${this._dados.length}</span>
            <span class="membros-stat-label">Total</span>
          </div>
        </div>
        <div class="membros-stat">
          <i class="fas fa-check-circle" style="color:#059669;"></i>
          <div>
            <span class="membros-stat-value">${ativas.length}</span>
            <span class="membros-stat-label">Ativas</span>
          </div>
        </div>
        <div class="membros-stat">
          <i class="fas fa-ban" style="color:#dc2626;"></i>
          <div>
            <span class="membros-stat-value">${encerradas.length}</span>
            <span class="membros-stat-label">Encerradas</span>
          </div>
        </div>
      </div>

      <div class="membros-toolbar">
        <div style="flex:1;"></div>
        <div class="membros-filtros">
          <button class="btn btn-success" onclick="Enquetes.nova()">
            <i class="fas fa-plus"></i> Nova Enquete
          </button>
        </div>
      </div>

      ${this._dados.length === 0 ? UI.emptyState(
        'Nenhuma enquete criada',
        'Crie a primeira enquete para ouvir a igreja.',
        `<button class="btn btn-success btn-lg" onclick="Enquetes.nova()"><i class="fas fa-plus"></i> Criar primeira enquete</button>`
      ) : this._dados.map(e => this._renderCard(e)).join('')}
    `;
  },

  _renderCard(e) {
    const ativa = e.status === 'ativa';
    const totalVotos = e.totalVotos || 0;
    const opcoes = e.opcoes || [];

    const opcoesHtml = opcoes.map((op, idx) => {
      const votos = (e.votos || {})[idx] || 0;
      const pct = totalVotos > 0 ? Math.round((votos / totalVotos) * 100) : 0;
      return `
        <div class="enquete-admin-opcao">
          <div class="enquete-admin-bar" style="width:${pct}%"></div>
          <div class="enquete-admin-info">
            <span><strong>${UI.escapar(op)}</strong></span>
            <span>${votos} voto(s) · ${pct}%</span>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="data-card" style="padding:16px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
          <div style="flex:1;">
            <h3 style="margin:0;font-size:16px;">${UI.escapar(e.pergunta)}</h3>
            ${e.descricao ? '<p style="color:#64748b;margin-top:4px;font-size:13px;">' + UI.escapar(e.descricao) + '</p>' : ''}
          </div>
          <span style="padding:4px 10px;border-radius:12px;font-size:11px;font-weight:700;background:${ativa ? 'rgba(16,185,129,0.15)' : 'rgba(220,38,38,0.15)'};color:${ativa ? '#059669' : '#DC2626'};">
            ${ativa ? '✅ Ativa' : '⛔ Encerrada'}
          </span>
        </div>

        <div style="margin:16px 0;">${opcoesHtml}</div>

        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid #E5E7EB;">
          <span style="font-size:12px;color:#64748b;">
            <strong>${totalVotos}</strong> voto(s) no total
          </span>
          <div style="display:flex;gap:6px;">
            ${ativa ? `
              <button class="btn btn-warning btn-sm" onclick="Enquetes.encerrar('${e.id}')" title="Encerrar enquete">
                <i class="fas fa-ban"></i> Encerrar
              </button>
            ` : ''}
            <button class="btn btn-danger btn-sm" onclick="Enquetes.remover('${e.id}')" title="Excluir">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  /* ----------------------------------------------------------
     CRIAR NOVA ENQUETE
     ---------------------------------------------------------- */
  nova() {
    const html = `
      <div class="form-secao">
        <div class="form-group">
          <label class="form-label form-label-required">Pergunta</label>
          <input class="form-input" id="enq-pergunta" placeholder="Ex: Qual tema pro próximo culto de jovens?">
        </div>
        <div class="form-group">
          <label class="form-label">Descrição (opcional)</label>
          <input class="form-input" id="enq-descricao" placeholder="Ex: Escolha o tema que mais te abençoaria">
        </div>
        <div class="form-group">
          <label class="form-label form-label-required">Opções (2 a 6)</label>
          <div id="enq-opcoes">
            <input class="form-input" placeholder="Opção 1" style="margin-bottom:8px;">
            <input class="form-input" placeholder="Opção 2" style="margin-bottom:8px;">
          </div>
          <button type="button" class="btn btn-neutral btn-sm" onclick="Enquetes._addOpcao()">
            <i class="fas fa-plus"></i> Adicionar opção
          </button>
        </div>
      </div>
    `;

    const botoes = `
      <button class="btn btn-neutral" onclick="UI.closeModal()">Cancelar</button>
      <button class="btn btn-success" onclick="Enquetes._salvar()">
        <i class="fas fa-save"></i> Criar enquete
      </button>
    `;

    UI.openModal('🎯 Nova Enquete', html, botoes);
  },

  _addOpcao() {
    const div = document.getElementById('enq-opcoes');
    const total = div.querySelectorAll('input').length;
    if (total >= 6) return UI.toast('Máximo 6 opções', 'error');

    const input = document.createElement('input');
    input.className = 'form-input';
    input.placeholder = 'Opção ' + (total + 1);
    input.style.marginBottom = '8px';
    div.appendChild(input);
  },

  async _salvar() {
    const pergunta = document.getElementById('enq-pergunta').value.trim();
    const descricao = document.getElementById('enq-descricao').value.trim();

    if (!pergunta) return UI.toast('Preencha a pergunta', 'error');

    const opcoes = [];
    document.querySelectorAll('#enq-opcoes input').forEach(inp => {
      const v = inp.value.trim();
      if (v) opcoes.push(v);
    });

    if (opcoes.length < 2) return UI.toast('Adicione pelo menos 2 opções', 'error');

    try {
      await API.call('adminEnqueteCriar', [pergunta, descricao, opcoes]);
      UI.toast('Enquete criada!', 'success');
      UI.closeModal();
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  },

  /* ----------------------------------------------------------
     AÇÕES
     ---------------------------------------------------------- */
  async encerrar(id) {
    const ok = await UI.confirmar('Encerrar esta enquete? Membros não poderão mais votar.', 'Encerrar');
    if (!ok) return;

    try {
      await API.call('adminEnqueteEncerrar', [id]);
      UI.toast('Enquete encerrada', 'success');
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  },

  async remover(id) {
    const ok = await UI.confirmar('Remover esta enquete? Todos os votos serão apagados.', 'Remover');
    if (!ok) return;

    try {
      await API.call('adminEnqueteRemover', [id]);
      UI.toast('Enquete removida', 'success');
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  }

};

console.log('%c[Enquetes] Módulo carregado v1.0', 'color:#64748b;font-size:11px;');
