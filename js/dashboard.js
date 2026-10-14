/* ============================================================
   PIBENS ADM — Módulo Dashboard v3.1
   ============================================================
   Novidades desta versão:
   - Cards de aniversariantes agora são CLICÁVEIS
   - Comunicado do Mural em destaque
   ============================================================ */

const Dashboard = {

  /* ----------------------------------------------------------
     Render principal
     ---------------------------------------------------------- */
  async render() {
    const container = document.getElementById('content');
    if (!container) return;

    container.innerHTML = UI.loading('Carregando painel...');

    // Busca dados em paralelo
    let membros = [], talentos = [], agenda = [];
    let banners = { birthdays: [], baptistDates: '', todayStr: '' };
    let comunicado = null;

    try {
      const [rMembros, rTalentos, rAgenda, rBanners, rComunicado] = await Promise.all([
        API.listar(CONFIG.TABELAS.MEMBROS).catch(() => []),
        API.listar(CONFIG.TABELAS.TALENTOS).catch(() => []),
        API.listar(CONFIG.TABELAS.AGENDA).catch(() => []),
        API.banners().catch(() => banners),
        (typeof Mural !== 'undefined' ? Mural.obterDestaque() : Promise.resolve(null)).catch(() => null)
      ]);

      membros    = rMembros    || [];
      talentos   = rTalentos   || [];
      agenda     = rAgenda     || [];
      banners    = rBanners    || banners;
      comunicado = rComunicado || null;
    } catch (e) {
      console.error('[Dashboard] Erro ao carregar dados:', e);
    }

    // Estatísticas
    const totalMembros        = membros.length;
    const totalTalentos       = talentos.length;
    const totalEventos        = agenda.length;
    const aniversariantesHoje = banners.birthdays ? banners.birthdays.length : 0;
    const aniversariantesMes  = this._contarAniversariantesMes(membros);

    // HTML
    const html = `
      ${comunicado ? this._renderComunicado(comunicado) : ''}

      <div class="dashboard-grid">
        ${this._card('emerald', 'fa-users',        totalMembros,          'Membros cadastrados',    'membros')}
        ${this._card('purple',  'fa-star',         totalTalentos,         'Talentos registrados',   'talentos')}
        ${this._card('cyan',    'fa-calendar-alt', totalEventos,          'Eventos na agenda',      'agenda')}
        ${this._card('amber',   'fa-birthday-cake', aniversariantesHoje,  'Aniversariantes hoje',   'aniversarios')}
        ${this._card('rose',    'fa-gift',         aniversariantesMes,    'Aniversariantes do mês', 'aniversarios')}
        ${this._card('blue',    'fa-robot',        '∞',                   'Assistente IA',          'ia')}
      </div>

      <div style="margin-top:1.5rem;">
        ${this._atalhos()}
      </div>
    `;

    container.innerHTML = html;
    this._renderBanners(banners);
  },

  /* ----------------------------------------------------------
     COMUNICADO EM DESTAQUE
     ---------------------------------------------------------- */
  _renderComunicado(m) {
    const tipo = CONFIG.MURAL.TIPOS.find((t) => t.id === m.Tipo) || CONFIG.MURAL.TIPOS[0];
    const prio = CONFIG.MURAL.PRIORIDADES.find((p) => p.id === m.Prioridade) || CONFIG.MURAL.PRIORIDADES[0];

    const data = m.DataCriacao ? new Date(m.DataCriacao) : null;
    const tempo = data ? this._tempoRelativo(data) : '—';

    const fixado = m.Fixo === 'Sim';

    return `
      <div class="dash-comunicado" style="background:${tipo.bg};border-left-color:${tipo.cor};">
        <div class="dash-comunicado-header">
          <div class="dash-comunicado-badges">
            <span class="dash-comunicado-tipo" style="background:${tipo.cor};color:#fff;">
              <i class="fas ${tipo.icon}"></i> ${tipo.nome}
            </span>
            ${m.Prioridade && m.Prioridade !== 'Normal' ? `
              <span class="dash-comunicado-prio" style="background:${prio.cor};color:#fff;">
                ${m.Prioridade}
              </span>
            ` : ''}
            ${fixado ? `
              <span class="dash-comunicado-fixo">
                <i class="fas fa-thumbtack"></i> FIXADO
              </span>
            ` : ''}
          </div>
          <button class="dash-comunicado-btn" onclick="Mural.render()">
            <i class="fas fa-external-link-alt"></i> Ver todos
          </button>
        </div>
        <h2 class="dash-comunicado-titulo" style="color:${tipo.cor};">
          ${UI.escapar(m.Titulo || 'Comunicado')}
        </h2>
        <p class="dash-comunicado-msg">${UI.escapar(m.Mensagem || '')}</p>
        <div class="dash-comunicado-meta">
          ${m.Autor ? `<span><i class="fas fa-user"></i> ${UI.escapar(m.Autor)}</span>` : ''}
          <span><i class="fas fa-clock"></i> ${tempo}</span>
        </div>
      </div>
    `;
  },

  _tempoRelativo(data) {
    const agora = new Date();
    const diff = agora - data;
    const min = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (min < 1) return 'Agora mesmo';
    if (min < 60) return `${min} min atrás`;
    if (horas < 24) return `${horas}h atrás`;
    if (dias < 7) return `${dias} dia(s) atrás`;

    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    return `${dia}/${mes}`;
  },

  /* ----------------------------------------------------------
     Cards (clicáveis)
     ---------------------------------------------------------- */
  _card(cor, icone, valor, label, acao) {
    const onclickAttr = acao ? `onclick="Menu.navegar('${acao}')"` : '';
    const cursorStyle = acao ? 'cursor:pointer;' : 'cursor:default;';
    return `
      <div class="stat-card stat-${cor}" ${onclickAttr} style="${cursorStyle}">
        <div class="stat-card-icon">
          <i class="fas ${icone}"></i>
        </div>
        <div>
          <div class="stat-card-value">${valor}</div>
          <div class="stat-card-label">${label}</div>
        </div>
      </div>
    `;
  },

  /* ----------------------------------------------------------
     Atalhos
     ---------------------------------------------------------- */
  _atalhos() {
    return `
      <div class="data-card">
        <div class="data-header">
          <div class="data-header-top">
            <div>
              <h2 class="data-title"><i class="fas fa-bolt mr-2"></i>Ações rápidas</h2>
              <p class="data-subtitle">Atalhos para o dia a dia</p>
            </div>
          </div>
        </div>
        <div style="padding:1.25rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:0.75rem;">
          <button class="btn btn-success btn-lg" onclick="Membros.novo()">
            <i class="fas fa-user-plus"></i> Novo membro
          </button>
          <button class="btn btn-primary btn-lg" onclick="Mural.novo()">
            <i class="fas fa-bullhorn"></i> Novo comunicado
          </button>
          <button class="btn btn-warning btn-lg" onclick="Agenda.novo()">
            <i class="fas fa-calendar-plus"></i> Novo evento
          </button>
          <button class="btn btn-purple btn-lg" onclick="Menu.navegar('ia')">
            <i class="fas fa-robot"></i> Perguntar à IA
          </button>
        </div>
      </div>
    `;
  },

  /* ----------------------------------------------------------
     Conta aniversariantes do mês
     ---------------------------------------------------------- */
  _contarAniversariantesMes(membros) {
    const mesAtual = new Date().getMonth() + 1;
    let total = 0;
    (membros || []).forEach((m) => {
      const nasc = (m.Nascimento || '').trim();
      if (!nasc) return;
      let mes = null;
      if (nasc.includes('/')) {
        const p = nasc.split('/');
        mes = parseInt(p[1], 10);
      } else if (nasc.includes('-')) {
        const p = nasc.split('-');
        if (p[0].length === 4) mes = parseInt(p[1], 10);
        else mes = parseInt(p[1], 10);
      }
      if (mes === mesAtual) total++;
    });
    return total;
  },

  /* ----------------------------------------------------------
     Banners (topo do app)
     ---------------------------------------------------------- */
  _renderBanners(info) {
    const wrap = document.getElementById('banners');
    if (!wrap) return;

    const temAniversariante = info.birthdays && info.birthdays.length > 0;

    const birthHtml = temAniversariante
      ? `
        <div class="banner banner-warning">
          <div class="banner-icon"><i class="fas fa-birthday-cake"></i></div>
          <div class="banner-content">
            <div class="banner-title">ANIVERSARIANTE(S) DO DIA</div>
            <div class="banner-text">${UI.escapar(info.birthdays.join(', '))}</div>
          </div>
        </div>
      `
      : `
        <div class="banner banner-neutral">
          <div class="banner-icon"><i class="fas fa-calendar-day"></i></div>
          <div class="banner-content">
            <div class="banner-title">ANIVERSARIANTES DE HOJE</div>
            <div class="banner-text">Nenhum membro faz aniversário hoje</div>
          </div>
        </div>
      `;

    const baptistHtml = `
      <div class="banner banner-primary">
        <div class="banner-icon"><i class="fas fa-bookmark"></i></div>
        <div class="banner-content">
          <div class="banner-title">CALENDÁRIO BATISTA CBB</div>
          <div class="banner-text">${UI.escapar(info.baptistDates || 'Disponível')}</div>
        </div>
      </div>
    `;

    wrap.innerHTML = birthHtml + baptistHtml;
  }

};

console.log('%c[Dashboard] Módulo carregado (v3.1 com cards clicáveis)', 'color:#64748b;font-size:11px;');
