/* ============================================================
   PIBENS ADM — Módulo Membros
   ============================================================ */

const Membros = {

  _dados: [],

  /* ----------------------------------------------------------
     Render principal
     ---------------------------------------------------------- */
  async render() {
    const c = document.getElementById('content');
    if (!c) return;

    c.innerHTML = UI.loading('Carregando membros...');

    try {
      const dados = await API.listar(CONFIG.TABELAS.MEMBROS);
      this._dados = dados || [];
      this._renderTabela();
    } catch (e) {
      c.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon" style="color:#dc2626;"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="empty-state-title">Erro ao carregar</div>
          <div class="empty-state-text">${UI.escapar(e.message)}</div>
          <button class="btn btn-primary" onclick="Membros.render()">
            <i class="fas fa-sync"></i> Tentar de novo
          </button>
        </div>
      `;
    }
  },

  /* ----------------------------------------------------------
     Tabela
     ---------------------------------------------------------- */
  _renderTabela() {
    const c = document.getElementById('content');
    const colunas = CONFIG.COLUNAS_TABELA.Membros;

    if (!this._dados || this._dados.length === 0) {
      c.innerHTML = UI.emptyState(
        'Nenhum membro cadastrado',
        'Comece cadastrando o primeiro membro da igreja.',
        `<button class="btn btn-success btn-lg" onclick="Membros.novo()">
           <i class="fas fa-user-plus"></i> Cadastrar primeiro membro
         </button>`
      );
      return;
    }

    let linhas = '';
    this._dados.forEach((m) => {
      const cells = colunas.map((h) => `<td>${UI.escapar(m[h] || '—')}</td>`).join('');
      const botaoTalento = m.Talento
        ? `<button class="btn btn-purple btn-sm" onclick="Membros.enviarParaTalentos(${m.sheetRowIndex})" title="Enviar para Talentos">
             <i class="fas fa-star"></i> → Talentos
           </button>`
        : '';
      linhas += `
        <tr>
          ${cells}
          <td class="col-actions">
            <button class="btn btn-primary btn-sm" onclick="Membros.ver(${m.sheetRowIndex})" title="Ver detalhes">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-warning btn-sm" onclick="Membros.editar(${m.sheetRowIndex})" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="Membros.remover(${m.sheetRowIndex})" title="Remover">
              <i class="fas fa-trash"></i>
            </button>
            ${botaoTalento}
          </td>
        </tr>
      `;
    });

    c.innerHTML = `
      <div class="data-card">
        <div class="data-header">
          <div class="data-header-top">
            <div>
              <h2 class="data-title"><i class="fas fa-users mr-2"></i>Membros</h2>
              <p class="data-subtitle">${this._dados.length} cadastrado(s)</p>
            </div>
            <div class="data-actions">
              <button class="btn btn-ghost btn-sm" onclick="Membros.ordenarAZ()">
                <i class="fas fa-sort-alpha-down"></i> A-Z
              </button>
              <button class="btn btn-success btn-sm" onclick="Membros.novo()">
                <i class="fas fa-plus"></i> Novo
              </button>
            </div>
          </div>
        </div>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                ${colunas.map((h) => `<th>${h}</th>`).join('')}
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>${linhas}</tbody>
          </table>
        </div>
      </div>
    `;
  },

  /* ----------------------------------------------------------
     Ordenar A-Z
     ---------------------------------------------------------- */
  ordenarAZ() {
    this._dados.sort((a, b) => {
      const va = (a.Nome || '').toString().toLowerCase();
      const vb = (b.Nome || '').toString().toLowerCase();
      return va.localeCompare(vb, 'pt-BR', { sensitivity: 'base' });
    });
    this._renderTabela();
    UI.toast('Ordenado A-Z', 'info');
  },

  /* ----------------------------------------------------------
     Ver detalhes (modal)
     ---------------------------------------------------------- */
  ver(id) {
    const m = this._dados.find((x) => x.sheetRowIndex == id);
    if (!m) return;

    const campos = CONFIG.CAMPOS.Membros;
    const html = campos.map((campo) => {
      let valor = m[campo.nome];
      if (campo.tipo === 'date') valor = UI.dataBR(valor);
      return `
        <div style="padding:0.6rem 0;border-bottom:1px solid #f1f5f9;">
          <div style="font-size:0.7rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;">
            ${campo.nome}
          </div>
          <div style="font-size:0.95rem;color:#1e293b;font-weight:500;margin-top:0.2rem;word-break:break-word;">
            ${valor ? UI.escapar(valor) : '<span style="color:#cbd5e1;">—</span>'}
          </div>
        </div>
      `;
    }).join('');

    const botoes = `
      <button class="btn btn-neutral" onclick="UI.closeModal()">
        <i class="fas fa-times"></i> Fechar
      </button>
      ${m.Talento ? `<button class="btn btn-purple" onclick="UI.closeModal(); Membros.enviarParaTalentos(${m.sheetRowIndex})">
        <i class="fas fa-star"></i> Enviar para Talentos
      </button>` : ''}
      <button class="btn btn-warning" onclick="UI.closeModal(); Membros.editar(${m.sheetRowIndex})">
        <i class="fas fa-edit"></i> Editar
      </button>
    `;

    UI.openModal(`👤 ${UI.escapar(m.Nome || 'Membro')}`, html, botoes);
  },

  /* ----------------------------------------------------------
     Novo / Editar (formulário)
     ---------------------------------------------------------- */
  novo() {
    this._abrirForm(null);
  },

  editar(id) {
    const m = this._dados.find((x) => x.sheetRowIndex == id);
    if (m) this._abrirForm(m);
  },

  _abrirForm(membro) {
    const ehEdicao = !!membro;
    const campos = CONFIG.CAMPOS.Membros;

    const html = `<div class="form-grid">${
      campos.map((campo) => {
        let valor = membro ? (membro[campo.nome] || '') : '';

        if (campo.tipo === 'date' && valor) {
          valor = UI.dataInput(valor);
        }

        const labelClass = campo.obrigatorio ? 'form-label form-label-required' : 'form-label';
        const fullClass = (campo.tipo === 'textarea') ? 'form-grid-full' : '';

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
      <button class="btn btn-success" onclick="Membros._salvar()">
        <i class="fas fa-save"></i> ${ehEdicao ? 'Salvar alterações' : 'Cadastrar'}
      </button>
    `;

    UI.openModal(
      ehEdicao ? `✏️ Editar: ${UI.escapar(membro.Nome)}` : '👤 Novo membro',
      html,
      botoes
    );

    // Guarda o id (se edição) num campo oculto
    const form = document.getElementById('modal-body');
    if (form) {
      const inputId = document.createElement('input');
      inputId.type = 'hidden';
      inputId.id = 'membro-id';
      inputId.value = membro ? membro.sheetRowIndex : '';
      form.appendChild(inputId);
    }
  },

  /* ----------------------------------------------------------
     Salvar
     ---------------------------------------------------------- */
  async _salvar() {
    const form = document.getElementById('modal-body');
    if (!form) return;

    const id = form.querySelector('#membro-id')?.value || null;

    // Coleta os campos
    const dados = {};
    CONFIG.CAMPOS.Membros.forEach((campo) => {
      const input = form.querySelector(`[name="${campo.nome}"]`);
      dados[campo.nome] = input ? input.value.trim() : '';
    });

    // Valida obrigatórios
    for (const campo of CONFIG.CAMPOS.Membros) {
      if (campo.obrigatorio && !dados[campo.nome]) {
        UI.toast(`Preencha o campo obrigatório: ${campo.nome}`, 'error');
        return;
      }
    }

    try {
      const r = await API.salvar(CONFIG.TABELAS.MEMBROS, dados, id ? parseInt(id) : null);
      UI.toast(r.message || CONFIG.MSG.SALVO_SUCESSO, 'success');
      UI.closeModal();
      this.render();
      if (typeof Dashboard !== 'undefined') Dashboard._renderBanners({});
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  },

  /* ----------------------------------------------------------
     Enviar para Talentos
     ---------------------------------------------------------- */
  async enviarParaTalentos(id) {
    const m = this._dados.find((x) => x.sheetRowIndex == id);
    if (!m) return;

    const ok = await UI.confirmar(
      `Enviar "${m.Nome}" (talento: ${m.Talento}) para o Banco de Talentos?`,
      'Enviar para Talentos'
    );
    if (!ok) return;

    const dados = {
      Nome:     m.Nome || '',
      Talento:  m.Talento || '',
      Telefone: m.Telefone || '',
      Email:    m.Email || ''
    };

    try {
      await API.salvar(CONFIG.TABELAS.TALENTOS, dados, null);
      UI.toast(`⭐ ${m.Nome} enviado para o Banco de Talentos!`, 'success');
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  },

  /* ----------------------------------------------------------
     Remover
     ---------------------------------------------------------- */
  async remover(id) {
    const m = this._dados.find((x) => x.sheetRowIndex == id);
    if (!m) return;

    const ok = await UI.confirmar(
      `Remover "${m.Nome}" definitivamente?`,
      'Remover membro'
    );
    if (!ok) return;

    try {
      const r = await API.remover(id);
      UI.toast(r.message || CONFIG.MSG.REMOVIDO_SUCESSO, 'success');
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  }

};

console.log('%c[Membros] Módulo carregado', 'color:#64748b;font-size:11px;');
