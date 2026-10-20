/* ============================================================
   PIBENS ADM — Módulo Membros v3.0
   ============================================================ */

const Membros = {

  _dados: [],
  _filtroCategoria: '',
  _filtroSituacao: '',
  _filtroMinisterio: '',
  _busca: '',

  async render() {
    const c = document.getElementById('content');
    if (!c) return;

    c.innerHTML = UI.loading('Carregando membros...');

    try {
      const dados = await API.listar(CONFIG.TABELAS.MEMBROS);
      this._dados = dados || [];
      this._renderTudo();
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

  _renderTudo() {
    const filtrados = this._filtrar();
    this._renderTela(filtrados);
  },

  _filtrar() {
    let lista = [...this._dados];

    if (this._busca) {
      const b = this._busca.toLowerCase();
      lista = lista.filter((m) =>
        (m.Nome || '').toLowerCase().includes(b) ||
        (m.Apelido || '').toLowerCase().includes(b) ||
        (m.Telefone || '').toLowerCase().includes(b) ||
        (m.CPF || '').toLowerCase().includes(b)
      );
    }

    if (this._filtroCategoria) {
      lista = lista.filter((m) => m.Categoria === this._filtroCategoria);
    }

    if (this._filtroSituacao) {
      lista = lista.filter((m) => m.Situação === this._filtroSituacao);
    }

    if (this._filtroMinisterio) {
      lista = lista.filter((m) => {
        const mins = this._parseMinisterios(m.Ministérios);
        return mins.includes(this._filtroMinisterio);
      });
    }

    return lista;
  },

  _parseMinisterios(v) {
    if (!v) return [];
    if (Array.isArray(v)) return v;
    if (typeof v === 'string') {
      try {
        const arr = JSON.parse(v);
        if (Array.isArray(arr)) return arr;
      } catch (e) { /* não é JSON, tenta split */ }
      return v.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  },

  _corMinisterio(nome) {
    const m = CONFIG.MINISTERIOS.find((x) => x.nome === nome);
    return m ? m.cor : '#64748b';
  },

  _iconMinisterio(nome) {
    const m = CONFIG.MINISTERIOS.find((x) => x.nome === nome);
    return m ? m.icon : 'fa-users';
  },

  _renderTela(dados) {
    const c = document.getElementById('content');
    const total = this._dados.length;
    const ativos = this._dados.filter((m) => m.Situação === 'Ativo').length;

    const contagemMin = {};
    this._dados.forEach((m) => {
      const mins = this._parseMinisterios(m.Ministérios);
      mins.forEach((min) => {
        contagemMin[min] = (contagemMin[min] || 0) + 1;
      });
    });

    const ministeriosAtivos = CONFIG.MINISTERIOS.filter((min) => contagemMin[min.nome] > 0);

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
          <i class="fas fa-sitemap" style="color:#7c3aed;"></i>
          <div>
            <span class="membros-stat-value">${ministeriosAtivos.length}</span>
            <span class="membros-stat-label">Ministérios ativos</span>
          </div>
        </div>
      </div>

      ${ministeriosAtivos.length > 0 ? `
        <div class="membros-ministerios-cards">
          ${ministeriosAtivos.map((min) => `
            <div class="membros-min-card ${this._filtroMinisterio === min.nome ? 'active' : ''}"
                 style="border-left-color:${min.cor};"
                 onclick="Membros._clicarMinisterio('${min.nome.replace(/'/g, "\\'")}')">
              <div class="membros-min-icon" style="background:${min.cor}22;color:${min.cor};">
                <i class="fas ${min.icon}"></i>
              </div>
              <div class="membros-min-info">
                <span class="membros-min-count" style="color:${min.cor};">${contagemMin[min.nome]}</span>
                <span class="membros-min-label">${min.nome}</span>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="membros-toolbar">
        <div class="membros-busca">
          <i class="fas fa-search"></i>
          <input type="text" id="membros-busca-input" placeholder="Buscar por nome, apelido, telefone..." value="${UI.escapar(this._busca)}" oninput="Membros._buscar(this.value)">
        </div>
        <div class="membros-filtros">
          <select class="form-select" onchange="Membros._filtrarCategoria(this.value)">
            <option value="">Todas as categorias</option>
            <option value="Membro" ${this._filtroCategoria === 'Membro' ? 'selected' : ''}>Membro</option>
            <option value="Frequentador" ${this._filtroCategoria === 'Frequentador' ? 'selected' : ''}>Frequentador</option>
            <option value="Visitante" ${this._filtroCategoria === 'Visitante' ? 'selected' : ''}>Visitante</option>
          </select>
          <select class="form-select" onchange="Membros._filtrarSituacao(this.value)">
            <option value="">Todas as situações</option>
            <option value="Ativo" ${this._filtroSituacao === 'Ativo' ? 'selected' : ''}>Ativo</option>
            <option value="Inativo" ${this._filtroSituacao === 'Inativo' ? 'selected' : ''}>Inativo</option>
          </select>
          <select class="form-select" onchange="Membros._filtrarMinisterio(this.value)">
            <option value="">Todos os ministérios</option>
            ${CONFIG.MINISTERIOS.map((m) => `
              <option value="${UI.escapar(m.nome)}" ${this._filtroMinisterio === m.nome ? 'selected' : ''}>${m.nome}</option>
            `).join('')}
          </select>
          <button class="btn btn-success" onclick="Membros.novo()">
            <i class="fas fa-plus"></i> Novo
          </button>
        </div>
      </div>

      ${dados.length === 0 ? UI.emptyState(
        'Nenhum membro encontrado',
        'Tente ajustar os filtros ou cadastre o primeiro membro.',
        `<button class="btn btn-success btn-lg" onclick="Membros.novo()"><i class="fas fa-user-plus"></i> Cadastrar</button>`
      ) : this._renderDataCard(dados)}
    `;

    if (this._busca) {
      setTimeout(() => {
        const i = document.getElementById('membros-busca-input');
        if (i) { i.focus(); i.setSelectionRange(this._busca.length, this._busca.length); }
      }, 10);
    }
  },

  _renderDataCard(dados) {
    const linhas = dados.map((m) => this._renderLinha(m)).join('');

    return `
      <div class="data-card">
        <div class="data-header">
          <div class="data-header-top">
            <div>
              <h2 class="data-title"><i class="fas fa-users mr-2"></i>Membros</h2>
              <p class="data-subtitle">${dados.length} cadastrado(s)</p>
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
                <th>Nome</th>
                <th>Telefone</th>
                <th>Ministérios</th>
                <th>Situação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>${linhas}</tbody>
          </table>
        </div>
      </div>
    `;
  },

  _renderLinha(m) {
    const situacao = m.Situação || '—';
    const corSit = situacao === 'Ativo' ? '#059669' : '#dc2626';
    const ministerios = this._parseMinisterios(m.Ministérios);

    const badgesMin = ministerios.length > 0
      ? ministerios.slice(0, 3).map((min) => {
          const cor = this._corMinisterio(min);
          const icon = this._iconMinisterio(min);
          return `<span class="membros-badge-min" style="background:${cor}18;color:${cor};border:1px solid ${cor}40;" title="${UI.escapar(min)}">
            <i class="fas ${icon}"></i> ${UI.escapar(this._abreviar(min))}
          </span>`;
        }).join('') + (ministerios.length > 3 ? `<span class="membros-badge-min" style="background:#f1f5f9;color:#64748b;">+${ministerios.length - 3}</span>` : '')
      : '<span style="color:#cbd5e1;font-size:0.85rem;">—</span>';

    const botaoTalento = m.Talento
      ? `<button class="btn btn-purple btn-sm" onclick="Membros.enviarParaTalentos(${m.sheetRowIndex})" title="Enviar para Talentos">
           <i class="fas fa-star"></i>
         </button>`
      : '';

    // MOSTRANDO O APELIDO
    const nomeExibicao = m.Nome + (m.Apelido ? ` <span style="color:#64748b;font-weight:400;font-size:0.85em;">(${m.Apelido})</span>` : '');

    return `
      <tr>
        <td><strong>${nomeExibicao}</strong></td>
        <td>${UI.telefone(m.Telefone)}</td>
        <td><div class="membros-badges-min">${badgesMin}</div></td>
        <td><span class="membros-badge" style="background:${corSit}22;color:${corSit};">${situacao}</span></td>
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
  },

  _abreviar(nome) {
    return nome.replace('Ministério de ', '').replace('Ministério ', '').replace('Ministerio de ', '').replace('Ministerio ', '');
  },

  _buscar(valor) { this._busca = valor; this._renderTudo(); },
  _filtrarCategoria(valor) { this._filtroCategoria = valor; this._renderTudo(); },
  _filtrarSituacao(valor) { this._filtroSituacao = valor; this._renderTudo(); },
  _filtrarMinisterio(valor) { this._filtroMinisterio = valor; this._renderTudo(); },
  _clicarMinisterio(nome) { this._filtroMinisterio = (this._filtroMinisterio === nome) ? '' : nome; this._renderTudo(); },
  _limparFiltros() { this._filtroCategoria = ''; this._filtroSituacao = ''; this._filtroMinisterio = ''; this._busca = ''; this._renderTudo(); },

  ordenarAZ() {
    this._dados.sort((a, b) => (a.Nome || '').localeCompare(b.Nome || '', 'pt-BR', { sensitivity: 'base' }));
    this._renderTudo();
    UI.toast('Ordenado A-Z', 'info');
  },

  ver(id) {
    const m = this._dados.find((x) => x.sheetRowIndex == id);
    if (!m) return;

    const campos = CONFIG.CAMPOS.Membros;
    const faixa = UI.calcularFaixaEtaria(m.Nascimento);
    const ministerios = this._parseMinisterios(m.Ministérios);

    const secoes = {
      'Dados Pessoais': ['Nome', 'Apelido', 'Nascimento', 'CPF', 'RG', 'Estado Civil', 'Nome do Cônjuge', 'Parentesco', 'Profissão'],
      'Contato': ['Telefone', 'Email', 'Endereço', 'Bairro', 'Cidade', 'Estado', 'CEP'],
      'Igreja': ['Já foi batizado?', 'Data de Batismo', 'Situação', 'Categoria', 'Função', 'Talento', 'Data de Membro'],
      'Outros': ['Observações']
    };

    let html = '';

    if (faixa) {
      const idade = UI.calcularIdade(m.Nascimento);
      html += `<div class="membros-detalhe-faixa" style="background:${faixa.cor}15;border-left:4px solid ${faixa.cor}; padding:12px; border-radius:8px; margin-bottom:16px; display:flex; align-items:center; gap:12px;"><i class="fas ${faixa.icon}" style="color:${faixa.cor};"></i><div><strong style="color:${faixa.cor};">${faixa.nome}</strong><span style="color:#64748b;font-size:0.85rem;margin-left:0.5rem;">${idade} anos</span></div></div>`;
    }

    if (ministerios.length > 0) {
      const chips = ministerios.map((min) => {
        const cor = this._corMinisterio(min);
        const icon = this._iconMinisterio(min);
        return `<span class="membros-detalhe-chip" style="background:${cor}18;color:${cor};border:1px solid ${cor}40; padding:4px 8px; border-radius:12px; font-size:12px; margin-right:4px; display:inline-block; margin-bottom:4px;"><i class="fas ${icon}"></i> ${UI.escapar(min)}</span>`;
      }).join('');

      html += `<div class="membros-detalhe-secao" style="margin-bottom:16px;"><h3 class="membros-detalhe-secao-titulo" style="font-size:13px; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Ministérios (${ministerios.length})</h3><div>${chips}</div></div>`;
    }

    for (const [secao, camposSecao] of Object.entries(secoes)) {
      const linhas = camposSecao.map((nomeCampo) => {
        const campo = campos.find((c) => c.nome === nomeCampo);
        if (!campo) return '';
        let valor = m[nomeCampo];
        if (campo.tipo === 'date') valor = valor ? UI.dataBR(valor) : '';
        else if (nomeCampo === 'Telefone') valor = UI.telefone(valor);
        else if (nomeCampo === 'CPF') valor = UI.cpf(valor);
        else if (nomeCampo === 'CEP') valor = UI.cep(valor);
        if (!valor || valor === '—') return '';
        return `<div class="membros-detalhe-campo" style="margin-bottom:12px;"><div class="membros-detalhe-label" style="font-size:11px; color:#64748b; text-transform:uppercase;">${nomeCampo}</div><div class="membros-detalhe-valor" style="font-size:14px; color:#1e293b; font-weight:500;">${UI.escapar(valor)}</div></div>`;
      }).filter(Boolean).join('');

      if (linhas) {
        html += `<div class="membros-detalhe-secao" style="margin-bottom:16px;"><h3 class="membros-detalhe-secao-titulo" style="font-size:13px; color:#64748b; text-transform:uppercase; margin-bottom:12px; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">${secao}</h3><div class="membros-detalhe-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">${linhas}</div></div>`;
      }
    }

    const botoes = `
      <button class="btn btn-neutral" onclick="UI.closeModal()">Fechar</button>
      <button class="btn btn-warning" onclick="UI.closeModal(); Membros.editar(${m.sheetRowIndex})"><i class="fas fa-edit"></i> Editar</button>
    `;

    const tituloModal = m.Apelido ? `👤 ${UI.escapar(m.Nome)} (${m.Apelido})` : `👤 ${UI.escapar(m.Nome || 'Membro')}`;
    UI.openModal(tituloModal, html, botoes);
  },

  novo() { this._abrirForm(null); },
  editar(id) { const m = this._dados.find((x) => x.sheetRowIndex == id); if (m) this._abrirForm(m); },

  _abrirForm(membro) {
    const ehEdicao = !!membro;
    const campos = CONFIG.CAMPOS.Membros;
    const ministeriosSelecionados = membro ? this._parseMinisterios(membro.Ministérios) : [];

    const secoes = {
      'Dados Pessoais': ['Nome', 'Apelido', 'Nascimento', 'CPF', 'RG', 'Estado Civil', 'Nome do Cônjuge', 'Parentesco', 'Profissão'],
      'Contato': ['Telefone', 'Email', 'Endereço', 'Bairro', 'Cidade', 'Estado', 'CEP'],
      'Igreja': ['Já foi batizado?', 'Data de Batismo', 'Situação', 'Categoria', 'Função', 'Talento', 'Data de Membro'],
      'Outros': ['Observações']
    };

    let html = '';

    for (const [tituloSecao, camposSecao] of Object.entries(secoes)) {
      const camposHTML = camposSecao.map((nomeCampo) => {
        const campo = campos.find((c) => c.nome === nomeCampo);
        if (!campo) return '';
        let valor = membro ? (membro[campo.nome] || '') : '';
        if (campo.tipo === 'date' && valor) valor = UI.dataInput(valor);
        
        let input = '';
        if (campo.tipo === 'textarea') {
          input = `<textarea class="form-textarea" name="${campo.nome}" rows="3">${UI.escapar(valor)}</textarea>`;
        } else if (campo.tipo === 'select') {
          const opts = (campo.opcoes || []).map(o => `<option value="${UI.escapar(o)}" ${valor === o ? 'selected' : ''}>${UI.escapar(o)}</option>`).join('');
          input = `<select class="form-select" name="${campo.nome}"><option value="">— Selecione —</option>${opts}</select>`;
        } else {
          input = `<input class="form-input" type="${campo.tipo}" name="${campo.nome}" value="${UI.escapar(valor)}">`;
        }

        const fullClass = campo.tipo === 'textarea' ? 'form-grid-full' : '';
        return `<div class="form-group ${fullClass}"><label class="form-label ${campo.obrigatorio ? 'form-label-required' : ''}">${campo.nome}</label>${input}</div>`;
      }).join('');

      html += `<div class="form-secao"><h3 class="form-secao-titulo">${tituloSecao}</h3><div class="form-grid">${camposHTML}</div></div>`;
    }

    const ministeriosHTML = CONFIG.MINISTERIOS.map((min) => {
      const marcado = ministeriosSelecionados.includes(min.nome);
      return `
        <label class="min-checkbox ${marcado ? 'checked' : ''}" style="--min-cor: ${min.cor};">
          <input type="checkbox" class="min-checkbox-input" value="${UI.escapar(min.nome)}" ${marcado ? 'checked' : ''} onchange="Membros._toggleMin(this)">
          <div class="min-checkbox-content">
            <div class="min-checkbox-icon" style="background:${min.cor}22;color:${min.cor};"><i class="fas ${min.icon}"></i></div>
            <span class="min-checkbox-label">${min.nome}</span>
            <i class="fas fa-check-circle min-checkbox-check"></i>
          </div>
        </label>
      `;
    }).join('');

    html += `<div class="form-secao"><h3 class="form-secao-titulo"><i class="fas fa-sitemap"></i> Ministérios / Departamentos <span class="form-secao-hint">(marque todos os que participa)</span></h3><div class="min-grid">${ministeriosHTML}</div><div class="min-contador"><i class="fas fa-check-circle"></i> <span id="min-contador">0</span> ministério(s) selecionado(s)</div></div>`;

    const botoes = `
      <button class="btn btn-neutral" onclick="UI.closeModal()">Cancelar</button>
      <button class="btn btn-success" onclick="Membros._salvar()"><i class="fas fa-save"></i> ${ehEdicao ? 'Salvar alterações' : 'Cadastrar'}</button>
    `;

    UI.openModal(ehEdicao ? `✏️ Editar: ${UI.escapar(membro.Nome)}` : '👤 Novo membro', html, botoes);

    const form = document.getElementById('modal-body');
    if (form) {
      const inputId = document.createElement('input');
      inputId.type = 'hidden'; inputId.id = 'membro-id'; inputId.value = membro ? membro.sheetRowIndex : '';
      form.appendChild(inputId);
      this._atualizarContadorMin();
    }
  },

  _toggleMin(input) {
    const label = input.closest('.min-checkbox');
    if (label) { if (input.checked) label.classList.add('checked'); else label.classList.remove('checked'); }
    this._atualizarContadorMin();
  },

  _atualizarContadorMin() {
    const contador = document.getElementById('min-contador');
    if (!contador) return;
    contador.textContent = document.querySelectorAll('.min-checkbox-input:checked').length;
  },

  async _salvar() {
    const form = document.getElementById('modal-body');
    if (!form) return;
    const id = form.querySelector('#membro-id')?.value || null;

    const dados = {};
    CONFIG.CAMPOS.Membros.forEach((campo) => {
      const input = form.querySelector(`[name="${campo.nome}"]`);
      dados[campo.nome] = input ? input.value.trim() : '';
    });

    const marcados = [];
    form.querySelectorAll('.min-checkbox-input:checked').forEach((cb) => { marcados.push(cb.value); });
    dados.Ministérios = JSON.stringify(marcados);

    for (const campo of CONFIG.CAMPOS.Membros) {
      if (campo.obrigatorio && !dados[campo.nome]) return UI.toast(`Preencha o campo obrigatório: ${campo.nome}`, 'error');
    }

    try {
      const r = await API.salvar(CONFIG.TABELAS.MEMBROS, dados, id ? parseInt(id) : null);
      UI.toast(r.message || CONFIG.MSG.SALVO_SUCESSO, 'success');
      UI.closeModal();
      this.render();
      if (typeof Dashboard !== 'undefined') Dashboard.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  },

  async enviarParaTalentos(id) {
    const m = this._dados.find((x) => x.sheetRowIndex == id);
    if (!m) return;
    const ok = await UI.confirmar(`Enviar "${m.Nome}" (talento: ${m.Talento || 'não especificado'}) para o Banco de Talentos?`, 'Enviar para Talentos');
    if (!ok) return;
    const dados = { Nome: m.Nome || '', Talento: m.Talento || m.Função || '', Telefone: m.Telefone || '', Email: m.Email || '' };
    try {
      await API.salvar(CONFIG.TABELAS.TALENTOS, dados, null);
      UI.toast(`⭐ ${m.Nome} enviado!`, 'success');
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  },

  async remover(id) {
    const m = this._dados.find((x) => x.sheetRowIndex == id);
    if (!m) return;
    const ok = await UI.confirmar(`Remover "${m.Nome}"?`, 'Remover membro');
    if (!ok) return;
    try {
      const r = await API.remover(id, 'Membros');
      UI.toast(r.message || CONFIG.MSG.REMOVIDO_SUCESSO, 'success');
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  }

};

console.log('%c[Membros] Módulo carregado v3.0 com Apelido', 'color:#64748b;font-size:11px;');
