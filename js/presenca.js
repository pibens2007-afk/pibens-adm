/* ============================================================
   PIBENS ADM — Módulo Presença nos Cultos
   ============================================================
   Funcionalidades:
   - Cards de resumo (cultos no período, média, total)
   - Filtro por período
   - Tabela de cultos com taxa de presença
   - Check-in completo (busca por nome + checkbox por membro)
   - Relatório de membros afastados
   - Aba de ranking de frequência
   ============================================================ */

const Presenca = {

  _dados: [],
  _membros: [],
  _filtro: 'mes_atual',
  _aba: 'cultos', // cultos | ranking | afastados
  _buscaCheckin: '',

  /* ==========================================================
     RENDER PRINCIPAL
     ========================================================== */
  async render() {
    const c = document.getElementById('content');
    if (!c) return;

    c.innerHTML = UI.loading('Carregando presenças...');

    try {
      const [presencas, membros] = await Promise.all([
        API.listar(CONFIG.TABELAS.PRESENCAS),
        API.listar(CONFIG.TABELAS.MEMBROS)
      ]);
      this._dados = presencas || [];
      this._membros = membros || [];
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
    if (!c) return;

    const filtrados = this._filtrarPorPeriodo();
    const stats = this._calcularStats(filtrados);

    c.innerHTML = `
      <div class="fin-periodo">
        <label>Período:</label>
        <select class="form-select fin-periodo-select" onchange="Presenca.trocarFiltro(this.value)">
          <option value="mes_atual"   ${this._filtro === 'mes_atual'   ? 'selected' : ''}>Mês atual</option>
          <option value="mes_passado" ${this._filtro === 'mes_passado' ? 'selected' : ''}>Mês passado</option>
          <option value="ultimos_3"   ${this._filtro === 'ultimos_3'   ? 'selected' : ''}>Últimos 3 meses</option>
          <option value="ano"         ${this._filtro === 'ano'         ? 'selected' : ''}>Ano todo</option>
        </select>
      </div>

      <div class="fin-cards">
        ${this._cardResumo('cultos', 'fa-church', stats.totalCultos, 'Cultos', '#2563eb')}
        ${this._cardResumo('media',  'fa-chart-line', stats.media.toFixed(1), 'Média por culto', '#0891b2')}
        ${this._cardResumo('total',  'fa-users', stats.totalPresentes, 'Presenças totais', '#059669')}
        ${this._cardResumo('visit',  'fa-user-plus', stats.totalVisitantes, 'Visitantes', '#f59e0b')}
      </div>

      <div class="pres-tabs">
        <button class="pres-tab ${this._aba === 'cultos' ? 'active' : ''}" onclick="Presenca.trocarAba('cultos')">
          <i class="fas fa-list"></i> Cultos
        </button>
        <button class="pres-tab ${this._aba === 'ranking' ? 'active' : ''}" onclick="Presenca.trocarAba('ranking')">
          <i class="fas fa-trophy"></i> Ranking
        </button>
        <button class="pres-tab ${this._aba === 'afastados' ? 'active' : ''}" onclick="Presenca.trocarAba('afastados')">
          <i class="fas fa-user-clock"></i> Afastados
        </button>
      </div>

      <div id="pres-conteudo">
        ${this._renderAba(filtrados)}
      </div>
    `;
  },

  _renderAba(filtrados) {
    switch (this._aba) {
      case 'ranking':   return this._renderRanking(filtrados);
      case 'afastados': return this._renderAfastados(filtrados);
      default:          return this._renderTabelaCultos(filtrados);
    }
  },

  trocarAba(aba) {
    this._aba = aba;
    this._renderTudo();
  },

  trocarFiltro(valor) {
    this._filtro = valor;
    this._renderTudo();
  },

  /* ==========================================================
     CARDS
     ========================================================== */
  _cardResumo(id, icone, valor, label, cor) {
    return `
      <div class="fin-card" style="border-left-color:${cor};">
        <div class="fin-card-icon" style="background:${cor}22;color:${cor};">
          <i class="fas ${icone}"></i>
        </div>
        <div class="fin-card-info">
          <span class="fin-card-value" style="color:${cor};">${valor}</span>
          <span class="fin-card-label">${label}</span>
        </div>
      </div>
    `;
  },

  /* ==========================================================
     FILTRO POR PERÍODO
     ========================================================== */
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

  /* ==========================================================
     ESTATÍSTICAS
     ========================================================== */
  _calcularStats(dados) {
    let totalPresentes = 0;
    let totalVisitantes = 0;

    dados.forEach((d) => {
      totalPresentes += parseInt(d.TotalPresentes) || 0;
      totalVisitantes += parseInt(d.Visitantes) || 0;
    });

    const totalCultos = dados.length;
    const media = totalCultos > 0 ? totalPresentes / totalCultos : 0;

    return {
      totalCultos,
      totalPresentes,
      totalVisitantes,
      media
    };
  },

  /* ==========================================================
     ABA 1 — TABELA DE CULTOS
     ========================================================== */
  _renderTabelaCultos(dados) {
    if (!dados || dados.length === 0) {
      return UI.emptyState(
        'Nenhum culto no período',
        'Cadastre um culto e marque a presença dos membros.',
        `<button class="btn btn-success btn-lg" onclick="Presenca.novo()">
           <i class="fas fa-plus"></i> Novo culto
         </button>`
      );
    }

    const ordenados = [...dados].sort((a, b) => (b.Data || '').localeCompare(a.Data || ''));

    const linhas = ordenados.map((d) => {
      const totalMembros = this._membros.length;
      const presentes = parseInt(d.TotalPresentes) || 0;
      const taxa = totalMembros > 0 ? Math.round((presentes / totalMembros) * 100) : 0;
      const corTaxa = taxa >= 70 ? '#059669' : taxa >= 40 ? '#f59e0b' : '#dc2626';

      const corTipo = CONFIG.PRESENCA.CORES_TIPO[d.Tipo] || '#64748b';

      return `
        <tr>
          <td>${UI.dataBR(d.Data)}</td>
          <td><span class="pres-tipo-badge" style="background:${corTipo}22;color:${corTipo};">${UI.escapar(d.Tipo || '—')}</span></td>
          <td>${UI.escapar(d.Tema || '—')}</td>
          <td>${UI.escapar(d.Pregador || '—')}</td>
          <td><strong>${presentes}</strong></td>
          <td><span style="color:${corTaxa};font-weight:800;">${taxa}%</span></td>
          <td class="col-actions">
            <button class="btn btn-success btn-sm" onclick="Presenca.checkin(${d.sheetRowIndex})" title="Editar check-in">
              <i class="fas fa-clipboard-check"></i>
            </button>
            <button class="btn btn-primary btn-sm" onclick="Presenca.ver(${d.sheetRowIndex})" title="Ver">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="Presenca.remover(${d.sheetRowIndex})" title="Remover">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="data-card">
        <div class="data-header">
          <div class="data-header-top">
            <div>
              <h2 class="data-title"><i class="fas fa-church mr-2"></i>Cultos</h2>
              <p class="data-subtitle">${dados.length} culto(s) no período</p>
            </div>
            <div class="data-actions">
              <button class="btn btn-success btn-sm" onclick="Presenca.novo()">
                <i class="fas fa-plus"></i> Novo culto
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
                <th>Tema</th>
                <th>Pregador</th>
                <th>Presentes</th>
                <th>Taxa</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>${linhas}</tbody>
          </table>
        </div>
      </div>
    `;
  },

  /* ==========================================================
     ABA 2 — RANKING DE FREQUÊNCIA
     ========================================================== */
  _renderRanking(dados) {
    if (!dados || dados.length === 0) {
      return UI.emptyState(
        'Sem dados para ranking',
        'Cadastre cultos e marque presença para gerar o ranking.',
        ''
      );
    }

    const contagem = {};
    dados.forEach((d) => {
      const lista = this._parseMembrosPresentes(d.MembrosPresentes);
      lista.forEach((nome) => {
        contagem[nome] = (contagem[nome] || 0) + 1;
      });
    });

    const ranking = Object.entries(contagem)
      .sort((a, b) => b[1] - a[1]);

    const totalCultos = dados.length;
    const linhas = ranking.map(([nome, qtd], idx) => {
      const pct = Math.round((qtd / totalCultos) * 100);
      const medalha = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;

      return `
        <tr>
          <td style="font-weight:800;font-size:1.1rem;">${medalha}</td>
          <td>${UI.escapar(nome)}</td>
          <td><strong>${qtd}</strong> / ${totalCultos}</td>
          <td>
            <div class="pres-rank-barra">
              <div class="pres-rank-preenchimento" style="width:${pct}%;"></div>
            </div>
          </td>
          <td style="color:#059669;font-weight:800;">${pct}%</td>
        </tr>
      `;
    }).join('');

    return `
      <div class="data-card">
        <div class="data-header">
          <div class="data-header-top">
            <div>
              <h2 class="data-title"><i class="fas fa-trophy mr-2"></i>Ranking de Frequência</h2>
              <p class="data-subtitle">Baseado em ${totalCultos} culto(s) no período</p>
            </div>
          </div>
        </div>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Membro</th>
                <th>Presenças</th>
                <th>Taxa</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>${linhas}</tbody>
          </table>
        </div>
      </div>
    `;
  },

  /* ==========================================================
     ABA 3 — MEMBROS AFASTADOS
     ========================================================== */
  _renderAfastados(dados) {
    if (!dados || dados.length === 0) {
      return UI.emptyState(
        'Sem dados para análise',
        'Cadastre cultos e marque presença para identificar membros afastados.',
        ''
      );
    }

    const ultimosCultos = [...dados]
      .sort((a, b) => (b.Data || '').localeCompare(a.Data || ''))
      .slice(0, CONFIG.PRESENCA.SEMANAS_AFASTADO);

    const afastados = [];
    this._membros.forEach((m) => {
      const nome = m.Nome || m.nome;
      if (!nome) return;

      const veio = ultimosCultos.some((c) => {
        const lista = this._parseMembrosPresentes(c.MembrosPresentes);
        return lista.some((n) => n.toLowerCase() === nome.toLowerCase());
      });

      if (!veio) {
        // Conta quantos cultos veio no período todo
        let totalPresencas = 0;
        dados.forEach((c) => {
          const lista = this._parseMembrosPresentes(c.MembrosPresentes);
          if (lista.some((n) => n.toLowerCase() === nome.toLowerCase())) totalPresencas++;
        });

        // Última vez que veio
        let ultimaVez = 'Nunca';
        const ordenados = [...dados].sort((a, b) => (b.Data || '').localeCompare(a.Data || ''));
        for (const c of ordenados) {
          const lista = this._parseMembrosPresentes(c.MembrosPresentes);
          if (lista.some((n) => n.toLowerCase() === nome.toLowerCase())) {
            ultimaVez = UI.dataBR(c.Data);
            break;
          }
        }

        afastados.push({
          nome,
          telefone: m.Telefone || '—',
          totalPresencas,
          ultimaVez
        });
      }
    });

    if (afastados.length === 0) {
      return UI.emptyState(
        'Nenhum membro afastado 🎉',
        `Todos os membros vieram pelo menos uma vez nos últimos ${CONFIG.PRESENCA.SEMANAS_AFASTADO} cultos.`,
        ''
      );
    }

    const linhas = afastados.map((a) => `
      <tr>
        <td><strong>${UI.escapar(a.nome)}</strong></td>
        <td>${UI.escapar(a.telefone)}</td>
        <td>${a.totalPresencas}</td>
        <td><span style="color:#dc2626;font-weight:700;">${a.ultimaVez}</span></td>
        <td class="col-actions">
          <button class="btn btn-success btn-sm" onclick="Presenca.abrirWhats('${UI.escapar(a.telefone).replace(/\D/g, '')}', '${UI.escapar(a.nome)}')" title="Enviar WhatsApp">
            <i class="fab fa-whatsapp"></i>
          </button>
        </td>
      </tr>
    `).join('');

    return `
      <div class="data-card">
        <div class="data-header" style="background:linear-gradient(135deg,#dc2626,#991b1b);">
          <div class="data-header-top">
            <div>
              <h2 class="data-title"><i class="fas fa-user-clock mr-2"></i>Membros Afastados</h2>
              <p class="data-subtitle">Sem presença nos últimos ${CONFIG.PRESENCA.SEMANAS_AFASTADO} cultos</p>
            </div>
          </div>
        </div>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Presenças no período</th>
                <th>Última vez</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>${linhas}</tbody>
          </table>
        </div>
      </div>
    `;
  },

  /* ==========================================================
     PARSER DE MEMBROS PRESENTES
     ========================================================== */
  _parseMembrosPresentes(v) {
    if (!v) return [];
    if (Array.isArray(v)) return v;
    if (typeof v === 'string') {
      try {
        const arr = JSON.parse(v);
        return Array.isArray(arr) ? arr : [v];
      } catch (e) {
        return v.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }
    return [];
  },

  /* ==========================================================
     NOVO CULTO
     ========================================================== */
  novo() {
    this._abrirForm(null);
  },

  _abrirForm(culto) {
    const ehEdicao = !!culto;
    const campos = CONFIG.CAMPOS.Presencas.filter((c) => c.nome !== 'MembrosPresentes' && c.nome !== 'TotalPresentes');

    const html = `<div class="form-grid">${
      campos.map((campo) => {
        let valor = culto ? (culto[campo.nome] || '') : '';

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
          input = `<input class="form-input" type="number" name="${campo.nome}" value="${UI.escapar(valor)}" min="0">`;
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
      <button class="btn btn-success" onclick="Presenca._salvarCulto()">
        <i class="fas fa-save"></i> ${ehEdicao ? 'Salvar alterações' : 'Cadastrar'}
      </button>
    `;

    UI.openModal(
      ehEdicao ? `✏️ Editar culto` : '⛪ Novo culto',
      html,
      botoes
    );

    const form = document.getElementById('modal-body');
    if (form) {
      const inputId = document.createElement('input');
      inputId.type = 'hidden';
      inputId.id = 'pres-id';
      inputId.value = culto ? culto.sheetRowIndex : '';
      form.appendChild(inputId);

      const inputMP = document.createElement('input');
      inputMP.type = 'hidden';
      inputMP.id = 'pres-mp';
      inputMP.value = culto ? (culto.MembrosPresentes || '') : '';
      form.appendChild(inputMP);

      const inputTP = document.createElement('input');
      inputTP.type = 'hidden';
      inputTP.id = 'pres-tp';
      inputTP.value = culto ? (culto.TotalPresentes || 0) : 0;
      form.appendChild(inputTP);
    }
  },

  async _salvarCulto() {
    const form = document.getElementById('modal-body');
    if (!form) return;

    const id = form.querySelector('#pres-id')?.value || null;
    const mp = form.querySelector('#pres-mp')?.value || '';
    const tp = form.querySelector('#pres-tp')?.value || '0';

    const dados = {};
    CONFIG.CAMPOS.Presencas.forEach((campo) => {
      if (campo.nome === 'MembrosPresentes') {
        dados[campo.nome] = mp;
      } else if (campo.nome === 'TotalPresentes') {
        dados[campo.nome] = tp;
      } else {
        const input = form.querySelector(`[name="${campo.nome}"]`);
        dados[campo.nome] = input ? input.value.trim() : '';
      }
    });

    // Validação
    for (const campo of CONFIG.CAMPOS.Presencas) {
      if (campo.obrigatorio && !dados[campo.nome]) {
        UI.toast(`Preencha o campo obrigatório: ${campo.nome}`, 'error');
        return;
      }
    }

    try {
      const r = await API.salvar(CONFIG.TABELAS.PRESENCAS, dados, id ? parseInt(id) : null);
      UI.toast(r.message || CONFIG.MSG.SALVO_SUCESSO, 'success');
      UI.closeModal();
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  },

  /* ==========================================================
     CHECK-IN
     ========================================================== */
  checkin(id) {
    const culto = this._dados.find((d) => d.sheetRowIndex == id);
    if (!culto) return;

    const presentes = this._parseMembrosPresentes(culto.MembrosPresentes);
    const presentesLower = presentes.map((n) => n.toLowerCase());

    this._buscaCheckin = '';
    this._checkinAtual = culto;
    this._checkinSelecionados = new Set(presentes);

    this._renderCheckin();
  },

  _renderCheckin() {
    const membros = [...this._membros].sort((a, b) =>
      (a.Nome || '').localeCompare(b.Nome || '', 'pt-BR', { sensitivity: 'base' })
    );

    const busca = this._buscaCheckin.toLowerCase();
    const filtrados = busca
      ? membros.filter((m) => (m.Nome || '').toLowerCase().includes(busca))
      : membros;

    const selecionados = this._checkinSelecionados;

    const listaHTML = filtrados.length === 0
      ? `<div style="text-align:center;padding:2rem;color:#94a3b8;">Nenhum membro encontrado</div>`
      : filtrados.map((m) => {
          const nome = m.Nome || m.nome || '?';
          const checked = selecionados.has(nome);
          return `
            <label class="pres-checkin-item ${checked ? 'checked' : ''}">
              <input type="checkbox" ${checked ? 'checked' : ''} onchange="Presenca._toggleMembro('${UI.escapar(nome)}', this.checked)">
              <span class="pres-checkin-nome">${UI.escapar(nome)}</span>
            </label>
          `;
        }).join('');

    const html = `
      <div class="pres-checkin-info">
        <strong>${UI.escapar(this._checkinAtual.Tipo)}</strong> em ${UI.dataBR(this._checkinAtual.Data)}
        ${this._checkinAtual.Tema ? `<br><em>${UI.escapar(this._checkinAtual.Tema)}</em>` : ''}
      </div>

      <div class="pres-checkin-topo">
        <input type="text" class="form-input" id="pres-busca" placeholder="🔍 Buscar membro por nome..."
               value="${UI.escapar(this._buscaCheckin)}" oninput="Presenca._buscar(this.value)">
        <div class="pres-checkin-acoes">
          <button class="btn btn-sm btn-neutral" onclick="Presenca._marcarTodos(true)">Marcar todos</button>
          <button class="btn btn-sm btn-neutral" onclick="Presenca._marcarTodos(false)">Limpar</button>
        </div>
      </div>

      <div class="pres-checkin-contador">
        <strong>${selecionados.size}</strong> de ${this._membros.length} membros
      </div>

      <div class="pres-checkin-lista" id="pres-checkin-lista">
        ${listaHTML}
      </div>
    `;

    const botoes = `
      <button class="btn btn-neutral" onclick="UI.closeModal()">
        <i class="fas fa-times"></i> Cancelar
      </button>
      <button class="btn btn-success" onclick="Presenca._salvarCheckin()">
        <i class="fas fa-check"></i> Salvar check-in
      </button>
    `;

    UI.openModal(`✅ Check-in — ${UI.dataBR(this._checkinAtual.Data)}`, html, botoes);
  },

  _toggleMembro(nome, marcado) {
    if (marcado) this._checkinSelecionados.add(nome);
    else this._checkinSelecionados.delete(nome);
    this._atualizarContador();
  },

  _marcarTodos(marcar) {
    if (marcar) {
      this._membros.forEach((m) => {
        const nome = m.Nome || m.nome;
        if (nome) this._checkinSelecionados.add(nome);
      });
    } else {
      this._checkinSelecionados.clear();
    }
    this._renderCheckin();
  },

  _atualizarContador() {
    const el = document.querySelector('.pres-checkin-contador');
    if (el) {
      el.innerHTML = `<strong>${this._checkinSelecionados.size}</strong> de ${this._membros.length} membros`;
    }

    // Atualiza visual do checkbox
    document.querySelectorAll('.pres-checkin-item').forEach((item) => {
      const input = item.querySelector('input');
      if (input && input.checked) item.classList.add('checked');
      else item.classList.remove('checked');
    });
  },

  _buscar(valor) {
    this._buscaCheckin = valor;
    this._renderCheckin();
    setTimeout(() => {
      const i = document.getElementById('pres-busca');
      if (i) { i.focus(); i.setSelectionRange(valor.length, valor.length); }
    }, 10);
  },

  async _salvarCheckin() {
    const presentes = Array.from(this._checkinSelecionados).sort();
    const culto = this._checkinAtual;

    const dados = {
      Data: culto.Data,
      Tipo: culto.Tipo,
      Horario: culto.Horario || '',
      Tema: culto.Tema || '',
      Pregador: culto.Pregador || '',
      TotalPresentes: presentes.length + (parseInt(culto.Visitantes) || 0),
      MembrosPresentes: JSON.stringify(presentes),
      Visitantes: culto.Visitantes || 0,
      Observacoes: culto.Observacoes || ''
    };

    try {
      const r = await API.salvar(CONFIG.TABELAS.PRESENCAS, dados, culto.sheetRowIndex);
      UI.toast('Check-in salvo! ' + presentes.length + ' membros presentes.', 'success');
      UI.closeModal();
      this.render();
    } catch (e) {
      UI.toast('Erro: ' + e.message, 'error');
    }
  },

  /* ==========================================================
     VER DETALHES
     ========================================================== */
  ver(id) {
    const d = this._dados.find((x) => x.sheetRowIndex == id);
    if (!d) return;

    const presentes = this._parseMembrosPresentes(d.MembrosPresentes);

    const html = `
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Data</label>
          <div class="pres-detalhe-valor">${UI.dataBR(d.Data)}</div>
        </div>
        <div class="form-group">
          <label class="form-label">Tipo</label>
          <div class="pres-detalhe-valor">${UI.escapar(d.Tipo || '—')}</div>
        </div>
        <div class="form-group">
          <label class="form-label">Tema</label>
          <div class="pres-detalhe-valor">${UI.escapar(d.Tema || '—')}</div>
        </div>
        <div class="form-group">
          <label class="form-label">Pregador</label>
          <div class="pres-detalhe-valor">${UI.escapar(d.Pregador || '—')}</div>
        </div>
        <div class="form-group">
          <label class="form-label">Total de Presentes</label>
          <div class="pres-detalhe-valor"><strong>${d.TotalPresentes || 0}</strong></div>
        </div>
        <div class="form-group">
          <label class="form-label">Visitantes</label>
          <div class="pres-detalhe-valor">${d.Visitantes || 0}</div>
        </div>
      </div>

      <div style="margin-top:1.5rem;">
        <label class="form-label">Membros Presentes (${presentes.length})</label>
        <div class="pres-detalhe-lista">
          ${presentes.length > 0
            ? presentes.map((n) => `<span class="pres-detalhe-chip">${UI.escapar(n)}</span>`).join('')
            : '<span style="color:#94a3b8;">Nenhum membro marcado</span>'}
        </div>
      </div>

      ${d.Observacoes ? `
        <div style="margin-top:1.5rem;">
          <label class="form-label">Observações</label>
          <div class="pres-detalhe-valor" style="white-space:pre-wrap;">${UI.escapar(d.Observacoes)}</div>
        </div>
      ` : ''}
    `;

    const botoes = `
      <button class="btn btn-neutral" onclick="UI.closeModal()">
        <i class="fas fa-times"></i> Fechar
      </button>
      <button class="btn btn-success" onclick="UI.closeModal(); Presenca.checkin(${d.sheetRowIndex})">
        <i class="fas fa-clipboard-check"></i> Check-in
      </button>
    `;

    UI.openModal(`⛪ ${UI.escapar(d.Tipo)} — ${UI.dataBR(d.Data)}`, html, botoes);
  },

  /* ==========================================================
     REMOVER
     ========================================================== */
  async remover(id) {
    const d = this._dados.find((x) => x.sheetRowIndex == id);
    if (!d) return;

    const ok = await UI.confirmar(
      `Remover culto de ${UI.dataBR(d.Data)} (${d.Tipo})?`,
      'Remover culto'
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
    const msg = encodeURIComponent(`Olá ${nome}, sentimos sua falta nos cultos! 🙏`);
    window.open(`https://wa.me/${numero}?text=${msg}`, '_blank');
  }

};

console.log('%c[Presenca] Módulo carregado', 'color:#64748b;font-size:11px;');
