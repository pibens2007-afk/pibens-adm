/* ============================================================
   PIBENS ADM — Módulo Relatórios v1.0
   ============================================================
   Funcionalidades:
   - 6 tipos de relatório (Membros, Financeiro, Presença, Escalas, Discipulado, Aniversariantes)
   - Filtro por período (mês atual, mês passado, últimos 3 meses, ano)
   - Visualização na tela
   - Envio por WhatsApp (resumo texto)
   - Salvar/Imprimir em PDF
   ============================================================ */

const Relatorios = {

  _tipoAtual: null,
  _periodo: 'mes_atual',
  _dados: {},

  /* ==========================================================
     RENDER PRINCIPAL
     ========================================================== */
  render() {
    const c = document.getElementById('content');
    if (!c) return;

    c.innerHTML = `
      <div class="rel-header">
        <div class="rel-header-info">
          <h1 class="rel-titulo">📄 Relatórios</h1>
          <p class="rel-subtitulo">Gere relatórios prontos para enviar à liderança</p>
        </div>
      </div>

      <div class="rel-grid">
        ${CONFIG.RELATORIOS.map((r) => `
          <div class="rel-card" style="border-left-color:${r.cor};" onclick="Relatorios.abrir('${r.id}')">
            <div class="rel-card-icon" style="background:${r.cor}22;color:${r.cor};">
              <i class="fas ${r.icon}"></i>
            </div>
            <div class="rel-card-info">
              <span class="rel-card-nome">${r.nome}</span>
              <span class="rel-card-desc">${r.desc}</span>
            </div>
            <i class="fas fa-arrow-right rel-card-arrow"></i>
          </div>
        `).join('')}
      </div>
    `;
  },

  /* ==========================================================
     ABRIR RELATÓRIO
     ========================================================== */
  async abrir(tipo) {
    this._tipoAtual = tipo;
    this._periodo = 'mes_atual';

    const c = document.getElementById('content');
    c.innerHTML = UI.loading('Gerando relatório...');

    try {
      await this._carregarDados(tipo);
      this._renderRelatorio();
    } catch (e) {
      c.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon" style="color:#dc2626;"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="empty-state-title">Erro ao gerar relatório</div>
          <div class="empty-state-text">${UI.escapar(e.message)}</div>
          <button class="btn btn-primary" onclick="Relatorios.render()">
            <i class="fas fa-arrow-left"></i> Voltar
          </button>
        </div>
      `;
    }
  },

  async _carregarDados(tipo) {
    this._dados = {};

    switch (tipo) {
      case 'membros':
        this._dados.membros = await API.listar(CONFIG.TABELAS.MEMBROS);
        break;

      case 'financeiro':
        this._dados.financeiro = await API.listar(CONFIG.TABELAS.FINANCEIRO);
        break;

      case 'presenca':
        this._dados.presencas = await API.listar(CONFIG.TABELAS.PRESENCAS);
        this._dados.membros = await API.listar(CONFIG.TABELAS.MEMBROS);
        break;

      case 'escalas':
        this._dados.escalas = await API.listar(CONFIG.TABELAS.ESCALAS);
        break;

      case 'discipulado':
        this._dados.discipulado = await API.listar(CONFIG.TABELAS.DISCIPULADO);
        break;

      case 'aniversarios':
        this._dados.membros = await API.listar(CONFIG.TABELAS.MEMBROS);
        break;
    }
  },

  /* ==========================================================
     HELPERS DE PERÍODO
     ========================================================== */
  _periodoLabel() {
    const labels = {
      mes_atual: 'Mês atual',
      mes_passado: 'Mês passado',
      ultimos_3: 'Últimos 3 meses',
      ano: 'Ano todo'
    };
    return labels[this._periodo] || 'Mês atual';
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

  _filtrarPorPeriodo(lista, campoData = 'Data') {
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1;

    return (lista || []).filter((item) => {
      const mesAno = this._mesAnoDe(item[campoData]);
      if (!mesAno) return false;
      const [ano, mes] = mesAno.split('-').map(Number);

      switch (this._periodo) {
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

  _formatarMoeda(v) {
    const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/\./g, '').replace(',', '.'));
    if (isNaN(n)) return 'R$ 0,00';
    return 'R$ ' + n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  },

  _parseMinisterios(v) {
    if (!v) return [];
    if (Array.isArray(v)) return v;
    if (typeof v === 'string') {
      try {
        const arr = JSON.parse(v);
        if (Array.isArray(arr)) return arr;
      } catch (e) { /* não é JSON */ }
      return v.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  },

  /* ==========================================================
     RENDER DO RELATÓRIO
     ========================================================== */
  _renderRelatorio() {
    const c = document.getElementById('content');
    const meta = CONFIG.RELATORIOS.find((r) => r.id === this._tipoAtual);
    const info = this._gerarInfo();

    const hoje = new Date();
    const dataGeracao = `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()} às ${String(hoje.getHours()).padStart(2, '0')}:${String(hoje.getMinutes()).padStart(2, '0')}`;

    c.innerHTML = `
      <div class="rel-acoes-topo">
        <button class="btn btn-neutral" onclick="Relatorios.render()">
          <i class="fas fa-arrow-left"></i> Voltar
        </button>
        <div class="rel-acoes-botoes">
          <button class="btn btn-success" onclick="Relatorios.enviarWhats()">
            <i class="fab fa-whatsapp"></i> Enviar WhatsApp
          </button>
          <button class="btn btn-primary" onclick="Relatorios.imprimirPDF()">
            <i class="fas fa-file-pdf"></i> Salvar PDF
          </button>
        </div>
      </div>

      <div class="rel-filtro">
        <label>Período:</label>
        <select class="form-select" onchange="Relatorios.trocarPeriodo(this.value)">
          <option value="mes_atual"   ${this._periodo === 'mes_atual'   ? 'selected' : ''}>Mês atual</option>
          <option value="mes_passado" ${this._periodo === 'mes_passado' ? 'selected' : ''}>Mês passado</option>
          <option value="ultimos_3"   ${this._periodo === 'ultimos_3'   ? 'selected' : ''}>Últimos 3 meses</option>
          <option value="ano"         ${this._periodo === 'ano'         ? 'selected' : ''}>Ano todo</option>
        </select>
      </div>

      <div class="rel-documento" id="rel-documento">
        <!-- CABEÇALHO (aparece no PDF) -->
        <div class="rel-doc-header">
          <div class="rel-doc-logo">
            <i class="fas fa-church"></i>
          </div>
          <div class="rel-doc-info">
            <h1>PIBENS ADM</h1>
            <p>Primeira Igreja Batista em Encarnação de Salinas</p>
            <p class="rel-doc-subtitulo">Gestão Eclesiástica</p>
          </div>
        </div>

        <!-- TÍTULO -->
        <div class="rel-doc-titulo">
          <h2>Relatório: ${meta.nome}</h2>
          <p>
            <strong>Período:</strong> ${this._periodoLabel()} &nbsp;|&nbsp;
            <strong>Gerado em:</strong> ${dataGeracao}
          </p>
        </div>

        <!-- CONTEÚDO -->
        ${info.html}
      </div>
    `;
  },

  trocarPeriodo(periodo) {
    this._periodo = periodo;
    this._renderRelatorio();
  },

  /* ==========================================================
     GERADOR DE INFORMAÇÕES (cada tipo)
     ========================================================== */
  _gerarInfo() {
    switch (this._tipoAtual) {
      case 'membros':      return this._infoMembros();
      case 'financeiro':   return this._infoFinanceiro();
      case 'presenca':     return this._infoPresenca();
      case 'escalas':      return this._infoEscalas();
      case 'discipulado':  return this._infoDiscipulado();
      case 'aniversarios': return this._infoAniversarios();
      default: return { html: '<p>Relatório não disponível.</p>', texto: '' };
    }
  },

  /* ============ MEMBROS ============ */
  _infoMembros() {
    const membros = this._dados.membros || [];

    const total = membros.length;
    const ativos = membros.filter((m) => m.Situação === 'Ativo').length;
    const inativos = total - ativos;
    const batizados = membros.filter((m) => m['Já foi batizado?'] === 'SIM').length;

    const porCategoria = {};
    membros.forEach((m) => {
      const cat = m.Categoria || 'Não informado';
      porCategoria[cat] = (porCategoria[cat] || 0) + 1;
    });

    const porMinisterio = {};
    membros.forEach((m) => {
      const mins = this._parseMinisterios(m.Ministérios);
      mins.forEach((min) => {
        porMinisterio[min] = (porMinisterio[min] || 0) + 1;
      });
    });

    const porFaixa = {};
    membros.forEach((m) => {
      const faixa = UI.calcularFaixaEtaria(m.Nascimento);
      if (faixa) {
        porFaixa[faixa.nome] = (porFaixa[faixa.nome] || 0) + 1;
      }
    });

    const html = `
      <div class="rel-cards">
        ${this._card('Total de Membros', total, '#2563eb', 'fa-users')}
        ${this._card('Ativos', ativos, '#059669', 'fa-user-check')}
        ${this._card('Inativos', inativos, '#dc2626', 'fa-user-times')}
        ${this._card('Batizados', batizados, '#7c3aed', 'fa-water')}
      </div>

      ${this._blocoLista('Por Categoria', porCategoria, '#2563eb')}
      ${this._blocoLista('Por Ministério', porMinisterio, '#7c3aed')}
      ${this._blocoLista('Por Faixa Etária', porFaixa, '#f59e0b')}
    `;

    const texto = [
      '*📊 RELATÓRIO DE MEMBROS*',
      `_Período: ${this._periodoLabel()}_`,
      '',
      `👥 Total: *${total}*`,
      `✅ Ativos: *${ativos}*`,
      `❌ Inativos: *${inativos}*`,
      `💧 Batizados: *${batizados}*`,
      '',
      '*📋 Por Categoria:*',
      ...Object.entries(porCategoria).map(([k, v]) => `• ${k}: ${v}`),
      '',
      '*🏛️ Por Ministério:*',
      ...Object.entries(porMinisterio).sort((a,b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `• ${k}: ${v}`),
      '',
      '*🎂 Por Faixa Etária:*',
      ...Object.entries(porFaixa).map(([k, v]) => `• ${k}: ${v}`),
      '',
      '_PIBENS ADM_'
    ].join('\n');

    return { html, texto };
  },

  /* ============ FINANCEIRO ============ */
  _infoFinanceiro() {
    const dados = this._filtrarPorPeriodo(this._dados.financeiro || []);

    let entradas = 0, saidas = 0;
    const porCategoria = {};

    dados.forEach((d) => {
      const v = parseFloat(String(d.Valor).replace(/\./g, '').replace(',', '.')) || 0;
      const cat = d.Categoria || 'Outros';

      if (d.Tipo === 'Entrada') entradas += v;
      else saidas += v;

      porCategoria[cat] = (porCategoria[cat] || 0) + v;
    });

    const saldo = entradas - saidas;

    const html = `
      <div class="rel-cards">
        ${this._card('Entradas', this._formatarMoeda(entradas), '#059669', 'fa-arrow-down')}
        ${this._card('Saídas', this._formatarMoeda(saidas), '#dc2626', 'fa-arrow-up')}
        ${this._card('Saldo', this._formatarMoeda(saldo), saldo >= 0 ? '#2563eb' : '#dc2626', 'fa-wallet')}
        ${this._card('Lançamentos', dados.length, '#7c3aed', 'fa-list')}
      </div>

      ${this._blocoLista('Por Categoria (R$)', porCategoria, '#0891b2', true)}
    `;

    const texto = [
      '*💰 RELATÓRIO FINANCEIRO*',
      `_Período: ${this._periodoLabel()}_`,
      '',
      `⬇️ Entradas: *${this._formatarMoeda(entradas)}*`,
      `⬆️ Saídas: *${this._formatarMoeda(saidas)}*`,
      `${saldo >= 0 ? '✅' : '⚠️'} Saldo: *${this._formatarMoeda(saldo)}*`,
      `📋 Lançamentos: *${dados.length}*`,
      '',
      '*📊 Por Categoria:*',
      ...Object.entries(porCategoria).sort((a,b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => `• ${k}: ${this._formatarMoeda(v)}`),
      '',
      '_PIBENS ADM_'
    ].join('\n');

    return { html, texto };
  },

  /* ============ PRESENÇA ============ */
  _infoPresenca() {
    const presencas = this._filtrarPorPeriodo(this._dados.presencas || []);
    const membros = this._dados.membros || [];

    let totalPresentes = 0;
    let totalVisitantes = 0;
    presencas.forEach((p) => {
      totalPresentes += parseInt(p.TotalPresentes) || 0;
      totalVisitantes += parseInt(p.Visitantes) || 0;
    });

    const media = presencas.length > 0 ? (totalPresentes / presencas.length) : 0;

    // Top membros presentes
    const contagem = {};
    presencas.forEach((p) => {
      let presentes = [];
      try { presentes = JSON.parse(p.MembrosPresentes || '[]'); }
      catch (e) { presentes = String(p.MembrosPresentes || '').split(',').map((s) => s.trim()).filter(Boolean); }

      presentes.forEach((nome) => {
        contagem[nome] = (contagem[nome] || 0) + 1;
      });
    });

    const topMembros = Object.entries(contagem)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const html = `
      <div class="rel-cards">
        ${this._card('Cultos', presencas.length, '#2563eb', 'fa-church')}
        ${this._card('Média por Culto', media.toFixed(1), '#0891b2', 'fa-chart-line')}
        ${this._card('Presenças Totais', totalPresentes, '#059669', 'fa-users')}
        ${this._card('Visitantes', totalVisitantes, '#f59e0b', 'fa-user-plus')}
      </div>

      <div class="rel-bloco">
        <h3><i class="fas fa-trophy"></i> Top 10 Membros Mais Presentes</h3>
        <div class="rel-lista">
          ${topMembros.length > 0
            ? topMembros.map(([nome, qtd], idx) => {
                const medalha = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}º`;
                const pct = presencas.length > 0 ? Math.round((qtd / presencas.length) * 100) : 0;
                return `
                  <div class="rel-lista-item">
                    <span class="rel-lista-rank">${medalha}</span>
                    <span class="rel-lista-nome">${UI.escapar(nome)}</span>
                    <span class="rel-lista-valor">${qtd} presenças (${pct}%)</span>
                  </div>
                `;
              }).join('')
            : '<p style="color:#94a3b8;text-align:center;padding:1rem;">Sem dados no período</p>'
          }
        </div>
      </div>
    `;

    const texto = [
      '*✅ RELATÓRIO DE PRESENÇA*',
      `_Período: ${this._periodoLabel()}_`,
      '',
      `⛪ Cultos: *${presencas.length}*`,
      `📊 Média por culto: *${media.toFixed(1)}*`,
      `👥 Presenças totais: *${totalPresentes}*`,
      `👋 Visitantes: *${totalVisitantes}*`,
      '',
      '*🏆 Top 5 Membros:*',
      ...topMembros.slice(0, 5).map(([nome, qtd], idx) => {
        const medalha = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}º`;
        return `${medalha} ${nome}: ${qtd}`;
      }),
      '',
      '_PIBENS ADM_'
    ].join('\n');

    return { html, texto };
  },

  /* ============ ESCALAS ============ */
  _infoEscalas() {
    const escalas = this._dados.escalas || [];
    const hoje = new Date().toISOString().slice(0, 10);

    const futuras = escalas.filter((e) => {
      const iso = this._isoDe(e.Data);
      return iso >= hoje;
    }).sort((a, b) => this._isoDe(a.Data).localeCompare(this._isoDe(b.Data)));

    const html = `
      <div class="rel-cards">
        ${this._card('Escalas Futuras', futuras.length, '#7c3aed', 'fa-calendar-check')}
      </div>

      <div class="rel-bloco">
        <h3><i class="fas fa-list-check"></i> Próximas Escalas</h3>
        ${futuras.length > 0 ? `
          <table class="rel-tabela">
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Funções Preenchidas</th>
                <th>Vagas</th>
              </tr>
            </thead>
            <tbody>
              ${futuras.slice(0, 15).map((e) => {
                const funcoes = CONFIG.ESCALAS.FUNCOES;
                const preenchidas = funcoes.filter((f) => e[f.campo] && e[f.campo].trim()).length;
                const vagas = funcoes.length - preenchidas;
                return `
                  <tr>
                    <td>${UI.dataBR(e.Data)}</td>
                    <td>${UI.escapar(e.Tipo || '—')}</td>
                    <td>${preenchidas} de ${funcoes.length}</td>
                    <td>${vagas > 0 ? `<span style="color:#dc2626;font-weight:700;">${vagas} vaga(s)</span>` : '<span style="color:#059669;font-weight:700;">✓ Completa</span>'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        ` : '<p style="color:#94a3b8;text-align:center;padding:1rem;">Nenhuma escala futura</p>'}
      </div>
    `;

    const texto = [
      '*📋 RELATÓRIO DE ESCALAS*',
      `_Gerado em: ${new Date().toLocaleDateString('pt-BR')}_`,
      '',
      `📅 Escalas futuras: *${futuras.length}*`,
      '',
      ...futuras.slice(0, 10).map((e) => {
        const funcoes = CONFIG.ESCALAS.FUNCOES;
        const preenchidas = funcoes.filter((f) => e[f.campo] && e[f.campo].trim()).length;
        const vagas = funcoes.length - preenchidas;
        return `📌 ${UI.dataBR(e.Data)} — ${e.Tipo}\n   ${vagas > 0 ? `⚠️ ${vagas} vaga(s)` : '✅ Completa'}`;
      }),
      '',
      '_PIBENS ADM_'
    ].join('\n');

    return { html, texto };
  },

  _isoDe(data) {
    if (!data) return '9999-99-99';
    if (/^\d{4}-\d{2}-\d{2}$/.test(data)) return data;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
      const p = data.split('/');
      return `${p[2]}-${p[1]}-${p[0]}`;
    }
    return '9999-99-99';
  },

  /* ============ DISCIPULADO ============ */
  _infoDiscipulado() {
    const disc = this._dados.discipulado || [];

    const porEtapa = {};
    CONFIG.DISCIPULADO.ETAPAS.forEach((e) => { porEtapa[e.nome] = 0; });
    disc.forEach((d) => {
      if (porEtapa[d.Etapa] !== undefined) porEtapa[d.Etapa]++;
    });

    const prontos = disc.filter((d) => d.Etapa === 'Pronto para Batismo');

    const html = `
      <div class="rel-cards">
        ${CONFIG.DISCIPULADO.ETAPAS.map((e) => `
          <div class="rel-card-info-simples" style="border-left-color:${e.cor};">
            <i class="fas ${e.icon}" style="color:${e.cor};"></i>
            <div>
              <span style="color:${e.cor};">${porEtapa[e.nome] || 0}</span>
              <small>${e.nome}</small>
            </div>
          </div>
        `).join('')}
      </div>

      ${prontos.length > 0 ? `
        <div class="rel-bloco" style="border-left-color:#f59e0b;">
          <h3><i class="fas fa-water" style="color:#f59e0b;"></i> Prontos para Batismo (${prontos.length})</h3>
          <div class="rel-lista">
            ${prontos.map((d) => `
              <div class="rel-lista-item">
                <span class="rel-lista-nome">${UI.escapar(d.Nome)}</span>
                <span class="rel-lista-valor">Decisão: ${UI.dataBR(d.DataDecisao)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;

    const texto = [
      '*🌱 RELATÓRIO DE DISCIPULADO*',
      `_Gerado em: ${new Date().toLocaleDateString('pt-BR')}_`,
      '',
      ...CONFIG.DISCIPULADO.ETAPAS.map((e) => `${e.icon ? '' : '•'} ${e.nome}: *${porEtapa[e.nome] || 0}*`),
      '',
      prontos.length > 0 ? `*💧 Prontos para Batismo (${prontos.length}):*` : '',
      ...prontos.map((d) => `• ${d.Nome}`),
      '',
      '_PIBENS ADM_'
    ].filter(Boolean).join('\n');

    return { html, texto };
  },

  /* ============ ANIVERSARIANTES ============ */
  _infoAniversarios() {
    const membros = this._dados.membros || [];
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    const aniversariantes = [];

    membros.forEach((m) => {
      const nasc = (m.Nascimento || '').trim();
      if (!nasc) return;
      const parsed = UI.parseDataNascimento(nasc);
      if (!parsed) return;
      if (parsed.mes !== mesAtual) return;

      const idade = parsed.ano ? (anoAtual - parsed.ano) : null;
      aniversariantes.push({
        nome: m.Nome || '—',
        dia: parsed.dia,
        idade
      });
    });

    aniversariantes.sort((a, b) => a.dia - b.dia);

    const nomeMes = CONFIG.MESES[mesAtual - 1];
    const nomeMesCap = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);

    const html = `
      <div class="rel-cards">
        ${this._card('Aniversariantes', aniversariantes.length, '#e11d48', 'fa-birthday-cake')}
      </div>

      <div class="rel-bloco">
        <h3><i class="fas fa-birthday-cake"></i> Aniversariantes de ${nomeMesCap}</h3>
        ${aniversariantes.length > 0 ? `
          <table class="rel-tabela">
            <thead>
              <tr>
                <th>Dia</th>
                <th>Nome</th>
                <th>Idade</th>
              </tr>
            </thead>
            <tbody>
              ${aniversariantes.map((a) => `
                <tr>
                  <td><strong>${String(a.dia).padStart(2, '0')}/${String(mesAtual).padStart(2, '0')}</strong></td>
                  <td>${UI.escapar(a.nome)}</td>
                  <td>${a.idade ? a.idade + ' anos' : '—'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : `<p style="color:#94a3b8;text-align:center;padding:1rem;">Nenhum aniversariante em ${nomeMesCap}</p>`}
      </div>
    `;

    const texto = [
      `*🎂 ANIVERSARIANTES DE ${nomeMesCap.toUpperCase()}*`,
      '',
      `Total: *${aniversariantes.length}*`,
      '',
      ...aniversariantes.map((a) => `🎉 ${String(a.dia).padStart(2, '0')}/${String(mesAtual).padStart(2, '0')} — ${a.nome}${a.idade ? ' (' + a.idade + ' anos)' : ''}`),
      '',
      '_PIBENS ADM_'
    ].join('\n');

    return { html, texto };
  },

  /* ==========================================================
     HELPERS DE RENDER
     ========================================================== */
  _card(label, valor, cor, icon) {
    return `
      <div class="rel-card-info-simples" style="border-left-color:${cor};">
        <i class="fas ${icon}" style="color:${cor};"></i>
        <div>
          <span style="color:${cor};">${valor}</span>
          <small>${label}</small>
        </div>
      </div>
    `;
  },

  _blocoLista(titulo, obj, cor, formatarMoeda = false) {
    const entries = Object.entries(obj).sort((a, b) => {
      const va = typeof a[1] === 'number' ? a[1] : parseFloat(a[1]) || 0;
      const vb = typeof b[1] === 'number' ? b[1] : parseFloat(b[1]) || 0;
      return vb - va;
    });

    if (entries.length === 0) return '';

    return `
      <div class="rel-bloco">
        <h3><i class="fas fa-chart-bar" style="color:${cor};"></i> ${titulo}</h3>
        <div class="rel-lista">
          ${entries.map(([nome, valor]) => `
            <div class="rel-lista-item">
              <span class="rel-lista-nome">${UI.escapar(nome)}</span>
              <span class="rel-lista-valor">${formatarMoeda ? this._formatarMoeda(valor) : valor}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /* ==========================================================
     ENVIAR POR WHATSAPP
     ========================================================== */
  enviarWhats() {
    const info = this._gerarInfo();
    const meta = CONFIG.RELATORIOS.find((r) => r.id === this._tipoAtual);

    const texto = info.texto || '';

    // Tenta copiar pro clipboard primeiro
    if (navigator.clipboard) {
      navigator.clipboard.writeText(texto).then(() => {
        UI.toast('📋 Relatório copiado! Cole no WhatsApp.', 'success');
        // Abre o WhatsApp Web com texto vazio (o usuário cola)
        setTimeout(() => {
          window.open('https://web.whatsapp.com/', '_blank');
        }, 500);
      }).catch(() => {
        this._abrirWhatsFallback(texto);
      });
    } else {
      this._abrirWhatsFallback(texto);
    }
  },

  _abrirWhatsFallback(texto) {
    // Modal pra copiar manualmente
    const html = `
      <p style="margin-bottom:1rem;color:#475569;font-size:0.9rem;">
        Copie o texto abaixo e cole no WhatsApp:
      </p>
      <textarea class="form-textarea" rows="16" style="font-family:monospace;font-size:0.8rem;white-space:pre;">${UI.escapar(texto)}</textarea>
    `;

    const botoes = `
      <button class="btn btn-neutral" onclick="UI.closeModal()">Fechar</button>
      <button class="btn btn-success" onclick="Relatorios._copiarTexto()">
        <i class="fas fa-copy"></i> Copiar
      </button>
    `;

    UI.openModal('📱 Enviar por WhatsApp', html, botoes);
  },

  _copiarTexto() {
    const ta = document.querySelector('.modal-body textarea');
    if (ta) {
      ta.select();
      document.execCommand('copy');
      UI.toast('✅ Copiado!', 'success');
      setTimeout(() => {
        window.open('https://web.whatsapp.com/', '_blank');
      }, 500);
    }
  },

  /* ==========================================================
     SALVAR/IMPRIMIR PDF
     ========================================================== */
  imprimirPDF() {
    UI.toast('Abrindo diálogo de impressão... Escolha "Salvar como PDF".', 'info', 5000);
    setTimeout(() => {
      window.print();
    }, 300);
  }

};

console.log('%c[Relatorios] Módulo carregado', 'color:#64748b;font-size:11px;');