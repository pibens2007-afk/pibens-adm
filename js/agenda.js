/* ============================================================
   PIBENS ADM — Módulo Agenda
   ============================================================ */

const Agenda = {

  _dados: [],

  /* ----------------------------------------------------------
     Render principal
     ---------------------------------------------------------- */
  async render() {
    const c = document.getElementById('content');
    if (!c) return;

    c.innerHTML = UI.loading('Carregando agenda...');

    try {
      const dados = await API.listar(CONFIG.TABELAS.AGENDA);
      this._dados = dados || [];
      this._ordenarPorData();
      this._renderTabela();
    } catch (e) {
      c.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon" style="color:#dc2626;"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="empty-state-title">Erro ao carregar</div>
          <div class="empty-state-text">${UI.escapar(e.message)}</div>
          <button class="btn btn-primary" onclick="Agenda.render()">
            <i class="fas fa-sync"></i> Tentar de novo
          </button>
        </div>
      `;
    }
  },

  /* ----------------------------------------------------------
     Ordenação cronológica (por data)
     ---------------------------------------------------------- */
  _ordenarPorData() {
    this._dados.sort((a, b) => {
      const da = this._dataISO(a.Data);
      const db = this._dataISO(b.Data);
      return da.localeCompare(db);
    });
  },

  _dataISO(v) {
    if (!v) return '9999-99-99';
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) {
      const [d, m, a] = v.split('/');
      return `${a}-${m}-${d}`;
    }
    return '9999-99-99';
  },

  /* ----------------------------------------------------------
     Tabela
     ---------------------------------------------------------- */
  _renderTabela() {
    const c = document.getElementById('content');
    const colunas = CONFIG.COLUNAS_TABELA.Agenda;

    if (!this._dados || this._dados.length === 0) {
      c.innerHTML = UI.emptyState(
        'Nenhum evento na agenda',
        'Comece cadastrando os cultos e atividades da igreja.',
        `<button class="btn btn-primary btn-lg" onclick="Agenda.novo()">
           <i class="fas fa-calendar-plus"></i> Cadastrar primeiro evento
         </button>`
      );
      return;
    }

    // Separa em futuros e passados
    const hoje = new Date().toISOString().slice(0, 10);
    const futuros = this._dados.filter((e) => this._dataISO(e.Data) >= hoje);
    const passados = this._dados.filter((e) => this._dataISO(e.Data) < hoje);

    let linhas = '';

    // Futuros
    if (futuros.length > 0) {
      linhas += `<tr><td colspan="${colunas.length + 1}" style="background:#eff6ff;color:#1d4ed8;font-weight:800;font-size:0.8rem;text-transform:uppercase;letter-spacing:0.05em;">
        <i class="fas fa-clock mr-1"></i> Próximos eventos
      </td></tr>`;
      futuros.forEach((e) => { linhas += this._linha(e, colunas); });
    }

    // Passados
    if (passados.length > 0) {
      linhas += `<tr><td colspan="${colunas.length + 1}" style="background:#f8fafc;color:#64748b;font-weight:800;font-size:0.8rem;text-transform:uppercase;letter-spacing:0.05em;">
        <i class="fas fa-history mr-1"></i> Eventos passados
      </td></tr>`;
      passados.reverse().forEach((e) => { linhas += this._linha(e, colunas); });
    }

    c.innerHTML = `
      <div class="data-card">
        <div class="data-header">
          <div class="data-header-top">
            <div>
              <h2 class="data-title"><i class="fas fa-calendar-alt mr-2"></i>Agenda</h2>
              <p class="data-subtitle">${this._dados.length} evento(s) — ${futuros.length} futuro(s)</p>
            </div>
            <div class="data-actions">
              <button class="btn btn-ghost btn-sm" onclick="Agenda.ordenarAZ()">
                <i class="fas fa-sort"></i> Data
              </button>
              <button class="btn btn-primary btn-sm" onclick="Agenda.novo()">
                <i class="fas fa-plus"></i> Novo evento
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

  _linha(evento, colunas) {
    const cells = colunas.map((h) => {
      let v = evento[h] || '—';
      if (h === 'Data') v = UI.dataBR(v);
      return `<td>${UI.escapar(v)}</td>`;
    }).join('');

    return `
      <tr>
        ${cells}
        <td class="col-actions">
          <button class="btn btn-primary btn-sm" onclick="Agenda.ver(${evento.sheetRowIndex})" title="Ver">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-warning btn-sm" onclick="Agenda.editar(${evento.sheetRowIndex})" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-danger btn-sm" onclick="Agenda.remover(${evento.sheetRowIndex})" title="Remover">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  },

  /* ----------------------------------------------------------
     Ordenar A-Z (por Evento)
     ---------------------------------------------------------- */
  ordenarAZ() {
    this._ordenarPorData();
    this._renderTabela();
    UI.toast('Ordenado por data', 'info');
  },

  /* ----------------------------------------------------------
     Ver detalhes
     ---------------------------------------------------------- */
  ver(id) {
    const e = this._dados.find((x) => x.sheetRowIndex == id);
    if (!e) return;

    const campos = CONFIG.CAMPOS.Agenda;
    const html = campos.map((campo) => {
      let valor = e[campo.nome];
      if (campo.tipo === 'date') valor = UI.dataBR(valor);
      return `
        <div style="padding:0.6rem 0;border-bottom:1px solid #f1f5f9;">
          <div style="font-size:0.7rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;">
            ${campo.nome}
          </div>
          <div style="font-size:0.95rem;color:#1e293b;font-weight:500;margin-top:0.2rem;word-break:break-word;white-space:pre-wrap;">
            ${valor ? UI.escapar(valor) : '<span style="color:#cbd5e1;">—</span>'}
          </div>
        </div>
      `;
    }).join('');

    const botoes = `
      <button class="btn btn-neutral" onclick="UI.closeModal()">
        <i class="fas fa-times"></i> Fechar
      </button>
      <button class="btn btn-warning" onclick="UI.closeModal(); Agenda.editar(${e.sheetRowIndex})">
        <i class="fas fa-edit"></i> Editar
      </button>
    `;

    UI.openModal(`📅 ${UI.escapar(e.Evento || 'Evento')}`, html, botoes);
  },

  /* ----------------------------------------------------------
     Novo / Editar
     ---------------------------------------------------------- */
  novo() {
    this._abrirForm(null);
  },

  editar(id) {
    const e = this._dados.find((x) => x.sheetRowIndex == id);
    if (e) this._abrirForm(e);
  },

  _abrirForm(evento) {
    const ehEdicao = !!evento;
    const campos = CONFIG.CAMPOS.Agenda;

    const html = `<div class="form-grid">${
      campos.map((campo) => {
        let valor = evento ? (evento[campo.nome] || '') : '';

        if (campo.tipo === 'date' && valor) {
          valor = UI.dataInput(valor);
        }

        const labelClass = campo.obrigatorio ? 'form-label form-label-required' : 'form-label';
        const fullClass = (campo.tipo === 'textarea') ? 'form-grid-full' : '';

        let input = '';
        if (campo.tipo === 'textarea') {
          input = `<textarea class="form-textarea" name="${campo.nome}" rows="3">${UI.escapar(valor)}</textarea>`;
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
      <button class="btn btn-primary" onclick="Agenda._salvar()">
        <i class="fas fa-save"></i> ${ehEdicao ? 'Salvar alterações' : 'Cadastrar'}
      </button>
    `;

    UI.openModal(
      ehEdicao ? `✏️ Editar: ${UI.escapar(evento.Evento)}` : '📅 Novo evento',
      html,
      botoes
    );

    const form = document.getElementById('modal-body');
    if (form) {
      const inputId = document.createElement('input');
      inputId.type = 'hidden';
      inputId.id = 'agenda-id';
      inputId.value = evento ? evento.sheetRowIndex : '';
      form.appendChild(inputId);
    }
  },

  /* ----------------------------------------------------------
     Salvar
     ---------------------------------------------------------- */
  async _salvar() {
    const form = document.getElementById('modal-body');
    if (!form) return;

    const id = form.querySelector('#agenda-id')?.value || null;

    const dados = {};
    CONFIG.CAMPOS.Agenda.forEach((campo) => {
      const input = form.querySelector(`[name="${campo.nome}"]`);
      dados[campo.nome] = input ? input.value.trim() : '';
    });

    for (const campo of CONFIG.CAMPOS.Agenda) {
      if (campo.obrigatorio && !dados[campo.nome]) {
        UI.toast(`Preencha o campo obrigatório: ${campo.nome}`, 'error');
        return;
      }
    }

    try {
      const r = await API.salvar(CONFIG.TABELAS.AGENDA, dados, id ? parseInt(id) : null);
      UI.toast(r.message || CONFIG.MSG.SALVO_SUCESSO, 'success');
      UI.closeModal();
      this.render();
      if (typeof Dashboard !== 'undefined') Dashboard._renderBanners({});
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  },

  /* ----------------------------------------------------------
     Remover
     ---------------------------------------------------------- */
  async remover(id) {
    const e = this._dados.find((x) => x.sheetRowIndex == id);
    if (!e) return;

    const ok = await UI.confirmar(
      `Remover "${e.Evento}" (${UI.dataBR(e.Data)}) da agenda?`,
      'Remover evento'
    );
    if (!ok) return;

    try {
      const r = await API.remover(id);
      UI.toast(r.message || CONFIG.MSG.REMOVIDO_SUCESSO, 'success');
      this.render();
    } catch (err) {
      UI.toast('Erro: ' + err.message, 'error');
    }
  }

};

console.log('%c[Agenda] Módulo carregado', 'color:#64748b;font-size:11px;');
