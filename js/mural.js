/* ============================================================
   PIBENS ADM — Módulo Mural v3.0
   ============================================================ */

const Mural = {

  _dados: [],
  _filtroTipo: 'todos',

  async render() {
    const c = document.getElementById('content');
    if (!c) return;

    c.innerHTML = UI.loading('Carregando mural...');

    try {
      const dados = await API.listar(CONFIG.TABELAS.MURAL);
      this._dados = dados || [];
      this._renderTudo();
    } catch (e) {
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

  _renderTudo() {
    const c = document.getElementById('content');

    let lista = [...this._dados];
    if (this._filtroTipo !== 'todos') {
      lista = lista.filter(a => a.Tipo === this._filtroTipo);
    }

    const total = this._dados.length;
    const fixados = this._dados.filter(a => a.Fixo === 'Sim').length;
    
    // Conta os de hoje
    const hojeStr = new Date().toISOString().split('T')[0];
    const hoje = this._dados.filter(a => (a.criado_em || '').startsWith(hojeStr)).length;

    c.innerHTML = `
      <div class="membros-stats">
        <div class="membros-stat">
          <i class="fas fa-bullhorn" style="color:#2563eb;"></i>
          <div>
            <span class="membros-stat-value">${total}</span>
            <span class="membros-stat-label">Comunicados</span>
          </div>
        </div>
        <div class="membros-stat">
          <i class="fas fa-exclamation-circle" style="color:#dc2626;"></i>
          <div>
            <span class="membros-stat-value">${this._dados.filter(a => a.Tipo === 'Urgente').length}</span>
            <span class="membros-stat-label">Urgentes</span>
          </div>
        </div>
        <div class="membros-stat">
          <i class="fas fa-thumbtack" style="color:#F59E0B;"></i>
          <div>
            <span class="membros-stat-value">${fixados}</span>
            <span class="membros-stat-label">Fixado(s)</span>
          </div>
        </div>
        <div class="membros-stat">
          <i class="fas fa-calendar-check" style="color:#059669;"></i>
          <div>
            <span class="membros-stat-value">${hoje}</span>
            <span class="membros-stat-label">Hoje</span>
          </div>
        </div>
      </div>

      <div class="membros-toolbar">
        <div style="flex:1;"></div>
        <div class="membros-filtros">
          <button class="btn btn-success" onclick="Mural.novo()">
            <i class="fas fa-plus"></i> Novo Comunicado
          </button>
        </div>
      </div>

      ${lista.length === 0 ? UI.emptyState(
        'Nenhum comunicado',
        'Crie o primeiro aviso para a igreja.',
        `<button class="btn btn-success btn-lg" onclick="Mural.novo()"><i class="fas fa-plus"></i> Criar aviso</button>`
      ) : lista.map(a => this._renderCard(a)).join('')}
    `;
  },

  _renderCard(a) {
    const tipos = CONFIG.MURAL.TIPOS;
    const cfg = tipos.find(t => t.id === a.Tipo) || tipos[0];
    const fixado = a.Fixo === 'Sim';
    
    const dataFormatada = a.criado_em ? new Date(a.criado_em).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'}) : '--';
    
    // O linkify local para a tabela do ADM
    const mensagemFormatada = a.Mensagem.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color:#2563eb;text-decoration:underline;word-break:break-all;">$1</a>');

    return `
      <div class="data-card" style="padding:16px;margin-bottom:12px;border-left:4px solid ${cfg.cor}; background:${fixado ? cfg.bg : '#fff'}">
        
        <div style="display:flex;gap:6px;margin-bottom:12px;">
          <span style="background:${cfg.cor};color:#fff;padding:4px 10px;border-radius:20px;font-size:10px;font-weight:800;">
            ${cfg.icon} ${cfg.nome.toUpperCase()}
          </span>
          ${fixado ? `
            <span style="background:#fff;color:${cfg.cor};border:1.5px solid ${cfg.cor};padding:4px 10px;border-radius:20px;font-size:10px;font-weight:800;">
              📌 FIXADO
            </span>
          ` : ''}
        </div>

        <h3 style="color:${fixado ? cfg.cor : '#1F2937'}; margin:0 0 8px 0; font-size:16px;">${UI.escapar(a.Titulo)}</h3>
        
        <p style="color:#4B5563;font-size:14px;line-height:1.6;margin-bottom:16px;">
          ${mensagemFormatada}
        </p>

        <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #E5E7EB;padding-top:12px;">
          <div style="display:flex;gap:12px;color:#9CA3AF;font-size:12px;">
            <span><i class="fas fa-user"></i> ${UI.escapar(a.Autor || 'Liderança')}</span>
            <span><i class="fas fa-clock"></i> ${dataFormatada}</span>
          </div>
          
          <div style="display:flex;gap:6px;">
            <button class="btn btn-warning btn-sm" onclick="Mural.editar('${a.sheetRowIndex}')" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="Mural.remover('${a.sheetRowIndex}')" title="Apagar">
              <i class="fas fa-trash"></i>
            </button>
            ${fixado ? `
              <button class="btn btn-neutral btn-sm" onclick="Mural.desafixar('${a.sheetRowIndex}')" style="margin-left:8px; font-size:11px;">
                <i class="fas fa-thumbtack"></i> Desafixar
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  },

  novo() { this._abrirForm(null); },
  
  editar(id) {
    const aviso = this._dados.find(a => a.sheetRowIndex == id);
    if (aviso) this._abrirForm(aviso);
  },

  async desafixar(id) {
    const aviso = this._dados.find(a => a.sheetRowIndex == id);
    if(!aviso) return;
    
    // Atualiza o Fixo para Não
    aviso.Fixo = 'Não';
    try {
      await API.salvar(CONFIG.TABELAS.MURAL, aviso, id);
      UI.toast('Aviso desafixado', 'success');
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  },

  _abrirForm(aviso) {
    const ehEdicao = !!aviso;
    const tipos = CONFIG.MURAL.TIPOS.map(t => `<option value="${t.id}" ${aviso?.Tipo === t.id ? 'selected' : ''}>${t.nome}</option>`).join('');
    
    const html = `
      <div class="form-secao">
        <div class="form-group">
          <label class="form-label form-label-required">Título</label>
          <input class="form-input" id="mur-titulo" value="${aviso?.Titulo || ''}" placeholder="Ex: Culto de Natal">
        </div>
        
        <div class="form-group">
          <label class="form-label form-label-required">Mensagem</label>
          <textarea class="form-textarea" id="mur-mensagem" rows="4" placeholder="Escreva os detalhes do aviso...">${aviso?.Mensagem || ''}</textarea>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Tipo de Aviso</label>
            <select class="form-select" id="mur-tipo">
              ${tipos}
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Autor</label>
            <input class="form-input" id="mur-autor" value="${aviso?.Autor || 'Liderança'}">
          </div>
        </div>

        <div class="form-group" style="margin-top:16px;">
          <label class="form-checkbox" style="display:flex; align-items:center; gap:8px; cursor:pointer;">
            <input type="checkbox" id="mur-fixo" ${aviso?.Fixo === 'Sim' ? 'checked' : ''} style="width:auto;">
            <span style="font-weight:600; font-size:14px;">📌 Fixar este aviso no topo</span>
          </label>
          <p style="font-size:12px; color:#64748b; margin-top:4px;">O aviso fixado aparece em destaque na tela inicial do membro.</p>
        </div>
      </div>
    `;

    const botoes = `
      <button class="btn btn-neutral" onclick="UI.closeModal()">Cancelar</button>
      <button class="btn btn-success" onclick="Mural._salvar('${aviso?.sheetRowIndex || ''}')">
        <i class="fas fa-save"></i> ${ehEdicao ? 'Salvar alterações' : 'Publicar aviso'}
      </button>
    `;

    UI.openModal(ehEdicao ? '✏️ Editar Comunicado' : '📢 Novo Comunicado', html, botoes);
  },

  async _salvar(id) {
    const titulo = document.getElementById('mur-titulo').value.trim();
    const mensagem = document.getElementById('mur-mensagem').value.trim();
    const tipo = document.getElementById('mur-tipo').value;
    const autor = document.getElementById('mur-autor').value.trim();
    const fixo = document.getElementById('mur-fixo').checked;

    if (!titulo) return UI.toast('Preencha o título', 'error');
    if (!mensagem) return UI.toast('Preencha a mensagem', 'error');

    const dados = {
      Titulo: titulo,
      Mensagem: mensagem,
      Tipo: tipo,
      Autor: autor,
      Fixo: fixo ? 'Sim' : 'Não'
    };

    try {
      await API.salvar(CONFIG.TABELAS.MURAL, dados, id ? parseInt(id) : null);
      UI.toast('Aviso salvo!', 'success');
      UI.closeModal();
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  },

  // ⚠️ AQUI ESTÁ A CORREÇÃO DO BOTÃO APAGAR (Passando 'Mural')
  async remover(id) {
    const ok = await UI.confirmar(`Remover este aviso permanentemente?`, 'Remover aviso');
    if (!ok) return;

    try {
      // Passa 'Mural' como segundo parâmetro para o backend saber qual tabela apagar
      const r = await API.remover(id, 'Mural'); 
      UI.toast(r.message || 'Aviso removido com sucesso!', 'success');
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  }

};

console.log('%c[Mural] Módulo carregado v3.0', 'color:#64748b;font-size:11px;');
