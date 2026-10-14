/* ============================================================
   PIBENS ADM — Módulo Portal do Membro v1.0
   ============================================================
   Gerencia os acessos ao Portal do Membro:
   - Ver quem tem acesso
   - Resetar senha (volta pra pibens@2026)
   - Bloquear/desbloquear acesso
   - Remover acesso
   ============================================================ */

const PortalMembro = {

  _dados: [],
  _busca: '',
  _filtro: 'todos', // 'todos' | 'ativos' | 'bloqueados'

  /* ----------------------------------------------------------
     RENDER PRINCIPAL
     ---------------------------------------------------------- */
  async render() {
    const c = document.getElementById('content');
    if (!c) return;

    c.innerHTML = UI.loading('Carregando acessos do Portal...');

    try {
      const dados = await API_Portal.listarAcessos();
      this._dados = dados || [];
      this._renderTudo();
    } catch (e) {
      c.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon" style="color:#dc2626;"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="empty-state-title">Erro ao carregar</div>
          <div class="empty-state-text">${UI.escapar(e.message)}</div>
          <button class="btn btn-primary" onclick="PortalMembro.render()">
            <i class="fas fa-sync"></i> Tentar de novo
          </button>
        </div>
      `;
    }
  },

  _renderTudo() {
    const filtrados = this._filtrar();
    this._renderTela(filtrados);
  },

  _filtrar() {
    let lista = [...this._dados];

    if (this._busca) {
      const b = this._busca.toLowerCase();
      lista = lista.filter((a) =>
        (a.nome || '').toLowerCase().includes(b) ||
        (a.email || '').toLowerCase().includes(b) ||
        (a.membro_id || '').toString().toLowerCase().includes(b)
      );
    }

    if (this._filtro === 'ativos') {
      lista = lista.filter((a) => a.ativo === true);
    } else if (this._filtro === 'bloqueados') {
      lista = lista.filter((a) => a.ativo === false);
    }

    return lista;
  },

  _renderTela(dados) {
    const c = document.getElementById('content');

    const total = this._dados.length;
    const ativos = this._dados.filter((a) => a.ativo === true).length;
    const bloqueados = this._dados.filter((a) => a.ativo === false).length;

    c.innerHTML = `
      <div class="membros-stats">
        <div class="membros-stat">
          <i class="fas fa-users" style="color:#2563eb;"></i>
          <div>
            <span class="membros-stat-value">${total}</span>
            <span class="membros-stat-label">Total</span>
          </div>
        </div>
        <div class="membros-stat">
          <i class="fas fa-user-check" style="color:#059669;"></i>
          <div>
            <span class="membros-stat-value">${ativos}</span>
            <span class="membros-stat-label">Ativos</span>
          </div>
        </div>
        <div class="membros-stat">
          <i class="fas fa-user-slash" style="color:#dc2626;"></i>
          <div>
            <span class="membros-stat-value">${bloqueados}</span>
            <span class="membros-stat-label">Bloqueados</span>
          </div>
        </div>
      </div>

      <div class="membros-toolbar">
        <div class="membros-busca">
          <i class="fas fa-search"></i>
          <input type="text" id="portal-busca-input" placeholder="Buscar por nome, CPF ou login..." value="${UI.escapar(this._busca)}" oninput="PortalMembro._buscar(this.value)">
        </div>
        <div class="membros-filtros">
          <select class="form-select" onchange="PortalMembro._filtrarTipo(this.value)">
            <option value="todos" ${this._filtro === 'todos' ? 'selected' : ''}>Todos</option>
            <option value="ativos" ${this._filtro === 'ativos' ? 'selected' : ''}>Só ativos</option>
            <option value="bloqueados" ${this._filtro === 'bloqueados' ? 'selected' : ''}>Só bloqueados</option>
          </select>
          <button class="btn btn-primary" onclick="PortalMembro.render()">
            <i class="fas fa-sync"></i> Atualizar
          </button>
        </div>
      </div>

      ${dados.length === 0 ? UI.emptyState(
        'Nenhum acesso encontrado',
        this._busca || this._filtro !== 'todos'
          ? 'Tente ajustar os filtros.'
          : 'Cadastre membros com CPF no ADM para gerar acessos automaticamente.',
        ''
      ) : this._renderDataCard(dados)}
    `;

    if (this._busca) {
      setTimeout(() => {
        const i = document.getElementById('portal-busca-input');
        if (i) { i.focus(); i.setSelectionRange(this._busca.length, this._busca.length); }
      }, 10);
    }
  },

  _renderDataCard(dados) {
    const linhas = dados.map((a) => this._renderLinha(a)).join('');

    return `
      <div class="data-card">
        <div class="data-header">
          <div class="data-header-top">
            <div>
              <h2 class="data-title"><i class="fas fa-mobile-alt mr-2"></i>Acessos do Portal do Membro</h2>
              <p class="data-subtitle">${dados.length} acesso(s)</p>
            </div>
          </div>
        </div>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Login (CPF/Email)</th>
                <th>Status</th>
                <th>Último Login</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>${linhas}</tbody>
          </table>
        </div>
      </div>
    `;
  },

  _renderLinha(a) {
    const ativo = a.ativo === true;
    const corStatus = ativo ? '#059669' : '#dc2626';
    const labelStatus = ativo ? 'Ativo' : 'Bloqueado';

    let ultimoLogin = '—';
    if (a.ultimo_login) {
      try {
        const d = new Date(a.ultimo_login);
        ultimoLogin = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) +
                      ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      } catch (e) {}
    }

    return `
      <tr>
        <td>
          <strong>${UI.escapar(a.nome || '—')}</strong>
          <br><small style="color:#94a3b8;font-size:0.75rem;">ID: ${UI.escapar(a.membro_id)}</small>
        </td>
        <td><code style="font-size:0.85rem;">${UI.escapar(a.email || '—')}</code></td>
        <td><span class="membros-badge" style="background:${corStatus}22;color:${corStatus};">${labelStatus}</span></td>
        <td style="font-size:0.85rem;color:#64748b;">${ultimoLogin}</td>
        <td class="col-actions">
          <button class="btn btn-warning btn-sm" onclick="PortalMembro.resetarSenha('${a.membro_id}')" title="Resetar senha pra pibens@2026">
            <i class="fas fa-key"></i>
          </button>
          ${ativo
            ? `<button class="btn btn-danger btn-sm" onclick="PortalMembro.alternarAtivo('${a.membro_id}', false)" title="Bloquear acesso">
                 <i class="fas fa-ban"></i>
               </button>`
            : `<button class="btn btn-success btn-sm" onclick="PortalMembro.alternarAtivo('${a.membro_id}', true)" title="Desbloquear acesso">
                 <i class="fas fa-unlock"></i>
               </button>`
          }
          <button class="btn btn-danger btn-sm" onclick="PortalMembro.remover('${a.membro_id}')" title="Remover acesso">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  },

  /* ----------------------------------------------------------
     FILTROS
     ---------------------------------------------------------- */
  _buscar(valor) {
    this._busca = valor;
    this._renderTudo();
  },

  _filtrarTipo(valor) {
    this._filtro = valor;
    this._renderTudo();
  },

  /* ----------------------------------------------------------
     AÇÕES
     ---------------------------------------------------------- */
  async resetarSenha(membroId) {
    const ok = await UI.confirmar(
      'Resetar a senha deste membro para "pibens@2026"?',
      'Resetar senha'
    );
    if (!ok) return;

    try {
      await API_Portal.resetarSenha(membroId);
      UI.toast('Senha resetada para pibens@2026', 'success');
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  },

  async alternarAtivo(membroId, ativo) {
    const acao = ativo ? 'Desbloquear' : 'Bloquear';
    const ok = await UI.confirmar(
      `${acao} o acesso deste membro?`,
      `${acao} acesso`
    );
    if (!ok) return;

    try {
      await API_Portal.alternarAtivo(membroId, ativo);
      UI.toast(`Acesso ${ativo ? 'desbloqueado' : 'bloqueado'}!`, 'success');
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  },

  async remover(membroId) {
    const ok = await UI.confirmar(
      'Remover o acesso deste membro? Esta ação não pode ser desfeita.',
      'Remover acesso'
    );
    if (!ok) return;

    try {
      await API_Portal.removerAcesso(membroId);
      UI.toast('Acesso removido!', 'success');
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  }

};

console.log('%c[PortalMembro] Módulo carregado', 'color:#64748b;font-size:11px;');
