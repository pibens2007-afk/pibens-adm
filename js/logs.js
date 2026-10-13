/* ============================================================
   PIBENS ADM — Módulo Log de Atividades
   ============================================================
   - Visualização (SOMENTE LEITURA)
   - Filtros por tipo, usuário, data
   - Não permite editar nem excluir
   ============================================================ */

const Logs = {

  _dados: [],
  _filtroTipo: '',
  _filtroUsuario: '',
  _filtroPeriodo: 'mes_atual',
  _busca: '',

  /* ==========================================================
     RENDER PRINCIPAL
     ========================================================== */
  async render() {
    const c = document.getElementById('content');
    if (!c) return;

    c.innerHTML = UI.loading('Carregando log de atividades...');

    try {
      const dados = await API.listarLogs();
      this._dados = dados || [];
      this._dados.sort((a, b) => (b.Data || '').localeCompare(a.Data || ''));
      this._renderTudo();
    } catch (e) {
      c.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon" style="color:#dc2626;"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="empty-state-title">Erro ao carregar</div>
          <div class="empty-state-text">${UI.escapar(e.message)}</div>
          <button class="btn btn-primary" onclick="Logs.render()">
            <i class="fas fa-sync"></i> Tentar de novo
          </button>
        </div>
      `;
    }
  },

  _renderTudo() {
    const c = document.getElementById('content');
    if (!c) return;

    const filtrados = this._filtrar();
    const stats = this._calcularStats();

    // Lista de usuários únicos
    const usuarios = [...new Set(this._dados.map((l) => l.Usuario || l.UsuarioNome || '?'))].sort();

    c.innerHTML = `
      <div class="logs-aviso">
        <i class="fas fa-shield-alt"></i>
        <div>
          <strong>Registro imutável</strong>
          <span>Este log é gerado automaticamente e <strong>NÃO PODE SER EDITADO OU EXCLUÍDO</strong>. Serve para auditoria e transparência.</span>
        </div>
      </div>

      <div class="logs-stats">
        <div class="logs-stat">
          <div class="logs-stat-icon" style="background:#2563eb22;color:#2563eb;">
            <i class="fas fa-history"></i>
          </div>
          <div>
            <span class="logs-stat-value">${stats.total}</span>
            <span class="logs-stat-label">Total de ações</span>
          </div>
        </div>
        <div class="logs-stat">
          <div class="logs-stat-icon" style="background:#05966922;color:#059669;">
            <i class="fas fa-users"></i>
          </div>
          <div>
            <span class="logs-stat-value">${stats.usuarios}</span>
            <span class="logs-stat-label">Usuários ativos</span>
          </div>
        </div>
        <div class="logs-stat">
          <div class="logs-stat-icon" style="background:#f59e0b22;color:#f59e0b;">
            <i class="fas fa-calendar-day"></i>
          </div>
          <div>
            <span class="logs-stat-value">${stats.hoje}</span>
            <span class="logs-stat-label">Ações hoje</span>
          </div>
        </div>
        <div class="logs-stat">
          <div class="logs-stat-icon" style="background:#7c3aed22;color:#7c3aed;">
            <i class="fas fa-clock"></i>
          </div>
          <div>
            <span class="logs-stat-value">${stats.ultimaAcao || '—'}</span>
            <span class="logs-stat-label">Última ação</span>
          </div>
        </div>
      </div>

      <div class="logs-toolbar">
        <div class="logs-busca">
          <i class="fas fa-search"></i>
          <input type="text" id="logs-busca-input" placeholder="Buscar por descrição, módulo ou usuário..." value="${UI.escapar(this._busca)}" oninput="Logs._buscar(this.value)">
        </div>
        <div class="logs-filtros">
          <select class="form-select" onchange="Logs._filtrarTipo(this.value)">
            <option value="">Todas as ações</option>
            ${CONFIG.LOGS.TIPOS.map((t) => `
              <option value="${t.id}" ${this._filtroTipo === t.id ? 'selected' : ''}>${t.nome}</option>
            `).join('')}
          </select>
          <select class="form-select" onchange="Logs._filtrarUsuario(this.value)">
            <option value="">Todos os usuários</option>
            ${usuarios.map((u) => `
              <option value="${UI.escapar(u)}" ${this._filtroUsuario === u ? 'selected' : ''}>${UI.escapar(u)}</option>
            `).join('')}
          </select>
          <select class="form-select" onchange="Logs._filtrarPeriodo(this.value)">
            <option value="hoje" ${this._filtroPeriodo === 'hoje' ? 'selected' : ''}>Hoje</option>
            <option value="semana" ${this._filtroPeriodo === 'semana' ? 'selected' : ''}>Últimos 7 dias</option>
            <option value="mes_atual" ${this._filtroPeriodo === 'mes_atual' ? 'selected' : ''}>Mês atual</option>
            <option value="mes_passado" ${this._filtroPeriodo === 'mes_passado' ? 'selected' : ''}>Mês passado</option>
            <option value="ano" ${this._filtroPeriodo === 'ano' ? 'selected' : ''}>Ano todo</option>
            <option value="todos" ${this._filtroPeriodo === 'todos' ? 'selected' : ''}>Tudo</option>
          </select>
          <button class="btn btn-neutral" onclick="Logs._limparFiltros()">
            <i class="fas fa-times"></i> Limpar
          </button>
        </div>
      </div>

      ${(this._filtroTipo || this._filtroUsuario || this._busca) ? `
        <div class="logs-filtro-ativo">
          <span>
            <i class="fas fa-filter"></i> Mostrando <strong>${filtrados.length}</strong> resultado(s)
          </span>
        </div>
      ` : ''}

      ${filtrados.length === 0 ? UI.emptyState(
        'Nenhum log encontrado',
        'Tente ajustar os filtros ou aumentar o período.',
        ''
      ) : this._renderLista(filtrados)}
    `;

    if (this._busca) {
      setTimeout(() => {
        const i = document.getElementById('logs-busca-input');
        if (i) { i.focus(); i.setSelectionRange(this._busca.length, this._busca.length); }
      }, 10);
    }
  },

  /* ==========================================================
     LISTA DE LOGS
     ========================================================== */
  _renderLista(dados) {
    const linhas = dados.map((log) => this._renderItem(log)).join('');

    return `
      <div class="logs-lista">
        ${linhas}
      </div>
    `;
  },

  _renderItem(log) {
    const tipoInfo = CONFIG.LOGS.TIPOS.find((t) => t.id === log.Acao) || CONFIG.LOGS.TIPOS[0];

    const data = log.Data ? new Date(log.Data) : null;
    const dataFormatada = data ? this._formatarDataHora(data) : '—';

    const usuario = log.UsuarioNome || log.Usuario || 'Desconhecido';
    const iniciais = UI.iniciais(usuario);

    return `
      <div class="logs-item">
        <div class="logs-item-icon" style="background:${tipoInfo.cor}22;color:${tipoInfo.cor};">
          <i class="fas ${tipoInfo.icon}"></i>
        </div>
        <div class="logs-item-content">
          <div class="logs-item-header">
            <span class="logs-item-tipo" style="background:${tipoInfo.cor}22;color:${tipoInfo.cor};">
              ${tipoInfo.nome}
            </span>
            <span class="logs-item-modulo">${UI.escapar(log.Modulo || '—')}</span>
          </div>
          <div class="logs-item-descricao">${UI.escapar(log.Descricao || '—')}</div>
          <div class="logs-item-meta">
            <span class="logs-item-usuario">
              <span class="logs-item-avatar" style="background:${this._corDoNome(usuario)};">
                ${iniciais}
              </span>
              ${UI.escapar(usuario)}
            </span>
            <span class="logs-item-data">
              <i class="fas fa-clock"></i>
              ${dataFormatada}
            </span>
          </div>
        </div>
      </div>
    `;
  },

  _formatarDataHora(d) {
    if (!(d instanceof Date) || isNaN(d)) return '—';

    const agora = new Date();
    const diffMs = agora - d;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Agora mesmo';
    if (diffMin < 60) return `${diffMin} min atrás`;
    if (diffHoras < 24) return `${diffHoras}h atrás`;
    if (diffDias < 7) return `${diffDias} dia(s) atrás`;

    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    const hora = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');

    return `${dia}/${mes}/${ano} ${hora}:${min}`;
  },

  _corDoNome(nome) {
    const cores = ['#2563eb', '#059669', '#7c3aed', '#e11d48', '#f59e0b', '#0891b2', '#f97316'];
    let hash = 0;
    for (let i = 0; i < (nome || '').length; i++) {
      hash = nome.charCodeAt(i) + ((hash << 5) - hash);
    }
    return cores[Math.abs(hash) % cores.length];
  },

  /* ==========================================================
     FILTROS
     ========================================================== */
  _filtrar() {
    let lista = [...this._dados];

    if (this._busca) {
      const b = this._busca.toLowerCase();
      lista = lista.filter((l) =>
        (l.Descricao || '').toLowerCase().includes(b) ||
        (l.Modulo || '').toLowerCase().includes(b) ||
        (l.Usuario || '').toLowerCase().includes(b) ||
        (l.UsuarioNome || '').toLowerCase().includes(b)
      );
    }

    if (this._filtroTipo) {
      lista = lista.filter((l) => l.Acao === this._filtroTipo);
    }

    if (this._filtroUsuario) {
      lista = lista.filter((l) =>
        (l.Usuario === this._filtroUsuario) ||
        (l.UsuarioNome === this._filtroUsuario)
      );
    }

    // Período
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1;

    lista = lista.filter((l) => {
      if (!l.Data) return false;
      const d = new Date(l.Data);
      if (isNaN(d)) return false;

      switch (this._filtroPeriodo) {
        case 'hoje':
          return d.toDateString() === hoje.toDateString();

        case 'semana':
          const diff = (hoje - d) / 86400000;
          return diff <= 7 && diff >= 0;

        case 'mes_atual':
          return d.getFullYear() === anoAtual && (d.getMonth() + 1) === mesAtual;

        case 'mes_passado':
          const mAnt = mesAtual === 1 ? 12 : mesAtual - 1;
          const aAnt = mesAtual === 1 ? anoAtual - 1 : anoAtual;
          return d.getFullYear() === aAnt && (d.getMonth() + 1) === mAnt;

        case 'ano':
          return d.getFullYear() === anoAtual;

        case 'todos':
        default:
          return true;
      }
    });

    return lista;
  },

  _buscar(valor) {
    this._busca = valor;
    this._renderTudo();
  },

  _filtrarTipo(valor) {
    this._filtroTipo = valor;
    this._renderTudo();
  },

  _filtrarUsuario(valor) {
    this._filtroUsuario = valor;
    this._renderTudo();
  },

  _filtrarPeriodo(valor) {
    this._filtroPeriodo = valor;
    this._renderTudo();
  },

  _limparFiltros() {
    this._filtroTipo = '';
    this._filtroUsuario = '';
    this._filtroPeriodo = 'mes_atual';
    this._busca = '';
    this._renderTudo();
  },

  /* ==========================================================
     STATS
     ========================================================== */
  _calcularStats() {
    const usuarios = new Set();

    this._dados.forEach((l) => {
      if (l.Usuario) usuarios.add(l.Usuario);
      if (l.UsuarioNome) usuarios.add(l.UsuarioNome);
    });

    const hoje = new Date();
    const hojeCount = this._dados.filter((l) => {
      if (!l.Data) return false;
      const d = new Date(l.Data);
      return d.toDateString() === hoje.toDateString();
    }).length;

    // Última ação
    let ultimaAcao = '—';
    if (this._dados.length > 0) {
      const ultimo = this._dados[0];
      if (ultimo.Data) {
        const d = new Date(ultimo.Data);
        const diffMin = Math.floor((hoje - d) / 60000);
        if (diffMin < 1) ultimaAcao = 'Agora';
        else if (diffMin < 60) ultimaAcao = diffMin + 'min';
        else ultimaAcao = Math.floor(diffMin / 60) + 'h';
      }
    }

    return {
      total: this._dados.length,
      usuarios: usuarios.size,
      hoje: hojeCount,
      ultimaAcao
    };
  }

};

console.log('%c[Logs] Módulo carregado', 'color:#64748b;font-size:11px;');
