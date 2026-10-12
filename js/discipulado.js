/* ============================================================
   PIBENS ADM — Módulo Discipulado
   ============================================================
   Funcionalidades:
   - Lista de discipulandos em cards por etapa
   - Barra de progresso visual
   - Alerta de "prontos para batismo"
   - Botão "Avançar etapa" (1 clique)
   - Botão WhatsApp
   - Sugestão de discipulador (busca nos membros)
   ============================================================ */

const Discipulado = {

  _dados: [],
  _membros: [],
  _filtro: 'todos',

  /* ==========================================================
     RENDER PRINCIPAL
     ========================================================== */
  async render() {
    const c = document.getElementById('content');
    if (!c) return;

    c.innerHTML = UI.loading('Carregando discipulado...');

    try {
      const [disc, membros] = await Promise.all([
        API.listar(CONFIG.TABELAS.DISCIPULADO),
        API.listar(CONFIG.TABELAS.MEMBROS)
      ]);
      this._dados = disc || [];
      this._membros = membros || [];
      this._renderTudo();
    } catch (e) {
      c.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon" style="color:#dc2626;"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="empty-state-title">Erro ao carregar</div>
          <div class="empty-state-text">${UI.escapar(e.message)}</div>
          <button class="btn btn-primary" onclick="Discipulado.render()">
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

    c.innerHTML = `
      <div class="disc-stats">
        ${CONFIG.DISCIPULADO.ETAPAS.map((etapa) => `
          <div class="disc-stat-card" style="border-left-color:${etapa.cor};" onclick="Discipulado._filtrarPor('${etapa.nome}')">
            <div class="disc-stat-icon" style="background:${etapa.cor}22;color:${etapa.cor};">
              <i class="fas ${etapa.icon}"></i>
            </div>
            <div class="disc-stat-info">
              <span class="disc-stat-value" style="color:${etapa.cor};">${stats[etapa.nome] || 0}</span>
              <span class="disc-stat-label">${etapa.nome}</span>
            </div>
          </div>
        `).join('')}
      </div>

      ${stats['Pronto para Batismo'] > 0 ? `
        <div class="disc-alerta">
          <i class="fas fa-water"></i>
          <div>
            <strong>${stats['Pronto para Batismo']} pessoa(s) pronta(s) para batismo!</strong>
            <div style="font-size:0.85rem;margin-top:0.2rem;">Verifique a lista abaixo e agende a cerimônia.</div>
          </div>
        </div>
      ` : ''}

      <div class="disc-filtros">
        <button class="disc-filtro ${this._filtro === 'todos' ? 'active' : ''}" onclick="Discipulado._filtrarPor('todos')">
          <i class="fas fa-list"></i> Todos (${this._dados.length})
        </button>
        ${CONFIG.DISCIPULADO.ETAPAS.map((etapa) => `
          <button class="disc-filtro ${this._filtro === etapa.nome ? 'active' : ''}" onclick="Discipulado._filtrarPor('${etapa.nome}')">
            <i class="fas ${etapa.icon}"></i> ${etapa.nome} (${stats[etapa.nome] || 0})
          </button>
        `).join('')}
      </div>

      <div class="disc-lista-header">
        <h2><i class="fas fa-seedling mr-2"></i>Discipulandos <span class="esc-count">(${filtrados.length})</span></h2>
        <button class="btn btn-success" onclick="Discipulado.novo()">
          <i class="fas fa-plus"></i> Novo discipulando
        </button>
      </div>

      ${this._renderLista(filtrados)}
    `;
  },

  /* ==========================================================
     FILTRO
     ========================================================== */
  _filtrarPor(filtro) {
    this._filtro = filtro;
    this._renderTudo();
  },

  _filtrar() {
    if (this._filtro === 'todos') return this._dados;
    return this._dados.filter((d) => d.Etapa === this._filtro);
  },

  /* ==========================================================
     STATS
     ========================================================== */
  _calcularStats() {
    const stats = {};
    CONFIG.DISCIPULADO.ETAPAS.forEach((e) => { stats[e.nome] = 0; });
    this._dados.forEach((d) => {
      if (stats[d.Etapa] !== undefined) stats[d.Etapa]++;
    });
    return stats;
  },

  /* ==========================================================
     LISTA
     ========================================================== */
  _renderLista(dados) {
    if (!dados || dados.length === 0) {
      return UI.emptyState(
        'Nenhum discipulando',
        this._filtro === 'todos'
          ? 'Cadastre o primeiro discipulando para começar o acompanhamento.'
          : `Nenhum discipulando na etapa "${this._filtro}".`,
        this._filtro === 'todos'
          ? `<button class="btn btn-success btn-lg" onclick="Discipulado.novo()">
               <i class="fas fa-plus"></i> Novo discipulando
             </button>`
          : `<button class="btn btn-neutral" onclick="Discipulado._filtrarPor('todos')">
               <i class="fas fa-list"></i> Ver todos
             </button>`
      );
    }

    const ordenados = [...dados].sort((a, b) => {
      // Ordena por etapa (prioridade) e depois por data de decisão
      const idxA = CONFIG.DISCIPULADO.ETAPAS.findIndex((e) => e.nome === a.Etapa);
      const idxB = CONFIG.DISCIPULADO.ETAPAS.findIndex((e) => e.nome === b.Etapa);
      if (idxA !== idxB) return idxA - idxB;
      return (a.DataDecisao || '').localeCompare(b.DataDecisao || '');
    });

    const cards = ordenados.map((d) => this._renderCard(d)).join('');

    return `<div class="disc-lista">${cards}</div>`;
  },

  _renderCard(d) {
    const etapa = CONFIG.DISCIPULADO.ETAPAS.find((e) => e.nome === d.Etapa) || CONFIG.DISCIPULADO.ETAPAS[0];
    const idx = CONFIG.DISCIPULADO.ETAPAS.findIndex((e) => e.nome === d.Etapa);
    const proximaEtapa = idx >= 0 && idx < CONFIG.DISCIPULADO.ETAPAS.length - 1
      ? CONFIG.DISCIPULADO.ETAPAS[idx + 1]
      : null;

    const diasDesdeDecisao = d.DataDecisao ? Math.floor((new Date() - new Date(d.DataDecisao)) / 86400000) : 0;
    const telefone = (d.Telefone || '').replace(/\D/g, '');

    return `
      <div class="disc-card" style="border-left-color:${etapa.cor};">
        <div class="disc-card-header">
          <div class="disc-card-nome">
            <i class="fas ${etapa.icon}" style="color:${etapa.cor};"></i>
            <strong>${UI.escapar(d.Nome || '?')}</strong>
            ${d.Idade ? `<span class="disc-card-idade">${d.Idade} anos</span>` : ''}
          </div>
          <div class="disc-card-badges">
            <span class="disc-badge" style="background:${etapa.cor}22;color:${etapa.cor};">
              ${etapa.nome}
            </span>
            ${proximaEtapa ? `
              <button class="btn btn-sm btn-primary" onclick="Discipulado.avancar(${d.sheetRowIndex})" title="Avançar para ${proximaEtapa.nome}">
                <i class="fas fa-arrow-right"></i> ${proximaEtapa.nome}
              </button>
            ` : ''}
          </div>
        </div>

        <div class="disc-progresso">
          <div class="disc-progresso-barra">
            <div class="disc-progresso-preenchimento" style="width:${etapa.progresso}%;background:${etapa.cor};"></div>
          </div>
          <span class="disc-progresso-label">${etapa.progresso}%</span>
        </div>

        <div class="disc-card-info">
          <div class="disc-info-item">
            <i class="fas fa-calendar-check"></i>
            <span><strong>Decisão:</strong> ${UI.dataBR(d.DataDecisao)} (${diasDesdeDecisao} dias)</span>
          </div>
          ${d.Discipulador ? `
            <div class="disc-info-item">
              <i class="fas fa-user-tie"></i>
              <span><strong>Discipulador:</strong> ${UI.escapar(d.Discipulador)}</span>
            </div>
          ` : ''}
          ${d.Telefone ? `
            <div class="disc-info-item">
              <i class="fas fa-phone"></i>
              <span>${UI.telefone(d.Telefone)}</span>
            </div>
          ` : ''}
          ${d.Endereco ? `
            <div class="disc-info-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>${UI.escapar(d.Endereco)}</span>
            </div>
          ` : ''}
          ${d.DataBatismo ? `
            <div class="disc-info-item" style="color:#059669;font-weight:700;">
              <i class="fas fa-water"></i>
              <span><strong>Batizado em:</strong> ${UI.dataBR(d.DataBatismo)}</span>
            </div>
          ` : ''}
        </div>

        ${d.Observacoes ? `
          <div class="disc-card-obs">
            <i class="fas fa-sticky-note mr-2"></i>${UI.escapar(d.Observacoes)}
          </div>
        ` : ''}

        <div class="disc-card-acoes">
          ${telefone.length >= 10 ? `
            <button class="btn btn-success btn-sm" onclick="Discipulado.abrirWhats('${telefone}', '${UI.escapar(d.Nome).replace(/'/g, "\\'")}')">
              <i class="fab fa-whatsapp"></i> WhatsApp
            </button>
          ` : ''}
          <button class="btn btn-warning btn-sm" onclick="Discipulado.editar(${d.sheetRowIndex})">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="btn btn-danger btn-sm" onclick="Discipulado.remover(${d.sheetRowIndex})">
            <i class="fas fa-trash"></i> Remover
          </button>
        </div>
      </div>
    `;
  },

  /* ==========================================================
     AVANÇAR ETAPA
     ========================================================== */
  async avancar(id) {
    const d = this._dados.find((x) => x.sheetRowIndex == id);
    if (!d) return;

    const idx = CONFIG.DISCIPULADO.ETAPAS.findIndex((e) => e.nome === d.Etapa);
    if (idx < 0 || idx >= CONFIG.DISCIPULADO.ETAPAS.length - 1) return;

    const proxima = CONFIG.DISCIPULADO.ETAPAS[idx + 1];

    // Se estiver indo pra "Batizado", pede a data
    if (proxima.nome === 'Batizado') {
      const hoje = new Date().toISOString().slice(0, 10);
      const html = `
        <div class="form-group">
          <label class="form-label">Data do Batismo</label>
          <input type="date" id="disc-data-batismo" class="form-input" value="${hoje}">
        </div>
        <p style="margin-top:1rem;color:#475569;font-size:0.9rem;">
          Ao confirmar, <strong>${UI.escapar(d.Nome)}</strong> será movido para <strong>"Batizado"</strong>.
        </p>
      `;
      UI.openModal('💧 Confirmar Batismo', html, `
        <button class="btn btn-neutral" onclick="UI.closeModal()">Cancelar</button>
        <button class="btn btn-success" onclick="Discipulado._confirmarBatismo(${id})">
          <i class="fas fa-check"></i> Confirmar
        </button>
      `);
      return;
    }

    // Pra outras etapas, só avança
    const ok = await UI.confirmar(
      `Avançar "${d.Nome}" para "${proxima.nome}"?`,
      'Avançar etapa'
    );
    if (!ok) return;

    try {
      const dados = Object.assign({}, d);
      delete dados.sheetRowIndex;
      dados.Etapa = proxima.nome;

      await API.salvar(CONFIG.TABELAS.DISCIPULADO, dados, d.sheetRowIndex);
      UI.toast(`✅ ${d.Nome} → ${proxima.nome}`, 'success');
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  },

  async _confirmarBatismo(id) {
    const d = this._dados.find((x) => x.sheetRowIndex == id);
    if (!d) return;

    const dataBatismo = document.getElementById('disc-data-batismo')?.value || '';

    try {
      const dados = Object.assign({}, d);
      delete dados.sheetRowIndex;
      dados.Etapa = 'Batizado';
      dados.DataBatismo = dataBatismo;

      await API.salvar(CONFIG.TABELAS.DISCIPULADO, dados, d.sheetRowIndex);
      UI.toast(`💧 ${d.Nome} batizado(a)! Que bênção!`, 'success');
      UI.closeModal();
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  },

  /* ==========================================================
     NOVO / EDITAR
     ========================================================== */
  novo() {
    this._abrirForm(null);
  },

  editar(id) {
    const d = this._dados.find((x) => x.sheetRowIndex == id);
    if (d) this._abrirForm(d);
  },

  _abrirForm(item) {
    const ehEdicao = !!item;
    const campos = CONFIG.CAMPOS.Discipulado;

    const html = `<div class="form-grid">${
      campos.map((campo) => {
        let valor = item ? (item[campo.nome] || '') : '';

        if (campo.tipo === 'date' && valor) {
          valor = UI.dataInput(valor);
        }

        const labelClass = campo.obrigatorio ? 'form-label form-label-required' : 'form-label';
        const fullClass = (campo.tipo === 'textarea') ? 'form-grid-full' : '';
        const isDiscipulador = campo.nome === 'Discipulador';

        let input = '';
        if (campo.tipo === 'textarea') {
          input = `<textarea class="form-textarea" name="${campo.nome}" rows="3">${UI.escapar(valor)}</textarea>`;
        } else if (campo.tipo === 'select') {
          const opts = (campo.opcoes || []).map(
            (o) => `<option value="${UI.escapar(o)}" ${valor === o ? 'selected' : ''}>${UI.escapar(o)}</option>`
          ).join('');
          input = `<select class="form-select" name="${campo.nome}">
                     <option value="">— Selecione —</option>
                     ${opts}
                   </select>`;
        } else if (isDiscipulador) {
          input = `<div class="esc-input-grupo">
                     <input class="form-input" type="text" name="${campo.nome}" value="${UI.escapar(valor)}" placeholder="Nome do discipulador">
                     <button type="button" class="esc-btn-sugerir" onclick="Discipulado.sugerirDiscipulador()" title="Sugerir membro">
                       <i class="fas fa-user-plus"></i>
                     </button>
                   </div>`;
        } else {
          input = `<input class="form-input" type="${campo.tipo}" name="${campo.nome}" value="${UI.escapar(valor)}">`;
        }

        return `
          <div class="form-group ${fullClass}">
            <label class="${labelClass}">${campo.nome}</label>
            ${input}
          </div>
        `;
      }).join('')
    }</div>`;

    const botoes = `
      <button class="btn btn-neutral" onclick="UI.closeModal()">
        <i class="fas fa-times"></i> Cancelar
      </button>
      <button class="btn btn-success" onclick="Discipulado._salvar()">
        <i class="fas fa-save"></i> ${ehEdicao ? 'Salvar alterações' : 'Cadastrar'}
      </button>
    `;

    UI.openModal(
      ehEdicao ? `✏️ Editar: ${UI.escapar(item.Nome)}` : '🌱 Novo discipulando',
      html,
      botoes
    );

    const form = document.getElementById('modal-body');
    if (form) {
      const inputId = document.createElement('input');
      inputId.type = 'hidden';
      inputId.id = 'disc-id';
      inputId.value = item ? item.sheetRowIndex : '';
      form.appendChild(inputId);
    }
  },

  /* ==========================================================
     SUGERIR DISCIPULADOR
     ========================================================== */
  sugerirDiscipulador() {
    const opcoes = [];
    this._membros.forEach((m) => {
      const nome = m.Nome || m.nome;
      if (nome) opcoes.push({ nome, talento: m.Talento || '' });
    });

    opcoes.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));

    if (opcoes.length === 0) {
      UI.toast('Nenhum membro cadastrado.', 'warning');
      return;
    }

    const html = `
      <div class="form-group" style="margin-bottom:1rem;">
        <input type="text" id="disc-busca-sugestao" class="form-input" placeholder="🔍 Buscar por nome..." oninput="Discipulado._filtrarSugestoes(this.value)">
      </div>
      <div class="esc-sugestoes-lista">
        ${opcoes.map((o) => `
          <div class="esc-sugestao-item" data-nome="${UI.escapar(o.nome).toLowerCase()}" onclick="Discipulado._escolherDiscipulador('${UI.escapar(o.nome).replace(/'/g, "\\'")}')">
            <div><strong>${UI.escapar(o.nome)}</strong></div>
            <span class="esc-sugestao-tipo">Membro</span>
          </div>
        `).join('')}
      </div>
    `;

    UI.openModal('👥 Sugerir discipulador', html, `
      <button class="btn btn-neutral" onclick="UI.closeModal()">
        <i class="fas fa-times"></i> Fechar
      </button>
    `);

    setTimeout(() => {
      const i = document.getElementById('disc-busca-sugestao');
      if (i) i.focus();
    }, 100);
  },

  _filtrarSugestoes(valor) {
    const v = valor.toLowerCase();
    document.querySelectorAll('.esc-sugestao-item').forEach((item) => {
      const nome = item.dataset.nome || '';
      if (nome.includes(v)) item.style.display = '';
      else item.style.display = 'none';
    });
  },

  _escolherDiscipulador(nomeEscolhido) {
    const input = document.querySelector('[name="Discipulador"]');
    if (input) {
      input.value = nomeEscolhido;
    }
    UI.closeModal();
  },

  /* ==========================================================
     SALVAR
     ========================================================== */
  async _salvar() {
    const form = document.getElementById('modal-body');
    if (!form) return;

    const id = form.querySelector('#disc-id')?.value || null;

    const dados = {};
    CONFIG.CAMPOS.Discipulado.forEach((campo) => {
      const input = form.querySelector(`[name="${campo.nome}"]`);
      dados[campo.nome] = input ? input.value.trim() : '';
    });

    for (const campo of CONFIG.CAMPOS.Discipulado) {
      if (campo.obrigatorio && !dados[campo.nome]) {
        UI.toast(`Preencha o campo obrigatório: ${campo.nome}`, 'error');
        return;
      }
    }

    try {
      const r = await API.salvar(CONFIG.TABELAS.DISCIPULADO, dados, id ? parseInt(id) : null);
      UI.toast(r.message || CONFIG.MSG.SALVO_SUCESSO, 'success');
      UI.closeModal();
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  },

  /* ==========================================================
     REMOVER
     ========================================================== */
  async remover(id) {
    const d = this._dados.find((x) => x.sheetRowIndex == id);
    if (!d) return;

    const ok = await UI.confirmar(
      `Remover "${d.Nome}" do discipulado?`,
      'Remover discipulando'
    );
    if (!ok) return;

    try {
      const r = await API.remover(id);
      UI.toast(r.message || CONFIG.MSG.REMOVIDO_SUCESSO, 'success');
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  },

  /* ==========================================================
     WHATSAPP
     ========================================================== */
  abrirWhats(telefone, nome) {
    if (!telefone || telefone.length < 10) {
      UI.toast('Telefone não cadastrado.', 'warning');
      return;
    }
    const numero = '55' + telefone.replace(/\D/g, '');
    const msg = encodeURIComponent(`Olá ${nome}! Tudo bem? Passando pra saber como você está e se podemos marcar nosso próximo encontro de discipulado. Deus te abençoe! 🙏`);
    window.open(`https://wa.me/${numero}?text=${msg}`, '_blank');
  }

};

console.log('%c[Discipulado] Módulo carregado', 'color:#64748b;font-size:11px;');
