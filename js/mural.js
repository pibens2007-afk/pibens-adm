/* ============================================================
   PIBENS ADM — Módulo Mural de Comunicados
   ============================================================
   Funcionalidades:
   - Criar comunicado (título, mensagem, tipo, prioridade)
   - Fixar 1 comunicado no topo
   - Editar, remover
   - Visualização com cores por tipo
   - Aparece em destaque no Dashboard
   ============================================================ */

const Mural = {

  _dados: [],
  _filtroTipo: '',

  /* ==========================================================
     RENDER PRINCIPAL
     ========================================================== */
  async render() {
    const c = document.getElementById('content');
    if (!c) return;

    c.innerHTML = UI.loading('Carregando mural...');

    try {
      const dados = await API.listar(CONFIG.TABELAS.MURAL);
      this._dados = dados || [];

      // Ordena: fixo primeiro, depois prioridade, depois data
      this._dados.sort((a, b) => {
        const fixoA = (a && a.Fixo === 'Sim') ? 1 : 0;
        const fixoB = (b && b.Fixo === 'Sim') ? 1 : 0;
        if (fixoA !== fixoB) return fixoB - fixoA;

        const ordemA = this._ordemPrioridade(a ? a.Prioridade : '');
        const ordemB = this._ordemPrioridade(b ? b.Prioridade : '');
        if (ordemA !== ordemB) return ordemB - ordemA;

        const idA = (a && a.sheetRowIndex) ? Number(a.sheetRowIndex) : 0;
        const idB = (b && b.sheetRowIndex) ? Number(b.sheetRowIndex) : 0;
        return idB - idA;
      });

      this._renderTudo();
    } catch (e) {
      console.error('[Mural] Erro:', e);
      c.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon" style="color:#dc2626;"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="empty-state-title">Erro ao carregar</div>
          <div class="empty-state-text">${UI.escapar(e.message)}</div>
          <button class="btn btn-primary" onclick="Mural.render()">
            <i class="fas fa-sync"></i> Tentar de novo
          </button>
        </div>
      `;
    }
  },

  _ordemPrioridade(p) {
    const found = CONFIG.MURAL.PRIORIDADES.find((x) => x.id === p);
    return found ? found.ordem : 0;
  },

  /* ==========================================================
     RENDER DA TELA COMPLETA
     ========================================================== */
  _renderTudo() {
    const c = document.getElementById('content');
    if (!c) return;

    // ✅ CORREÇÃO: usa _filtrarLista() em vez de _filtrar()
    const filtrados = this._filtrarLista();

    // Stats
    const total = this._dados.length;
    const urgentes = this._dados.filter((m) => m.Prioridade === 'Urgente').length;
    const fixos = this._dados.filter((m) => m.Fixo === 'Sim').length;
    const hoje = this._dados.filter((m) => {
      if (!m.DataCriacao) return false;
      return m.DataCriacao.substring(0, 10) === new Date().toISOString().substring(0, 10);
    }).length;

    c.innerHTML = `
      <div class="mural-header">
        <div class="mural-header-info">
          <h1 class="mural-titulo">📢 Mural de Comunicados</h1>
          <p class="mural-subtitulo">Escreva uma mensagem que todos os membros vão ver</p>
        </div>
        <button class="btn btn-primary btn-lg" onclick="Mural.novo()">
          <i class="fas fa-plus"></i> Novo Comunicado
        </button>
      </div>

      <div class="mural-stats">
        <div class="mural-stat">
          <div class="mural-stat-icon" style="background:#2563eb22;color:#2563eb;">
            <i class="fas fa-bullhorn"></i>
          </div>
          <div>
            <span class="mural-stat-value">${total}</span>
            <span class="mural-stat-label">Comunicados</span>
          </div>
        </div>
        <div class="mural-stat">
          <div class="mural-stat-icon" style="background:#dc262222;color:#dc2626;">
            <i class="fas fa-bell"></i>
          </div>
          <div>
            <span class="mural-stat-value">${urgentes}</span>
            <span class="mural-stat-label">Urgentes</span>
          </div>
        </div>
        <div class="mural-stat">
          <div class="mural-stat-icon" style="background:#f59e0b22;color:#f59e0b;">
            <i class="fas fa-thumbtack"></i>
          </div>
          <div>
            <span class="mural-stat-value">${fixos}</span>
            <span class="mural-stat-label">Fixado(s)</span>
          </div>
        </div>
        <div class="mural-stat">
          <div class="mural-stat-icon" style="background:#05966922;color:#059669;">
            <i class="fas fa-calendar-day"></i>
          </div>
          <div>
            <span class="mural-stat-value">${hoje}</span>
            <span class="mural-stat-label">Hoje</span>
          </div>
        </div>
      </div>

      <div class="mural-filtros">
        <button class="mural-filtro ${this._filtroTipo === '' ? 'active' : ''}" onclick="Mural._trocarFiltro('')">
          <i class="fas fa-list"></i> Todos
        </button>
        ${CONFIG.MURAL.TIPOS.map((t) => `
          <button class="mural-filtro ${this._filtroTipo === t.id ? 'active' : ''}" onclick="Mural._trocarFiltro('${t.id}')" style="${this._filtroTipo === t.id ? 'background:' + t.cor + ';color:#fff;' : ''}">
            <i class="fas ${t.icon}"></i> ${t.nome}
          </button>
        `).join('')}
      </div>

      ${filtrados.length === 0 ? UI.emptyState(
        'Nenhum comunicado',
        this._filtroTipo ? 'Nenhum comunicado deste tipo.' : 'Escreva o primeiro comunicado para a igreja.',
        `<button class="btn btn-primary btn-lg" onclick="Mural.novo()">
           <i class="fas fa-plus"></i> Novo comunicado
         </button>`
      ) : this._renderLista(filtrados)}
    `;
  },

  /* ==========================================================
     TROCAR FILTRO (ação do usuário)
     ========================================================== */
  _trocarFiltro(tipo) {
    this._filtroTipo = tipo || '';
    this._renderTudo();
  },

  /* ==========================================================
     FILTRAR LISTA (retorna array filtrado — NÃO re-renderiza)
     ========================================================== */
  _filtrarLista() {
    if (!this._filtroTipo) return this._dados;
    return this._dados.filter((m) => m.Tipo === this._filtroTipo);
  },

  /* ==========================================================
     LISTA DE COMUNICADOS
     ========================================================== */
  _renderLista(dados) {
    const cards = dados.map((m) => this._renderCard(m)).join('');
    return `<div class="mural-lista">${cards}</div>`;
  },

  _renderCard(m) {
    const tipo = CONFIG.MURAL.TIPOS.find((t) => t.id === m.Tipo) || CONFIG.MURAL.TIPOS[0];
    const prio = CONFIG.MURAL.PRIORIDADES.find((p) => p.id === m.Prioridade) || CONFIG.MURAL.PRIORIDADES[0];

    const fixo = m.Fixo === 'Sim';
    const data = m.DataCriacao ? new Date(m.DataCriacao) : null;
    const dataTexto = data ? this._tempoRelativo(data) : '—';

    const expirado = m.DataExpira && new Date(m.DataExpira) < new Date();

    return `
      <div class="mural-card ${fixo ? 'mural-card-fixo' : ''} ${expirado ? 'mural-card-expirado' : ''}" style="border-left-color:${tipo.cor};">
        <div class="mural-card-header">
          <div class="mural-card-badges">
            <span class="mural-card-tipo" style="background:${tipo.bg};color:${tipo.cor};">
              <i class="fas ${tipo.icon}"></i> ${tipo.nome}
            </span>
            ${m.Prioridade && m.Prioridade !== 'Normal' ? `
              <span class="mural-card-prio" style="background:${prio.cor}22;color:${prio.cor};">
                ${m.Prioridade}
              </span>
            ` : ''}
            ${fixo ? `
              <span class="mural-card-fixo-badge">
                <i class="fas fa-thumbtack"></i> FIXADO
              </span>
            ` : ''}
            ${expirado ? `
              <span class="mural-card-expirado-badge">
                <i class="fas fa-clock"></i> Expirado
              </span>
            ` : ''}
          </div>
          <div class="mural-card-acoes">
            <button class="btn btn-sm btn-warning" onclick="Mural.editar(${m.sheetRowIndex})" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="Mural.remover(${m.sheetRowIndex})" title="Remover">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <h3 class="mural-card-titulo">${UI.escapar(m.Titulo || 'Sem título')}</h3>
        <div class="mural-card-mensagem">${UI.escapar(m.Mensagem || '')}</div>

        <div class="mural-card-footer">
          <div class="mural-card-meta">
            ${m.Autor ? `<span><i class="fas fa-user"></i> ${UI.escapar(m.Autor)}</span>` : ''}
            <span><i class="fas fa-clock"></i> ${dataTexto}</span>
            ${m.DataExpira ? `<span><i class="fas fa-hourglass-end"></i> Expira: ${UI.dataBR(m.DataExpira)}</span>` : ''}
          </div>
          <button class="btn btn-sm btn-neutral" onclick="Mural.toggleFixo(${m.sheetRowIndex})">
            <i class="fas fa-thumbtack"></i> ${fixo ? 'Desafixar' : 'Fixar'}
          </button>
        </div>
      </div>
    `;
  },

  _tempoRelativo(data) {
    const agora = new Date();
    const diff = agora - data;
    const min = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (min < 1) return 'Agora mesmo';
    if (min < 60) return `${min} min atrás`;
    if (horas < 24) return `${horas}h atrás`;
    if (dias < 7) return `${dias} dia(s) atrás`;

    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  },

  /* ==========================================================
     NOVO / EDITAR
     ========================================================== */
  novo() {
    this._abrirForm(null);
  },

  editar(id) {
    const m = this._dados.find((x) => x.sheetRowIndex == id);
    if (m) this._abrirForm(m);
  },

  _abrirForm(item) {
    const ehEdicao = !!item;

    // Pega nome do usuário logado pra preencher Autor
    let autorPadrao = '';
    try {
      const u = localStorage.getItem('pibens_adm_usuario');
      if (u) autorPadrao = JSON.parse(u).nome || '';
    } catch (e) { /* ignora */ }

    const valor = (campo, padrao = '') => item ? (item[campo] || '') : padrao;
    const isDate = (v) => v ? UI.dataInput(v) : '';

    const html = `
      <div class="mural-form">
        <div class="mural-form-group">
          <label class="form-label form-label-required">Título</label>
          <input type="text" id="mural-titulo" class="form-input" 
                 value="${UI.escapar(valor('Titulo'))}" 
                 placeholder="Ex: Culto de Missões neste domingo" maxlength="100">
        </div>

        <div class="mural-form-group">
          <label class="form-label form-label-required">Mensagem</label>
          <textarea id="mural-mensagem" class="form-textarea" rows="5" 
                    placeholder="Escreva aqui o comunicado para os membros...">${UI.escapar(valor('Mensagem'))}</textarea>
        </div>

        <div class="mural-form-linha">
          <div class="mural-form-group">
            <label class="form-label form-label-required">Tipo</label>
            <select id="mural-tipo" class="form-select">
              ${CONFIG.MURAL.TIPOS.map((t) => `
                <option value="${t.id}" ${valor('Tipo', 'Info') === t.id ? 'selected' : ''}>${t.nome}</option>
              `).join('')}
            </select>
          </div>
          <div class="mural-form-group">
            <label class="form-label form-label-required">Prioridade</label>
            <select id="mural-prioridade" class="form-select">
              ${CONFIG.MURAL.PRIORIDADES.map((p) => `
                <option value="${p.id}" ${valor('Prioridade', 'Normal') === p.id ? 'selected' : ''}>${p.id}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <div class="mural-form-linha">
          <div class="mural-form-group">
            <label class="form-label">Autor</label>
            <input type="text" id="mural-autor" class="form-input" 
                   value="${UI.escapar(valor('Autor', autorPadrao))}" 
                   placeholder="Ex: Pastor Alexsandro">
          </div>
          <div class="mural-form-group">
            <label class="form-label">Data de Expiração (opcional)</label>
            <input type="date" id="mural-expiracao" class="form-input" 
                   value="${isDate(valor('DataExpira'))}">
          </div>
        </div>

        <div class="mural-form-group">
          <label class="form-label">
            <input type="checkbox" id="mural-fixo" ${valor('Fixo') === 'Sim' ? 'checked' : ''}>
            Fixar este comunicado no topo
          </label>
          <span class="mural-form-hint">
            <i class="fas fa-info-circle"></i> 
            Se marcar, este comunicado aparece em destaque no Dashboard de todos os líderes e no app dos membros.
            Apenas 1 comunicado pode ser fixado por vez.
          </span>
        </div>
      </div>
    `;

    const botoes = `
      <button class="btn btn-neutral" onclick="UI.closeModal()">
        <i class="fas fa-times"></i> Cancelar
      </button>
      <button class="btn btn-primary" onclick="Mural._salvar(${item ? item.sheetRowIndex : 'null'})">
        <i class="fas fa-paper-plane"></i> ${ehEdicao ? 'Salvar' : 'Publicar'}
      </button>
    `;

    UI.openModal(
      ehEdicao ? '✏️ Editar Comunicado' : '📢 Novo Comunicado',
      html,
      botoes
    );
  },

  async _salvar(id) {
    const titulo = document.getElementById('mural-titulo')?.value.trim();
    const mensagem = document.getElementById('mural-mensagem')?.value.trim();
    const tipo = document.getElementById('mural-tipo')?.value;
    const prioridade = document.getElementById('mural-prioridade')?.value;
    const autor = document.getElementById('mural-autor')?.value.trim();
    const expiracao = document.getElementById('mural-expiracao')?.value;
    const fixo = document.getElementById('mural-fixo')?.checked;

    // Validação
    if (!titulo) { UI.toast('Preencha o título.', 'error'); return; }
    if (!mensagem) { UI.toast('Preencha a mensagem.', 'error'); return; }

    // Se está fixando, remove fixo dos outros
    if (fixo) {
      const fixados = this._dados.filter((m) => m.Fixo === 'Sim' && m.sheetRowIndex != id);
      for (const f of fixados) {
        try {
          const dadosAtualizados = Object.assign({}, f);
          delete dadosAtualizados.sheetRowIndex;
          dadosAtualizados.Fixo = 'Não';
          await API.salvar(CONFIG.TABELAS.MURAL, dadosAtualizados, f.sheetRowIndex);
        } catch (e) { /* ignora */ }
      }
    }

    const dados = {
      Titulo: titulo,
      Mensagem: mensagem,
      Tipo: tipo,
      Prioridade: prioridade,
      Autor: autor,
      Fixo: fixo ? 'Sim' : 'Não',
      DataExpira: expiracao || '',
      DataCriacao: new Date().toISOString()
    };

    try {
      await API.salvar(CONFIG.TABELAS.MURAL, dados, id);
      UI.toast(id ? '✅ Comunicado atualizado!' : '✅ Comunicado publicado!', 'success');
      UI.closeModal();
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  },

  /* ==========================================================
     FIXAR / DESAFIXAR
     ========================================================== */
  async toggleFixo(id) {
    const m = this._dados.find((x) => x.sheetRowIndex == id);
    if (!m) return;

    const vaiFixar = m.Fixo !== 'Sim';

    // Se vai fixar, tira dos outros
    if (vaiFixar) {
      const fixados = this._dados.filter((x) => x.Fixo === 'Sim' && x.sheetRowIndex != id);
      for (const f of fixados) {
        try {
          const dados = Object.assign({}, f);
          delete dados.sheetRowIndex;
          dados.Fixo = 'Não';
          await API.salvar(CONFIG.TABELAS.MURAL, dados, f.sheetRowIndex);
        } catch (e) { /* ignora */ }
      }
    }

    const dados = Object.assign({}, m);
    delete dados.sheetRowIndex;
    dados.Fixo = vaiFixar ? 'Sim' : 'Não';

    try {
      await API.salvar(CONFIG.TABELAS.MURAL, dados, id);
      UI.toast(vaiFixar ? '📌 Comunicado fixado!' : 'Comunicado desafixado.', 'success');
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  },

  /* ==========================================================
     REMOVER
     ========================================================== */
  async remover(id) {
    const m = this._dados.find((x) => x.sheetRowIndex == id);
    if (!m) return;

    const ok = await UI.confirmar(
      `Remover o comunicado "${m.Titulo}"?`,
      'Remover comunicado'
    );
    if (!ok) return;

    try {
      const r = await API.remover(id, CONFIG.TABELAS.MURAL, m.Titulo);
      UI.toast(r.message || 'Comunicado removido!', 'success');
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  },

  /* ==========================================================
     HELPERS PÚBLICOS (usados pelo Dashboard)
     ========================================================== */

  /**
   * Retorna o comunicado fixado (se houver)
   * ou o comunicado mais recente/urgente
   */
  async obterDestaque() {
    try {
      const lista = await API.listar(CONFIG.TABELAS.MURAL);
      if (!lista || lista.length === 0) return null;

      // Filtra expirados
      const hoje = new Date().toISOString().substring(0, 10);
      const validos = lista.filter((m) => {
        if (!m.DataExpira) return true;
        return m.DataExpira >= hoje;
      });

      if (validos.length === 0) return null;

      // 1º prioridade: fixado
      const fixado = validos.find((m) => m.Fixo === 'Sim');
      if (fixado) return fixado;

      // 2º prioridade: Urgente
      const urgente = validos.find((m) => m.Prioridade === 'Urgente');
      if (urgente) return urgente;

      // 3º prioridade: Importante
      const importante = validos.find((m) => m.Prioridade === 'Importante');
      if (importante) return importante;

      // 4º: mais recente
      return validos[0];
    } catch (e) {
      console.warn('[Mural] Erro ao obter destaque:', e.message);
      return null;
    }
  }

};

console.log('%c[Mural] Módulo carregado (v3.0 corrigido)', 'color:#64748b;font-size:11px;');
