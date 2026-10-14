/* ============================================================
   PIBENS ADM — Módulo Testemunhos v1.0
   ============================================================ */

const Testemunhos = {

  _dados: [],
  _filtro: 'todos', // todos | pendente | aprovado | rejeitado

  async render() {
    const c = document.getElementById('content');
    if (!c) return;

    c.innerHTML = UI.loading('Carregando testemunhos...');

    try {
      const dados = await API.call('adminTestemunhosListar');
      this._dados = dados || [];
      this._renderTudo();
    } catch (e) {
      c.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon" style="color:#dc2626;"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="empty-state-title">Erro ao carregar</div>
          <div class="empty-state-text">${UI.escapar(e.message)}</div>
          <button class="btn btn-primary" onclick="Testemunhos.render()">
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
      lista = lista.filter(t => t.status === this._filtro);
    }

    const pendentes = this._dados.filter(t => t.status === 'pendente').length;
    const aprovados = this._dados.filter(t => t.status === 'aprovado').length;
    const rejeitados = this._dados.filter(t => t.status === 'rejeitado').length;

    c.innerHTML = `
      <div class="membros-stats">
        <div class="membros-stat">
          <i class="fas fa-clock" style="color:#F59E0B;"></i>
          <div>
            <span class="membros-stat-value">${pendentes}</span>
            <span class="membros-stat-label">Pendentes</span>
          </div>
        </div>
        <div class="membros-stat">
          <i class="fas fa-check-circle" style="color:#059669;"></i>
          <div>
            <span class="membros-stat-value">${aprovados}</span>
            <span class="membros-stat-label">Aprovados</span>
          </div>
        </div>
        <div class="membros-stat">
          <i class="fas fa-times-circle" style="color:#DC2626;"></i>
          <div>
            <span class="membros-stat-value">${rejeitados}</span>
            <span class="membros-stat-label">Rejeitados</span>
          </div>
        </div>
      </div>

      <div class="membros-toolbar">
        <div style="flex:1;"></div>
        <div class="membros-filtros">
          <select class="form-select" onchange="Testemunhos._filtrar(this.value)">
            <option value="todos" ${this._filtro === 'todos' ? 'selected' : ''}>Todos</option>
            <option value="pendente" ${this._filtro === 'pendente' ? 'selected' : ''}>⏳ Pendentes</option>
            <option value="aprovado" ${this._filtro === 'aprovado' ? 'selected' : ''}>✅ Aprovados</option>
            <option value="rejeitado" ${this._filtro === 'rejeitado' ? 'selected' : ''}>❌ Rejeitados</option>
          </select>
          <button class="btn btn-primary" onclick="Testemunhos.render()">
            <i class="fas fa-sync"></i> Atualizar
          </button>
        </div>
      </div>

      ${lista.length === 0 ? UI.emptyState(
        'Nenhum testemunho',
        this._filtro !== 'todos' ? 'Tente outro filtro.' : 'Nenhum testemunho enviado ainda.',
        ''
      ) : lista.map(t => this._renderCard(t)).join('')}
    `;
  },

  _renderCard(t) {
    const statusCor = t.status === 'aprovado' ? '#059669' : t.status === 'rejeitado' ? '#DC2626' : '#F59E0B';
    const statusLabel = t.status === 'aprovado' ? '✅ Aprovado' : t.status === 'rejeitado' ? '❌ Rejeitado' : '⏳ Pendente';
    const data = new Date(t.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });

    return `
      <div class="data-card" style="padding:16px;margin-bottom:12px;border-left:4px solid ${statusCor};">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
          <div style="flex:1;">
            <h3 style="margin:0;font-size:16px;">${t.destaque ? '⭐ ' : ''}${UI.escapar(t.titulo)}</h3>
            <p style="color:#64748b;font-size:12px;margin-top:4px;">✍️ ${UI.escapar(t.nome_autor)} · ${data}</p>
          </div>
          <span style="padding:4px 10px;border-radius:12px;font-size:11px;font-weight:700;background:${statusCor}22;color:${statusCor};">
            ${statusLabel}
          </span>
        </div>

        <div style="background:#f8fafc;padding:12px;border-radius:8px;font-size:14px;line-height:1.6;color:#374151;">
          ${UI.escapar(t.texto).replace(/\n/g, '<br>')}
        </div>

        <div style="display:flex;justify-content:flex-end;gap:6px;margin-top:12px;">
          ${t.status === 'pendente' ? `
            <button class="btn btn-success btn-sm" onclick="Testemunhos.aprovar('${t.id}')">
              <i class="fas fa-check"></i> Aprovar
            </button>
            <button class="btn btn-danger btn-sm" onclick="Testemunhos.rejeitar('${t.id}')">
              <i class="fas fa-times"></i> Rejeitar
            </button>
          ` : t.status === 'aprovado' ? `
            <button class="btn btn-warning btn-sm" onclick="Testemunhos.destacar('${t.id}', ${!t.destaque})">
              <i class="fas fa-star"></i> ${t.destaque ? 'Remover destaque' : 'Destacar'}
            </button>
            <button class="btn btn-neutral btn-sm" onclick="Testemunhos.rejeitar('${t.id}')">
              <i class="fas fa-undo"></i> Voltar a pendente
            </button>
          ` : `
            <button class="btn btn-success btn-sm" onclick="Testemunhos.aprovar('${t.id}')">
              <i class="fas fa-check"></i> Aprovar
            </button>
          `}
          <button class="btn btn-danger btn-sm" onclick="Testemunhos.remover('${t.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  },

  _filtrar(v) {
    this._filtro = v;
    this._renderTudo();
  },

  async aprovar(id) {
    try {
      await API.call('adminTestemunhoAprovar', [id]);
      UI.toast('Testemunho aprovado!', 'success');
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  },

  async rejeitar(id) {
    const ok = await UI.confirmar('Rejeitar este testemunho? Ele não aparecerá no app.', 'Rejeitar');
    if (!ok) return;

    try {
      await API.call('adminTestemunhoRejeitar', [id]);
      UI.toast('Testemunho rejeitado', 'success');
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  },

  async destacar(id, valor) {
    try {
      await API.call('adminTestemunhoDestacar', [id, valor]);
      UI.toast(valor ? 'Destacado!' : 'Destaque removido', 'success');
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  },

  async remover(id) {
    const ok = await UI.confirmar('Remover este testemunho permanentemente?', 'Remover');
    if (!ok) return;

    try {
      await API.call('adminTestemunhoRemover', [id]);
      UI.toast('Testemunho removido', 'success');
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  }

};

console.log('%c[Testemunhos] Módulo carregado', 'color:#64748b;font-size:11px;');
