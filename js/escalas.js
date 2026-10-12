/* ============================================================
   PIBENS ADM — Módulo Escalas de Culto
   ============================================================
   Funcionalidades:
   - Lista de escalas (futuras primeiro)
   - Filtro por período
   - Nova escala com 8 funções
   - Sugestão de membros (busca no Banco de Talentos)
   - Alerta de funções vazias
   - Botão "Copiar escala" (pra WhatsApp)
   - Ver / Editar / Remover
   ============================================================ */

const Escalas = {

  _dados: [],
  _membros: [],
  _talentos: [],
  _filtro: 'proximas',

  /* ==========================================================
     RENDER PRINCIPAL
     ========================================================== */
  async render() {
    const c = document.getElementById('content');
    if (!c) return;

    c.innerHTML = UI.loading('Carregando escalas...');

    try {
      const [escalas, membros, talentos] = await Promise.all([
        API.listar(CONFIG.TABELAS.ESCALAS),
        API.listar(CONFIG.TABELAS.MEMBROS),
        API.listar(CONFIG.TABELAS.TALENTOS)
      ]);
      this._dados = escalas || [];
      this._membros = membros || [];
      this._talentos = talentos || [];
      this._renderTudo();
    } catch (e) {
      c.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon" style="color:#dc2626;"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="empty-state-title">Erro ao carregar</div>
          <div class="empty-state-text">${UI.escapar(e.message)}</div>
          <button class="btn btn-primary" onclick="Escalas.render()">
            <i class="fas fa-sync"></i> Tentar de novo
          </button>
        </div>
      `;
    }
  },

  _renderTudo() {
    const c = document.getElementById('content');
    if (!c) return;

    const filtrados = this._filtrarPorPeriodo();

    c.innerHTML = `
      <div class="fin-periodo">
        <label>Período:</label>
        <select class="form-select fin-periodo-select" onchange="Escalas.trocarFiltro(this.value)">
          <option value="proximas"     ${this._filtro === 'proximas'     ? 'selected' : ''}>Próximas escalas</option>
          <option value="mes_atual"    ${this._filtro === 'mes_atual'    ? 'selected' : ''}>Mês atual</option>
          <option value="mes_passado"  ${this._filtro === 'mes_passado'  ? 'selected' : ''}>Mês passado</option>
          <option value="ano"          ${this._filtro === 'ano'          ? 'selected' : ''}>Ano todo</option>
          <option value="todas"        ${this._filtro === 'todas'        ? 'selected' : ''}>Todas</option>
        </select>
      </div>

      ${this._renderAlerta()}

      ${this._renderLista(filtrados)}
    `;
  },

  trocarFiltro(valor) {
    this._filtro = valor;
    this._renderTudo();
  },

  /* ==========================================================
     FILTRO
     ========================================================== */
  _dataISO(v) {
    if (!v) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) {
      const p = v.split('/');
      return `${p[2]}-${p[1]}-${p[0]}`;
    }
    return '';
  },

  _filtrarPorPeriodo() {
    const hoje = new Date();
    const hojeISO = hoje.toISOString().slice(0, 10);
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1;

    return this._dados.filter((d) => {
      const iso = this._dataISO(d.Data);
      if (!iso) return false;
      const ano = parseInt(iso.substring(0, 4), 10);
      const mes = parseInt(iso.substring(5, 7), 10);

      switch (this._filtro) {
        case 'proximas':
          return iso >= hojeISO;
        case 'mes_atual':
          return ano === anoAtual && mes === mesAtual;
        case 'mes_passado':
          const mAnt = mesAtual === 1 ? 12 : mesAtual - 1;
          const aAnt = mesAtual === 1 ? anoAtual - 1 : anoAtual;
          return ano === aAnt && mes === mAnt;
        case 'ano':
          return ano === anoAtual;
        case 'todas':
        default:
          return true;
      }
    });
  },

  /* ==========================================================
     ALERTA DE FUNÇÕES VAZIAS
     ========================================================== */
  _renderAlerta() {
    if (!this._dados || this._dados.length === 0) return '';

    const hojeISO = new Date().toISOString().slice(0, 10);
    const proximas = this._dados.filter((d) => this._dataISO(d.Data) >= hojeISO);

    if (proximas.length === 0) return '';

    const vagas = [];
    proximas.forEach((e) => {
      const faltando = [];
      CONFIG.ESCALAS.FUNCOES.forEach((f) => {
        if (!e[f.campo] || !e[f.campo].trim()) {
          faltando.push(f.label);
        }
      });
      if (faltando.length > 0) {
        vagas.push({
          data: UI.dataBR(e.Data),
          tipo: e.Tipo,
          faltando
        });
      }
    });

    if (vagas.length === 0) {
      return `
        <div class="pres-checkin-info" style="background:#d1fae5;color:#065f46;margin-bottom:1.5rem;">
          <i class="fas fa-check-circle mr-2"></i>
          <strong>Escalas completas!</strong> Todas as funções das próximas escalas estão preenchidas. 🎉
        </div>
      `;
    }

    const detalhes = vagas.map((v) => `
      <div class="esc-alerta-item">
        <strong>${v.data}</strong> — ${UI.escapar(v.tipo)}
        <div class="esc-alerta-faltando">
          ${v.faltando.map((f) => `<span class="esc-alerta-chip">${f}</span>`).join('')}
        </div>
      </div>
    `).join('');

    return `
      <div class="esc-alerta">
        <div class="esc-alerta-header">
          <i class="fas fa-exclamation-triangle"></i>
          <strong>${vagas.length} escala(s) com funções em aberto</strong>
        </div>
        <div class="esc-alerta-lista">${detalhes}</div>
      </div>
    `;
  },

  /* ==========================================================
     LISTA DE ESCALAS
     ========================================================== */
  _renderLista(dados) {
    if (!dados || dados.length === 0) {
      return UI.emptyState(
        'Nenhuma escala no período',
        'Crie uma nova escala para organizar o culto.',
        `<button class="btn btn-success btn-lg" onclick="Escalas.novo()">
           <i class="fas fa-plus"></i> Nova escala
         </button>`
      );
    }

    const ordenados = [...dados].sort((a, b) => {
      const da = this._dataISO(a.Data);
      const db = this._dataISO(b.Data);
      // Futuras primeiro (mais próxima primeiro), depois passadas (mais recente primeiro)
      const hojeISO = new Date().toISOString().slice(0, 10);
      const aFuturo = da >= hojeISO;
      const bFuturo = db >= hojeISO;
      if (aFuturo && !bFuturo) return -1;
      if (!aFuturo && bFuturo) return 1;
      if (aFuturo) return da.localeCompare(db);
      return db.localeCompare(da);
    });

    const hojeISO = new Date().toISOString().slice(0, 10);

    const cards = ordenados.map((e) => {
      const iso = this._dataISO(e.Data);
      const ehFuturo = iso >= hojeISO;
      const corTipo = CONFIG.PRESENCA.CORES_TIPO[e.Tipo] || '#64748b';

      const funcoesHTML = CONFIG.ESCALAS.FUNCOES.map((f) => {
        const valor = (e[f.campo] || '').trim();
        const vazio = !valor;
        return `
          <div class="esc-funcao ${vazio ? 'esc-funcao-vazia' : ''}">
            <span class="esc-funcao-label" style="color:${f.cor};">${f.label}</span>
            <span class="esc-funcao-valor">${vazio ? '<em>vaga</em>' : UI.escapar(valor)}</span>
          </div>
        `;
      }).join('');

      const vagas = CONFIG.ESCALAS.FUNCOES.filter((f) => !e[f.campo] || !e[f.campo].trim()).length;

      return `
        <div class="esc-card ${ehFuturo ? '' : 'esc-card-passado'}">
          <div class="esc-card-header">
            <div>
              <div class="esc-card-data">
                <i class="fas fa-calendar-day"></i>
                ${UI.dataBR(e.Data)} ${e.Horario ? '· ' + UI.escapar(e.Horario) : ''}
              </div>
              <div class="esc-card-tipo" style="background:${corTipo}22;color:${corTipo};">
                ${UI.escapar(e.Tipo || '—')}
              </div>
            </div>
            <div class="esc-card-acoes">
              ${vagas > 0 ? `<span class="esc-vagas-badge">${vagas} vaga(s)</span>` : ''}
              <button class="btn btn-primary btn-sm" onclick="Escalas.copiar(${e.sheetRowIndex})" title="Copiar escala">
                <i class="fas fa-copy"></i> Copiar
              </button>
              <button class="btn btn-warning btn-sm" onclick="Escalas.editar(${e.sheetRowIndex})" title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-danger btn-sm" onclick="Escalas.remover(${e.sheetRowIndex})" title="Remover">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>

          <div class="esc-card-funcoes">
            ${funcoesHTML}
          </div>

          ${e.Observacoes ? `
            <div class="esc-card-obs">
              <i class="fas fa-sticky-note mr-2"></i>${UI.escapar(e.Observacoes)}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    return `
      <div class="esc-lista-header">
        <h2><i class="fas fa-list-check mr-2"></i>Escalas <span class="esc-count">(${dados.length})</span></h2>
        <button class="btn btn-success" onclick="Escalas.novo()">
          <i class="fas fa-plus"></i> Nova escala
        </button>
      </div>
      <div class="esc-lista">${cards}</div>
    `;
  },

  /* ==========================================================
     NOVA / EDITAR
     ========================================================== */
  novo() {
    this._abrirForm(null);
  },

  editar(id) {
    const e = this._dados.find((x) => x.sheetRowIndex == id);
    if (e) this._abrirForm(e);
  },

  _abrirForm(escala) {
    const ehEdicao = !!escala;
    const campos = CONFIG.CAMPOS.Escalas;

    const html = `<div class="form-grid">${
      campos.map((campo) => {
        let valor = escala ? (escala[campo.nome] || '') : '';

        if (campo.tipo === 'date' && valor) {
          valor = UI.dataInput(valor);
        }

        const labelClass = campo.obrigatorio ? 'form-label form-label-required' : 'form-label';
        const fullClass = (campo.tipo === 'textarea') ? 'form-grid-full' : '';
        const isFuncao = CONFIG.ESCALAS.FUNCOES.some((f) => f.campo === campo.nome);
        const ehTexto = campo.tipo === 'text' && isFuncao;

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
        } else if (ehTexto) {
          input = `<div class="esc-input-grupo">
                     <input class="form-input" type="text" name="${campo.nome}" value="${UI.escapar(valor)}" placeholder="Nome(s)">
                     <button type="button" class="esc-btn-sugerir" onclick="Escalas.sugerir('${campo.nome}')" title="Sugerir membro">
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
      <button class="btn btn-success" onclick="Escalas._salvar()">
        <i class="fas fa-save"></i> ${ehEdicao ? 'Salvar alterações' : 'Cadastrar'}
      </button>
    `;

    UI.openModal(
      ehEdicao ? `✏️ Editar escala` : '📋 Nova escala',
      html,
      botoes
    );

    const form = document.getElementById('modal-body');
    if (form) {
      const inputId = document.createElement('input');
      inputId.type = 'hidden';
      inputId.id = 'esc-id';
      inputId.value = escala ? escala.sheetRowIndex : '';
      form.appendChild(inputId);
    }
  },

  /* ==========================================================
     SUGERIR MEMBRO (dropdown com busca)
     ========================================================== */
  sugerir(campoNome) {
    // Lista todos os membros + talentos
    const opcoes = [];

    this._membros.forEach((m) => {
      const nome = m.Nome || m.nome;
      if (nome) opcoes.push({ nome, tipo: 'Membro', talento: m.Talento || '' });
    });

    this._talentos.forEach((t) => {
      const nome = t.Nome || t.nome;
      if (nome) opcoes.push({ nome, tipo: 'Talento', talento: t.Talento || '' });
    });

    // Remove duplicados
    const unicos = [];
    const vistos = new Set();
    opcoes.forEach((o) => {
      const key = o.nome.toLowerCase();
      if (!vistos.has(key)) {
        vistos.add(key);
        unicos.push(o);
      }
    });

    unicos.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));

    if (unicos.length === 0) {
      UI.toast('Nenhum membro cadastrado.', 'warning');
      return;
    }

    const html = `
      <div class="form-group" style="margin-bottom:1rem;">
        <input type="text" id="esc-busca-sugestao" class="form-input" placeholder="🔍 Buscar por nome..." oninput="Escalas._filtrarSugestoes(this.value)">
      </div>
      <div id="esc-sugestoes-lista" class="esc-sugestoes-lista">
        ${unicos.map((o) => `
          <div class="esc-sugestao-item" data-nome="${UI.escapar(o.nome).toLowerCase()}" onclick="Escalas._escolherSugestao('${campoNome}', '${UI.escapar(o.nome).replace(/'/g, "\\'")}')">
            <div>
              <strong>${UI.escapar(o.nome)}</strong>
              ${o.talento ? `<span class="esc-sugestao-talento">${UI.escapar(o.talento)}</span>` : ''}
            </div>
            <span class="esc-sugestao-tipo">${o.tipo}</span>
          </div>
        `).join('')}
      </div>
    `;

    UI.openModal('👥 Sugerir membro', html, `
      <button class="btn btn-neutral" onclick="UI.closeModal()">
        <i class="fas fa-times"></i> Fechar
      </button>
    `);

    setTimeout(() => {
      const i = document.getElementById('esc-busca-sugestao');
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

  _escolherSugestao(campoNome, nomeEscolhido) {
    const form = document.getElementById('modal-body');
    if (!form) return;

    // Acha o input do campo
    let input = form.querySelector(`[name="${campoNome}"]`);

    // Se não achou (porque o modal de sugestão substituiu o conteúdo), procura pelo modal pai
    if (!input) {
      // Volta pro form original
      const escalaAtual = this._escalaEmEdicao;
      UI.closeModal();
      // Reabre o form
      setTimeout(() => {
        if (escalaAtual) this._abrirForm(escalaAtual);
        else this._abrirForm(null);
        setTimeout(() => {
          const i = document.querySelector(`[name="${campoNome}"]`);
          if (i) {
            const atual = i.value.trim();
            i.value = atual ? atual + ', ' + nomeEscolhido : nomeEscolhido;
            i.focus();
          }
        }, 150);
      }, 100);
      return;
    }

    const atual = input.value.trim();
    input.value = atual ? atual + ', ' + nomeEscolhido : nomeEscolhido;
    input.focus();
    UI.closeModal();
  },

  /* ==========================================================
     SALVAR
     ========================================================== */
  async _salvar() {
    const form = document.getElementById('modal-body');
    if (!form) return;

    const id = form.querySelector('#esc-id')?.value || null;

    const dados = {};
    CONFIG.CAMPOS.Escalas.forEach((campo) => {
      const input = form.querySelector(`[name="${campo.nome}"]`);
      dados[campo.nome] = input ? input.value.trim() : '';
    });

    for (const campo of CONFIG.CAMPOS.Escalas) {
      if (campo.obrigatorio && !dados[campo.nome]) {
        UI.toast(`Preencha o campo obrigatório: ${campo.nome}`, 'error');
        return;
      }
    }

    try {
      const r = await API.salvar(CONFIG.TABELAS.ESCALAS, dados, id ? parseInt(id) : null);
      UI.toast(r.message || CONFIG.MSG.SALVO_SUCESSO, 'success');
      UI.closeModal();
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  },

  /* ==========================================================
     COPIAR ESCALA
     ========================================================== */
  async copiar(id) {
    const e = this._dados.find((x) => x.sheetRowIndex == id);
    if (!e) return;

    const linhas = [];
    linhas.push('📋 *ESCALA — ' + (e.Tipo || '') + '*');
    linhas.push('🗓️ ' + UI.dataBR(e.Data) + (e.Horario ? ' às ' + e.Horario : ''));
    linhas.push('');

    CONFIG.ESCALAS.FUNCOES.forEach((f) => {
      const valor = (e[f.campo] || '').trim();
      linhas.push(f.label + ': ' + (valor || '_vaga_'));
    });

    if (e.Observacoes) {
      linhas.push('');
      linhas.push('📝 ' + e.Observacoes);
    }

    linhas.push('');
    linhas.push('_PIBENS ADM_');

    const texto = linhas.join('\n');

    try {
      await navigator.clipboard.writeText(texto);
      UI.toast('✅ Escala copiada! Cole no WhatsApp.', 'success');
    } catch (err) {
      // Fallback: abre um modal com o texto pra copiar manualmente
      const html = `
        <p style="margin-bottom:1rem;color:#475569;">Copie o texto abaixo e cole no WhatsApp:</p>
        <textarea class="form-textarea" rows="12" style="font-family:monospace;font-size:0.85rem;">${UI.escapar(texto)}</textarea>
      `;
      UI.openModal('📋 Copiar escala', html, `
        <button class="btn btn-neutral" onclick="UI.closeModal()">Fechar</button>
      `);
      setTimeout(() => {
        const t = document.querySelector('.modal-body textarea');
        if (t) { t.select(); document.execCommand('copy'); }
      }, 200);
    }
  },

  /* ==========================================================
     REMOVER
     ========================================================== */
  async remover(id) {
    const e = this._dados.find((x) => x.sheetRowIndex == id);
    if (!e) return;

    const ok = await UI.confirmar(
      `Remover escala de ${UI.dataBR(e.Data)} (${e.Tipo})?`,
      'Remover escala'
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

console.log('%c[Escalas] Módulo carregado', 'color:#64748b;font-size:11px;');
