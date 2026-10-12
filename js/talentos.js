/* ============================================================
   PIBENS ADM — Módulo Banco de Talentos
   ============================================================ */

const Talentos = {

  _dados: [],

  /* ----------------------------------------------------------
     Render principal
     ---------------------------------------------------------- */
  async render() {
    const c = document.getElementById('content');
    if (!c) return;

    c.innerHTML = UI.loading('Carregando talentos...');

    try {
      const dados = await API.listar(CONFIG.TABELAS.TALENTOS);
      this._dados = dados || [];
      this._renderTabela();
    } catch (e) {
      c.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon" style="color:#dc2626;"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="empty-state-title">Erro ao carregar</div>
          <div class="empty-state-text">${UI.escapar(e.message)}</div>
          <button class="btn btn-primary" onclick="Talentos.render()">
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
    const colunas = CONFIG.COLUNAS_TABELA.BancoTalentos;

    if (!this._dados || this._dados.length === 0) {
      c.innerHTML = UI.emptyState(
        'Nenhum talento cadastrado',
        'Cadastre ou envie membros para o Banco de Talentos.',
        `<button class="btn btn-purple btn-lg" onclick="Talentos.novo()">
           <i class="fas fa-star"></i> Cadastrar primeiro talento
         </button>`
      );
      return;
    }

    let linhas = '';
    this._dados.forEach((t) => {
      const cells = colunas.map((h) => `<td>${UI.escapar(t[h] || '—')}</td>`).join('');
      linhas += `
        <tr>
          ${cells}
          <td class="col-actions">
            <button class="btn btn-warning btn-sm" onclick="Talentos.editar(${t.sheetRowIndex})" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="Talentos.remover(${t.sheetRowIndex})" title="Remover">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });

    c.innerHTML = `
      <div class="data-card">
        <div class="data-header">
          <div class="data-header-top">
            <div>
              <h2 class="data-title"><i class="fas fa-star mr-2"></i>Banco de Talentos</h2>
              <p class="data-subtitle">${this._dados.length} talento(s) registrado(s)</p>
            </div>
            <div class="data-actions">
              <button class="btn btn-ghost btn-sm" onclick="Talentos.ordenarAZ()">
                <i class="fas fa-sort-alpha-down"></i> A-Z
              </button>
              <button class="btn btn-purple btn-sm" onclick="Talentos.novo()">
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
     Ordenar
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
     Formulário
     ---------------------------------------------------------- */
  novo() {
    this._abrirForm(null);
  },

  editar(id) {
    const t = this._dados.find((x) => x.sheetRowIndex == id);
    if (t) this._abrirForm(t);
  },

  _abrirForm(talento) {
    const ehEdicao = !!talento;
    const campos = CONFIG.CAMPOS.BancoTalentos;

    const html = `<div class="form-grid">${
      campos.map((campo) => {
        const valor = talento ? (talento[campo.nome] || '') : '';
        const labelClass = campo.obrigatorio ? 'form-label form-label-required' : 'form-label';

        let input = '';
        if (campo.tipo === 'textarea') {
          input = `<textarea class="form-textarea" name="${campo.nome}" rows="3">${UI.escapar(valor)}</textarea>`;
        } else {
          input = `<input class="form-input" type="${campo.tipo}" name="${campo.nome}" value="${UI.escapar(valor)}">`;
        }

        return `
          <div class="form-group">
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
      <button class="btn btn-purple" onclick="Talentos._salvar()">
        <i class="fas fa-save"></i> ${ehEdicao ? 'Salvar alterações' : 'Cadastrar'}
      </button>
    `;

    UI.openModal(
      ehEdicao ? `✏️ Editar: ${UI.escapar(talento.Nome)}` : '⭐ Novo talento',
      html,
      botoes
    );

    const form = document.getElementById('modal-body');
    if (form) {
      const inputId = document.createElement('input');
      inputId.type = 'hidden';
      inputId.id = 'talento-id';
      inputId.value = talento ? talento.sheetRowIndex : '';
      form.appendChild(inputId);
    }
  },

  /* ----------------------------------------------------------
     Salvar
     ---------------------------------------------------------- */
  async _salvar() {
    const form = document.getElementById('modal-body');
    if (!form) return;

    const id = form.querySelector('#talento-id')?.value || null;

    const dados = {};
    CONFIG.CAMPOS.BancoTalentos.forEach((campo) => {
      const input = form.querySelector(`[name="${campo.nome}"]`);
      dados[campo.nome] = input ? input.value.trim() : '';
    });

    for (const campo of CONFIG.CAMPOS.BancoTalentos) {
      if (campo.obrigatorio && !dados[campo.nome]) {
        UI.toast(`Preencha o campo obrigatório: ${campo.nome}`, 'error');
        return;
      }
    }

    try {
      const r = await API.salvar(CONFIG.TABELAS.TALENTOS, dados, id ? parseInt(id) : null);
      UI.toast(r.message || CONFIG.MSG.SALVO_SUCESSO, 'success');
      UI.closeModal();
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  },

  /* ----------------------------------------------------------
     Remover
     ---------------------------------------------------------- */
  async remover(id) {
    const t = this._dados.find((x) => x.sheetRowIndex == id);
    if (!t) return;

    const ok = await UI.confirmar(
      `Remover "${t.Nome}" do Banco de Talentos?`,
      'Remover talento'
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

console.log('%c[Talentos] Módulo carregado', 'color:#64748b;font-size:11px;');
