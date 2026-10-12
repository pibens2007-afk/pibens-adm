/* ============================================================
   PIBENS ADM — Módulo Financeiro
   ============================================================
   Funcionalidades:
   - Cards de resumo (entradas, saídas, saldo, lançamentos)
   - Filtro por período (mês atual, mês passado, 3 meses, ano)
   - Tabela com valores em R$ e cores
   - Formulário completo (8 campos)
   - Relatório por categoria com barras
   ============================================================ */

const Financeiro = {

  _dados: [],
  _filtro: 'mes_atual', // mes_atual | mes_passado | ultimos_3 | ano

  /* ----------------------------------------------------------
     Render principal
     ---------------------------------------------------------- */
  async render() {
    const c = document.getElementById('content');
    if (!c) return;

    c.innerHTML = UI.loading('Carregando lançamentos...');

    try {
      const dados = await API.listarFinanceiro();
      this._dados = (dados || []).map((d) => {
        d._valorNum = this._parseValor(d.Valor);
        return d;
      });
      this._dados.sort((a, b) => (b.Data || '').localeCompare(a.Data || ''));
      this._renderTudo();
    } catch (e) {
      c.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon" style="color:#dc2626;"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="empty-state-title">Erro ao carregar</div>
          <div class="empty-state-text">${UI.escapar(e.message)}</div>
          <button class="btn btn-primary" onclick="Financeiro.render()">
            <i class="fas fa-sync"></i> Tentar de novo
          </button>
        </div>
      `;
    }
  },

  /* ----------------------------------------------------------
     Helpers
     ---------------------------------------------------------- */
  _parseValor(v) {
    if (v === null || v === undefined || v === '') return 0;
    const n = parseFloat(String(v).replace(/\./g, '').replace(',', '.'));
    return isNaN(n) ? 0 : n;
  },

  _formatarMoeda(v) {
    const n = this._parseValor(v);
    return 'R$ ' + n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  },

  _mesAnoDe(dataISO) {
    if (!dataISO) return '';
    if (/^\d{4}-\d{2}/.test(dataISO)) return dataISO.substring(0, 7);
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataISO)) {
      const p = dataISO.split('/');
      return `${p[2]}-${p[1]}`;
    }
    return '';
  },

  _filtrarPorPeriodo() {
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1;

    return this._dados.filter((d) => {
      const mesAno = this._mesAnoDe(d.Data);
      if (!mesAno) return false;

      const [ano, mes] = mesAno.split('-').map(Number);

      switch (this._filtro) {
        case 'mes_atual':
          return ano === anoAtual && mes === mesAtual;

        case 'mes_passado':
          const mAnt = mesAtual === 1 ? 12 : mesAtual - 1;
          const aAnt = mesAtual === 1 ? anoAtual - 1 : anoAtual;
          return ano === aAnt && mes === mAnt;

        case 'ultimos_3':
          for (let i = 0; i < 3; i++) {
            let m = mesAtual - i;
            let a = anoAtual;
            if (m < 1) { m += 12; a -= 1; }
            if (ano === a && mes === m) return true;
          }
          return false;

        case 'ano':
          return ano === anoAtual;

        default:
          return true;
      }
    });
  },

  /* ----------------------------------------------------------
     Render de tudo
     ---------------------------------------------------------- */
  _renderTudo() {
    const c = document.getElementById('content');
    if (!c) return;

    const filtrados = this._filtrarPorPeriodo();
    const stats = this._calcularStats(filtrados);

    c.innerHTML = `
      <div class="fin-periodo">
        <label>Período:</label>
        <select class="form-select fin-periodo-select" onchange="Financeiro.trocarFiltro(this.value)">
          <option value="mes_atual"   ${this._filtro === 'mes_atual'   ? 'selected' : ''}>Mês atual</option>
          <option value="mes_passado" ${this._filtro === 'mes_passado' ? 'selected' : ''}>Mês passado</option>
          <option value="ultimos_3"   ${this._filtro === 'ultimos_3'   ? 'selected' : ''}>Últimos 3 meses</option>
          <option value="ano"         ${this._filtro === 'ano'         ? 'selected' : ''}>Ano todo</option>
        </select>
      </div>

      <div class="fin-cards">
        ${this._cardResumo('entrada',  'fa-arrow-down',  stats.entradas,   'Entradas',   '#10b981')}
        ${this._cardResumo('saida',    'fa-arrow-up',    stats.saidas,     'Saídas',     '#dc2626')}
        ${this._cardResumo('saldo',    'fa-wallet',      stats.saldo,      'Saldo',      stats.saldo >= 0 ? '#2563eb' : '#dc2626')}
        ${this._cardResumo('lanc',     'fa-list',        filtrados.length, 'Lançamentos', '#7c3aed')}
      </div>

      ${this._renderRelatorio(filtrados)}

      ${this._renderTabela(filtrados)}
    `;
  },

  /* ----------------------------------------------------------
     Cards de resumo
     ---------------------------------------------------------- */
  _cardResumo(id, icone, valor, label, cor) {
    const isMoney = (id !== 'lanc');
    const exibir = isMoney ? this._formatarMoeda(valor) : String(valor);

    return `
      <div class="fin-card" style="border-left-color:${cor};">
        <div class="fin-card-icon" style="background:${cor}22;color:${cor};">
          <i class="fas ${icone}"></i>
        </div>
        <div class="fin-card-info">
          <span class="fin-card-value" style="color:${cor};">${exibir}</span>
          <span class="fin-card-label">${label}</span>
        </div>
      </div>
    `;
  },

  /* ----------------------------------------------------------
     Relatório por categoria
     ---------------------------------------------------------- */
  _renderRelatorio(dados) {
    if (!dados || dados.length === 0) return '';

    const porCategoria = {};
    let totalGeral = 0;

    dados.forEach((d) => {
      const cat = d.Categoria || 'Outros';
      const v = Math.abs(d._valorNum);
      if (!porCategoria[cat]) {
        porCategoria[cat] = { entrada: 0, saida: 0, total: 0 };
      }
      if (d.Tipo === 'Entrada') {
        porCategoria[cat].entrada += v;
      } else {
        porCategoria[cat].saida += v;
      }
      porCategoria[cat].total += v;
      totalGeral += v;
    });

    const categorias = Object.entries(porCategoria)
      .sort((a, b) => b[1].total - a[1].total);

    const linhas = categorias.map(([cat, vals]) => {
      const pct = totalGeral > 0 ? (vals.total / totalGeral) * 100 : 0;
      const cor = CONFIG.FINANCEIRO.CORES_CATEGORIA[cat] || '#64748b';

      let detalhe = '';
      if (vals.entrada > 0 && vals.saida > 0) {
        detalhe = `↓ ${this._formatarMoeda(vals.entrada)} · ↑ ${this._formatarMoeda(vals.saida)}`;
      } else if (vals.entrada > 0) {
        detalhe = `↓ ${this._formatarMoeda(vals.entrada)}`;
      } else {
        detalhe = `↑ ${this._formatarMoeda(vals.saida)}`;
      }

      return `
        <div class="fin-cat-linha">
          <div class="fin-cat-header">
            <span class="fin-cat-nome" style="color:${cor};">
              <span class="fin-cat-dot" style="background:${cor};"></span>
              ${UI.escapar(cat)}
            </span>
            <span class="fin-cat-valor">${detalhe}</span>
          </div>
          <div class="fin-cat-barra">
            <div class="fin-cat-preenchimento" style="width:${pct}%;background:${cor};"></div>
          </div>
          <span class="fin-cat-pct">${pct.toFixed(1)}% (${this._formatarMoeda(vals.total)})</span>
        </div>
      `;
    }).join('');

    return `
      <div class="fin-relatorio">
        <div class="fin-relatorio-header">
          <h3><i class="fas fa-chart-pie"></i> Por categoria</h3>
          <span class="fin-relatorio-total">Total: ${this._formatarMoeda(totalGeral)}</span>
        </div>
        <div class="fin-cat-lista">${linhas}</div>
      </div>
    `;
  },

  /* ----------------------------------------------------------
     Tabela de lançamentos
     ---------------------------------------------------------- */
  _renderTabela(dados) {
    if (!dados || dados.length === 0) {
      return UI.emptyState(
        'Nenhum lançamento no período',
        'Cadastre entradas (dízimos, ofertas) e saídas (contas, salários).',
        `<button class="btn btn-success btn-lg" onclick="Financeiro.novo()">
           <i class="fas fa-plus"></i> Novo lançamento
         </button>`
      );
    }

    const linhas = dados.map((d) => {
      const isEntrada = d.Tipo === 'Entrada';
      const classe = isEntrada ? 'fin-tipo-entrada' : 'fin-tipo-saida';
      const sinal  = isEntrada ? '+' : '-';

      return `
        <tr>
          <td>${UI.dataBR(d.Data)}</td>
          <td><span class="fin-tipo-badge ${classe}">${isEntrada ? '↓' : '↑'} ${UI.escapar(d.Tipo)}</span></td>
          <td class="${classe}-valor">${sinal} ${this._formatarMoeda(d._valorNum)}</td>
          <td>${UI.escapar(d.Categoria || '—')}</td>
          <td>${UI.escapar(d.Descricao || '—')}</td>
          <td class="col-actions">
            <button class="btn btn-primary btn-sm" onclick="Financeiro.ver(${d.sheetRowIndex})" title="Ver">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-warning btn-sm" onclick="Financeiro.editar(${d.sheetRowIndex})" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="Financeiro.remover(${d.sheetRowIndex})" title="Remover">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="data-card" style="margin-top:1.5rem;">
        <div class="data-header">
          <div class="data-header-top">
            <div>
              <h2 class="data-title"><i class="fas fa-list mr-2"></i>Lançamentos</h2>
              <p class="data-subtitle">${dados.length} no período</p>
            </div>
            <div class="data-actions">
              <button class="btn btn-success btn-sm" onclick="Financeiro.novo()">
                <i class="fas fa-plus"></i> Novo
              </button>
            </div>
          </div>
        </div>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Categoria</th>
                <th>Descrição</th>
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
     Filtro
     ---------------------------------------------------------- */
  trocarFiltro(valor) {
    this._filtro = valor;
    this._renderTudo();
  },

  /* ----------------------------------------------------------
     Ver detalhes
     ---------------------------------------------------------- */
  ver(id) {
    const d = this._dados.find((x) => x.sheetRowIndex == id);
    if (!d) return;

    const campos = CONFIG.CAMPOS.Financeiro;
    const html = campos.map((campo) => {
      let valor = d[campo.nome];

      if (campo.tipo === 'date') valor = UI.dataBR(valor);
      else if (campo.nome === 'Valor') valor = this._formatarMoeda(valor);

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
      <button class="btn btn-warning" onclick="UI.closeModal(); Financeiro.editar(${d.sheetRowIndex})">
        <i class="fas fa-edit"></i> Editar
      </button>
    `;

    const icone = d.Tipo === 'Entrada' ? '↓' : '↑';
    UI.openModal(`${icone} ${d.Tipo} — ${this._formatarMoeda(d.Valor)}`, html, botoes);
  },

  /* ----------------------------------------------------------
     Novo / Editar
     ---------------------------------------------------------- */
  novo() {
    this._abrirForm(null);
  },

  editar(id) {
    const d = this._dados.find((x) => x.sheetRowIndex == id);
    if (d) this._abrirForm(d);
  },

  _abrirForm(lancamento) {
    const ehEdicao = !!lancamento;
    const campos = CONFIG.CAMPOS.Financeiro;

    const html = `<div class="form-grid">${
      campos.map((campo) => {
        let valor = lancamento ? (lancamento[campo.nome] || '') : '';

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
        } else if (campo.tipo === 'number') {
          input = `<input class="form-input" type="number" step="0.01" name="${campo.nome}" value="${UI.escapar(valor)}" placeholder="0,00">`;
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
      <button class="btn btn-success" onclick="Financeiro._salvar()">
        <i class="fas fa-save"></i> ${ehEdicao ? 'Salvar alterações' : 'Cadastrar'}
      </button>
    `;

    UI.openModal(
      ehEdicao ? `✏️ Editar lançamento` : '💰 Novo lançamento',
      html,
      botoes
    );

    const form = document.getElementById('modal-body');
    if (form) {
      const inputId = document.createElement('input');
      inputId.type = 'hidden';
      inputId.id = 'fin-id';
      inputId.value = lancamento ? lancamento.sheetRowIndex : '';
      form.appendChild(inputId);
    }
  },

  /* ----------------------------------------------------------
     Salvar
     ---------------------------------------------------------- */
  async _salvar() {
    const form = document.getElementById('modal-body');
    if (!form) return;

    const id = form.querySelector('#fin-id')?.value || null;

    const dados = {};
    CONFIG.CAMPOS.Financeiro.forEach((campo) => {
      const input = form.querySelector(`[name="${campo.nome}"]`);
      dados[campo.nome] = input ? input.value.trim() : '';
    });

    // Validação
    for (const campo of CONFIG.CAMPOS.Financeiro) {
      if (campo.obrigatorio && !dados[campo.nome]) {
        UI.toast(`Preencha o campo obrigatório: ${campo.nome}`, 'error');
        return;
      }
    }

    // Normaliza valor (aceita vírgula)
    dados.Valor = String(dados.Valor).replace(',', '.');

    try {
      const r = await API.salvarFinanceiro(dados, id ? parseInt(id) : null);
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
    const d = this._dados.find((x) => x.sheetRowIndex == id);
    if (!d) return;

    const ok = await UI.confirmar(
      `Remover ${d.Tipo} de ${this._formatarMoeda(d.Valor)} (${d.Categoria})?`,
      'Remover lançamento'
    );
    if (!ok) return;

    try {
      const r = await API.removerFinanceiro(id);
      UI.toast(r.message || CONFIG.MSG.REMOVIDO_SUCESSO, 'success');
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  },

  /* ----------------------------------------------------------
     Cálculo de estatísticas
     ---------------------------------------------------------- */
  _calcularStats(dados) {
    let entradas = 0;
    let saidas = 0;

    dados.forEach((d) => {
      const v = Math.abs(d._valorNum);
      if (d.Tipo === 'Entrada') {
        entradas += v;
      } else {
        saidas += v;
      }
    });

    return {
      entradas,
      saidas,
      saldo: entradas - saidas
    };
  }

};

console.log('%c[Financeiro] Módulo carregado', 'color:#64748b;font-size:11px;');
