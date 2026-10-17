/* ============================================================
   PIBENS ADM — Módulo Pedidos de Oração v1.0
   ============================================================ */

const PedidosOracao = {

  _dados: [],
  _filtro: 'todos', // todos | ativo | orado

  async render() {
    const c = document.getElementById('content');
    if (!c) return;

    c.innerHTML = UI.loading('Carregando pedidos...');

    try {
      const dados = await API.call('adminListarPedidosOracao');
      this._dados = dados || [];
      this._renderTudo();
    } catch (e) {
      c.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon" style="color:#dc2626;"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="empty-state-title">Erro ao carregar</div>
          <div class="empty-state-text">${UI.escapar(e.message)}</div>
          <button class="btn btn-primary" onclick="PedidosOracao.render()">
            <i class="fas fa-sync"></i> Tentar de novo
          </button>
        </div>
      `;
    }
  },

  _renderTudo() {
    const c = document.getElementById('content');

    let lista = [...this._dados];
    if (this._filtro !== 'todos') {
      lista = lista.filter(p => p.status === this._filtro);
    }

    const ativos = this._dados.filter(p => p.status === 'ativo').length;
    const orados = this._dados.filter(p => p.status === 'orado').length;

    c.innerHTML = `
      <div class="membros-stats">
        <div class="membros-stat">
          <i class="fas fa-praying-hands" style="color:#8B5CF6;"></i>
          <div>
            <span class="membros-stat-value">${this._dados.length}</span>
            <span class="membros-stat-label">Total</span>
          </div>
        </div>
        <div class="membros-stat">
          <i class="fas fa-clock" style="color:#F59E0B;"></i>
          <div>
            <span class="membros-stat-value">${ativos}</span>
            <span class="membros-stat-label">Aguardando Oração</span>
          </div>
        </div>
        <div class="membros-stat">
          <i class="fas fa-check-circle" style="color:#059669;"></i>
          <div>
            <span class="membros-stat-value">${orados}</span>
            <span class="membros-stat-label">Já Orados</span>
          </div>
        </div>
      </div>

      <div class="membros-toolbar">
        <div style="flex:1;"></div>
        <div class="membros-filtros">
          <select class="form-select" onchange="PedidosOracao._filtrar(this.value)">
            <option value="todos" ${this._filtro === 'todos' ? 'selected' : ''}>Todos os Pedidos</option>
            <option value="ativo" ${this._filtro === 'ativo' ? 'selected' : ''}>⏳ Aguardando Oração</option>
            <option value="orado" ${this._filtro === 'orado' ? 'selected' : ''}>✅ Já Orados</option>
          </select>
          <button class="btn btn-primary" onclick="PedidosOracao.render()">
            <i class="fas fa-sync"></i> Atualizar
          </button>
        </div>
      </div>

      ${lista.length === 0 ? UI.emptyState(
        'Nenhum pedido de oração',
        this._filtro !== 'todos' ? 'Tente outro filtro.' : 'Os pedidos enviados pelo app dos membros aparecerão aqui.',
        ''
      ) : lista.map(p => this._renderCard(p)).join('')}
    `;
  },

  _renderCard(p) {
    const ativo = p.status === 'ativo';
    const corStatus = ativo ? '#F59E0B' : '#059669';
    const labelStatus = ativo ? '⏳ Aguardando Oração' : '✅ Já Orado';
    
    const data = new Date(p.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
    const autor = p.anonimo ? '🕵️ Anônimo' : `👤 ${p.nome_membro || 'Membro'}`;

    return `
      <div class="data-card" style="padding:16px;margin-bottom:12px;border-left:4px solid ${corStatus};">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
          <div style="flex:1;">
            <div style="display:flex;gap:12px;align-items:center;margin-bottom:8px;">
              <span style="font-weight:700;font-size:14px;">${autor}</span>
              <span style="font-size:12px;color:#64748b;">${data}</span>
            </div>
            <div style="background:#f8fafc;padding:12px;border-radius:8px;font-size:15px;line-height:1.6;color:#374151;">
              ${UI.escapar(p.texto).replace(/\n/g, '<br>')}
            </div>
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;">
          <span style="padding:4px 10px;border-radius:12px;font-size:11px;font-weight:700;background:${corStatus}22;color:${corStatus};">
            ${labelStatus}
          </span>
          <div style="display:flex;gap:6px;">
            ${ativo ? `
              <button class="btn btn-success btn-sm" onclick="PedidosOracao.marcarOrado('${p.id}')">
                <i class="fas fa-check"></i> Marcar como Orado
              </button>
            ` : `
              <button class="btn btn-warning btn-sm" onclick="PedidosOracao.reabrir('${p.id}')">
                <i class="fas fa-undo"></i> Reabrir
              </button>
            `}
            <button class="btn btn-danger btn-sm" onclick="PedidosOracao.remover('${p.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  _filtrar(v) {
    this._filtro = v;
    this._renderTudo();
  },

  async marcarOrado(id) {
    try {
      await API.call('adminAtualizarStatusPedido', [id, 'orado']);
      UI.toast('Pedido marcado como orado!', 'success');
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  },

  async reabrir(id) {
    try {
      await API.call('adminAtualizarStatusPedido', [id, 'ativo']);
      UI.toast('Pedido reaberto', 'success');
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  },

  async remover(id) {
    const ok = await UI.confirmar('Remover este pedido de oração permanentemente?', 'Remover');
    if (!ok) return;

    try {
      await API.call('adminRemoverPedidoOracao', [id]);
      UI.toast('Pedido removido', 'success');
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  }

};

console.log('%c[PedidosOracao] Módulo carregado', 'color:#64748b;font-size:11px;');
