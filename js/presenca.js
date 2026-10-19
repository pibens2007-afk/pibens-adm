/* ============================================================
   PIBENS ADM — Módulo Presença v2.0
   ============================================================ */

const Presenca = {

  _dados: [],

  async render() {
    const c = document.getElementById('content');
    if (!c) return;

    c.innerHTML = UI.loading('Carregando cultos...');

    try {
      const dados = await API.listar(CONFIG.TABELAS.PRESENCAS);
      this._dados = dados || [];
      this._renderTudo();
    } catch (e) {
      c.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon" style="color:#dc2626;"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="empty-state-title">Erro ao carregar</div>
          <div class="empty-state-text">${UI.escapar(e.message)}</div>
          <button class="btn btn-primary" onclick="Presenca.render()">
            <i class="fas fa-sync"></i> Tentar de novo
          </button>
        </div>
      `;
    }
  },

  _renderTudo() {
    const c = document.getElementById('content');
    
    // Ordena pelos mais recentes
    const lista = [...this._dados].sort((a, b) => new Date(b.Data) - new Date(a.Data));

    c.innerHTML = `
      <div class="data-card" style="margin-bottom:24px; background:linear-gradient(135deg, #2563eb, #7c3aed); color:#fff; border:none; padding:24px; border-radius:16px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h2 style="margin:0 0 8px 0; font-size:22px; display:flex; align-items:center; gap:8px;">
            <i class="fas fa-church"></i> Cultos
          </h2>
          <p style="margin:0; font-size:14px; opacity:0.9;">${lista.length} culto(s) no período</p>
        </div>
        <button class="btn btn-success" style="background:#10b981; border:none; font-weight:700;" onclick="Presenca.novo()">
          <i class="fas fa-plus"></i> Novo culto
        </button>
      </div>

      <div class="data-card" style="padding:0; overflow:hidden;">
        <div class="data-table-wrap">
          <table class="data-table">
            <thead style="background:#1e293b; color:#fff;">
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Tema</th>
                <th>Pregador</th>
                <th>Presentes</th>
                <th>Taxa</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              ${lista.length === 0 ? '<tr><td colspan="7" style="text-align:center; padding:20px;">Nenhum culto registrado</td></tr>' : ''}
              ${lista.map(p => this._renderLinha(p)).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  _renderLinha(p) {
    // Taxa de presença (simulada para dar um visual)
    const total = parseInt(p.TotalPresentes) || 0;
    const taxa = total > 0 ? Math.min(Math.round((total / 60) * 100), 100) : 0;
    const corTaxa = taxa >= 70 ? '#10b981' : taxa >= 50 ? '#f59e0b' : '#dc2626';

    return `
      <tr>
        <td style="font-weight:600;">${UI.dataBR(p.Data)}</td>
        <td><span class="badge" style="background:#e0e7ff; color:#4338ca;">${UI.escapar(p.Tipo)}</span></td>
        <td>${UI.escapar(p.Tema || '—')}</td>
        <td>${UI.escapar(p.Pregador || '—')}</td>
        <td style="font-weight:700;">${total}</td>
        <td style="color:${corTaxa}; font-weight:700;">${taxa}%</td>
        <td class="col-actions">
          <button class="btn btn-success btn-sm" onclick="Presenca.editar('${p.sheetRowIndex}')" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-primary btn-sm" onclick="Presenca.ver('${p.sheetRowIndex}')" title="Ver detalhes">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-danger btn-sm" onclick="Presenca.remover('${p.sheetRowIndex}')" title="Remover">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  },

  novo() { this._abrirForm(null); },

  editar(id) {
    const registro = this._dados.find(p => p.sheetRowIndex == id);
    if (registro) this._abrirForm(registro);
  },

  ver(id) {
    const p = this._dados.find(x => x.sheetRowIndex == id);
    if (!p) return;

    const html = `
      <div class="form-secao">
        <p><strong>Data:</strong> ${UI.dataBR(p.Data)}</p>
        <p><strong>Tipo:</strong> ${UI.escapar(p.Tipo)}</p>
        <p><strong>Tema:</strong> ${UI.escapar(p.Tema || 'Não informado')}</p>
        <p><strong>Pregador:</strong> ${UI.escapar(p.Pregador || 'Não informado')}</p>
        <hr style="margin:16px 0; border:0; border-top:1px solid #e2e8f0;">
        <p><strong>Total de Presentes:</strong> ${p.TotalPresentes}</p>
        <p><strong>Visitantes:</strong><br> ${UI.escapar(p.Visitantes || 'Nenhum')}</p>
        <p><strong>Observações:</strong><br> ${UI.escapar(p.Observacoes || 'Nenhuma')}</p>
      </div>
    `;

    UI.openModal('👁️ Detalhes do Culto', html, `<button class="btn btn-neutral" onclick="UI.closeModal()">Fechar</button>`);
  },

  _abrirForm(registro) {
    const ehEdicao = !!registro;
    const campos = CONFIG.CAMPOS.Presencas;

    // Transforma o campo Visitantes em Textarea no formulário
    const camposHTML = campos.map(campo => {
      let valor = registro ? (registro[campo.nome] || '') : '';
      if (campo.tipo === 'date' && valor) valor = UI.dataInput(valor);

      let input = '';
      // AQUI A MÁGICA: Se for o campo Visitantes ou Observações, usa textarea
      if (campo.nome === 'Visitantes' || campo.tipo === 'textarea') {
        input = `<textarea class="form-textarea" name="${campo.nome}" rows="3" placeholder="Digite o nome dos visitantes...">${UI.escapar(valor)}</textarea>`;
      } else if (campo.tipo === 'select') {
        const opts = (campo.opcoes || []).map(o => `<option value="${o}" ${valor === o ? 'selected' : ''}>${o}</option>`).join('');
        input = `<select class="form-select" name="${campo.nome}"><option value="">— Selecione —</option>${opts}</select>`;
      } else {
        input = `<input class="form-input" type="${campo.tipo}" name="${campo.nome}" value="${UI.escapar(valor)}">`;
      }

      // Organiza o grid
      const isFull = (campo.nome === 'Visitantes' || campo.tipo === 'textarea' || campo.nome === 'Tema');
      const classeGrid = isFull ? 'form-grid-full' : '';

      return `
        <div class="form-group ${classeGrid}">
          <label class="form-label ${campo.obrigatorio ? 'form-label-required' : ''}">${campo.nome}</label>
          ${input}
        </div>
      `;
    }).join('');

    const html = `<div class="form-secao"><div class="form-grid">${camposHTML}</div></div>`;

    const botoes = `
      <button class="btn btn-neutral" onclick="UI.closeModal()">Cancelar</button>
      <button class="btn btn-success" onclick="Presenca._salvar('${registro?.sheetRowIndex || ''}')">
        <i class="fas fa-save"></i> Salvar
      </button>
    `;

    UI.openModal(ehEdicao ? '✏️ Editar Culto' : '⛪ Novo Culto', html, botoes);
  },

  async _salvar(id) {
    const form = document.getElementById('modal-body');
    const dados = {};
    
    CONFIG.CAMPOS.Presencas.forEach(campo => {
      const input = form.querySelector(`[name="${campo.nome}"]`);
      if (input) dados[campo.nome] = input.value.trim();
    });

    // Validações básicas
    if (!dados.Data || !dados.Tipo) return UI.toast('Data e Tipo são obrigatórios', 'error');

    try {
      await API.salvar(CONFIG.TABELAS.PRESENCAS, dados, id ? parseInt(id) : null);
      UI.toast('Culto salvo com sucesso!', 'success');
      UI.closeModal();
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  },

  async remover(id) {
    const ok = await UI.confirmar(`Remover este registro de culto?`, 'Remover');
    if (!ok) return;

    try {
      await API.remover(id, 'Presencas'); // Passa a tabela certa
      UI.toast('Culto removido!', 'success');
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  }

};

console.log('%c[Presenca] Módulo carregado v2.0', 'color:#64748b;font-size:11px;');
