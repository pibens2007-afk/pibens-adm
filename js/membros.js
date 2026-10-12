/* ============================================================
   PIBENS ADM — Módulo Membros v2.6
   ============================================================
   Novidades:
   - 23 campos (17 originais + 6 novos)
   - Faixa etária calculada
   - Badges de Categoria/Situação na tabela
   - Filtro por categoria e situação
   ============================================================ */

const Membros = {

  _dados: [],
  _filtroCategoria: '',
  _filtroSituacao: '',
  _busca: '',

  /* ----------------------------------------------------------
     RENDER
     ---------------------------------------------------------- */
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
    this._renderTabela(filtrados);
  },

  _filtrar() {
    let lista = [...this._dados];

    if (this._busca) {
      const b = this._busca.toLowerCase();
      lista = lista.filter((m) =>
        (m.Nome || '').toLowerCase().includes(b) ||
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

    return lista;
  },

  /* ----------------------------------------------------------
     TABELA
     ---------------------------------------------------------- */
  _renderTabela(dados) {
    const c = document.getElementById('content');

    // Contadores
    const total = this._dados.length;
    const ativos = this._dados.filter((m) => m.Situação === 'Ativo').length;
    const membros = this._dados.filter((m) => m.Categoria === 'Membro').length;

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
          <i class="fas fa-id-card" style="color:#7c3aed;"></i>
          <div>
            <span class="membros-stat-value">${membros}</span>
            <span class="membros-stat-label">Membros</span>
          </div>
        </div>
      </div>

      <div class="membros-toolbar">
        <div class="membros-busca">
          <i class="fas fa-search"></i>
          <input type="text" id="membros-busca-input" placeholder="Buscar por nome, telefone ou CPF..." value="${UI.escapar(this._busca)}" oninput="Membros._buscar(this.value)">
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
          <button class="btn btn-success" onclick="Membros.novo()">
            <i class="fas fa-plus"></i> Novo
          </button>
        </div>
      </div>

      ${dados.length === 0 ? UI.emptyState(
        'Nenhum membro encontrado',
        this._busca || this._filtroCategoria || this._filtroSituacao
          ? 'Tente ajustar os filtros.'
          : 'Cadastre o primeiro membro da igreja.',
        `<button class="btn btn-success btn-lg" onclick="Membros.novo()">
           <i class="fas fa-user-plus"></i> Cadastrar primeiro membro
         </button>`
      ) : this._renderDataCard(dados)}
    `;

    // Foca no input se já estava buscando
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
                <th>Categoria</th>
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
    const categoria = m.Categoria || '—';
    const situacao = m.Situação || '—';

    const corCat = {
      'Membro':       '#7c3aed',
      'Frequentador': '#0891b2',
      'Visitante':    '#f59e0b'
    }[categoria] || '#64748b';

    const corSit = situacao === 'Ativo' ? '#059669' : '#dc2626';

    const botaoTalento = m.Talento
      ? `<button class="btn btn-purple btn-sm" onclick="Membros.enviarParaTalentos(${m.sheetRowIndex})" title="Enviar para Talentos">
           <i class="fas fa-star"></i>
         </button>`
      : '';

    return `
      <tr>
        <td><strong>${UI.escapar(m.Nome || '—')}</strong></td>
        <td>${UI.telefone(m.Telefone)}</td>
        <td><span class="membros-badge" style="background:${corCat}22;color:${corCat};">${categoria}</span></td>
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

  /* ----------------------------------------------------------
     BUSCA E FILTROS
     ---------------------------------------------------------- */
  _buscar(valor) {
    this._busca = valor;
    this._renderTudo();
  },

  _filtrarCategoria(valor) {
    this._filtroCategoria = valor;
    this._renderTudo();
  },

  _filtrarSituacao(valor) {
    this._filtroSituacao = valor;
    this._renderTudo();
  },

  ordenarAZ() {
    this._dados.sort((a, b) => {
      const va = (a.Nome || '').toString().toLowerCase();
      const vb = (b.Nome || '').toString().toLowerCase();
      return va.localeCompare(vb, 'pt-BR', { sensitivity: 'base' });
    });
    this._renderTudo();
    UI.toast('Ordenado A-Z', 'info');
  },

  /* ----------------------------------------------------------
     VER DETALHES
     ---------------------------------------------------------- */
  ver(id) {
    const m = this._dados.find((x) => x.sheetRowIndex == id);
    if (!m) return;

    const campos = CONFIG.CAMPOS.Membros;
    const faixa = UI.calcularFaixaEtaria(m.Nascimento);

    // Agrupa informações
    const secoes = {
      'Dados Pessoais': ['Nome', 'Nascimento', 'CPF', 'RG', 'Estado Civil', 'Nome do Cônjuge', 'Parentesco', 'Profissão'],
      'Contato': ['Telefone', 'Email', 'Endereço', 'Bairro', 'Cidade', 'Estado', 'CEP'],
      'Igreja': ['Já foi batizado?', 'Data de Batismo', 'Situação', 'Categoria', 'Função', 'Talento', 'Data de Membro'],
      'Outros': ['Observações']
    };

    let html = '';

    // Faixa etária no topo
    if (faixa) {
      const idade = UI.calcularIdade(m.Nascimento);
      html += `
        <div class="membros-detalhe-faixa" style="background:${faixa.cor}15;border-left:4px solid ${faixa.cor};">
          <i class="fas ${faixa.icon}" style="color:${faixa.cor};"></i>
          <div>
            <strong style="color:${faixa.cor};">${faixa.nome}</strong>
            <span style="color:#64748b;font-size:0.85rem;margin-left:0.5rem;">${idade} anos</span>
          </div>
        </div>
      `;
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

        // Pula se vazio
        if (!valor || valor === '—') return '';

        return `
          <div class="membros-detalhe-campo">
            <div class="membros-detalhe-label">${nomeCampo}</div>
            <div class="membros-detalhe-valor">${UI.escapar(valor)}</div>
          </div>
        `;
      }).filter(Boolean).join('');

      if (linhas) {
        html += `
          <div class="membros-detalhe-secao">
            <h3 class="membros-detalhe-secao-titulo">${secao}</h3>
            <div class="membros-detalhe-grid">${linhas}</div>
          </div>
        `;
      }
    }

    const botoes = `
      <button class="btn btn-neutral" onclick="UI.closeModal()">
        <i class="fas fa-times"></i> Fechar
      </button>
      ${m.Talento ? `<button class="btn btn-purple" onclick="UI.closeModal(); Membros.enviarParaTalentos(${m.sheetRowIndex})">
        <i class="fas fa-star"></i> → Talentos
      </button>` : ''}
      <button class="btn btn-warning" onclick="UI.closeModal(); Membros.editar(${m.sheetRowIndex})">
        <i class="fas fa-edit"></i> Editar
      </button>
    `;

    UI.openModal(`👤 ${UI.escapar(m.Nome || 'Membro')}`, html, botoes);
  },

  /* ----------------------------------------------------------
     FORMULÁRIO
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

    // Agrupa campos por seção (visual)
    const secoes = {
      'Dados Pessoais': ['Nome', 'Nascimento', 'CPF', 'RG', 'Estado Civil', 'Nome do Cônjuge', 'Parentesco', 'Profissão'],
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

        if (campo.tipo === 'date' && valor) {
          valor = UI.dataInput(valor);
        }

        const labelClass = campo.obrigatorio ? 'form-label form-label-required' : 'form-label';
        const fullClass = campo.tipo === 'textarea' ? 'form-grid-full' : '';

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
      }).join('');

      html += `
        <div class="form-secao">
          <h3 class="form-secao-titulo">${tituloSecao}</h3>
          <div class="form-grid">${camposHTML}</div>
        </div>
      `;
    }

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

    const form = document.getElementById('modal-body');
    if (form) {
      const inputId = document.createElement('input');
      inputId.type = 'hidden';
      inputId.id = 'membro-id';
      inputId.value = membro ? membro.sheetRowIndex : '';
      form.appendChild(inputId);
    }
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
     ENVIAR PARA TALENTOS
     ---------------------------------------------------------- */
  async enviarParaTalentos(id) {
    const m = this._dados.find((x) => x.sheetRowIndex == id);
    if (!m) return;

    const ok = await UI.confirmar(
      `Enviar "${m.Nome}" (talento: ${m.Talento || 'não especificado'}) para o Banco de Talentos?`,
      'Enviar para Talentos'
    );
    if (!ok) return;

    const dados = {
      Nome:     m.Nome || '',
      Talento:  m.Talento || m.Função || '',
      Telefone: m.Telefone || '',
      Email:    m.Email || ''
    };

    try {
      await API.salvar(CONFIG.TABELAS.TALENTOS, dados, null);
      UI.toast(`⭐ ${m.Nome} enviado!`, 'success');
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  },

  /* ----------------------------------------------------------
     REMOVER
     ---------------------------------------------------------- */
  async remover(id) {
    const m = this._dados.find((x) => x.sheetRowIndex == id);
    if (!m) return;

    const ok = await UI.confirmar(`Remover "${m.Nome}"?`, 'Remover membro');
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

console.log('%c[Membros] Módulo carregado (v2.6)', 'color:#64748b;font-size:11px;');
