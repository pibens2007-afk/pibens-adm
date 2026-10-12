/* ============================================================
   PIBENS ADM — Módulo Dashboard
   ============================================================
   Responsável por:
   - Cards com estatísticas (membros, talentos, agenda, aniversariantes)
   - Banners (aniversariantes + calendário CBB)
   - Atalhos rápidos
   ============================================================ */

const Dashboard = {

  /* ----------------------------------------------------------
     Render principal
     ---------------------------------------------------------- */
  async render() {
    const container = document.getElementById('content');
    if (!container) return;

    // 1) Mostra loading
    container.innerHTML = UI.loading('Carregando painel...');

    // 2) Busca dados em paralelo
    let membros = [], talentos = [], agenda = [];
    let banners = { birthdays: [], baptistDates: '', todayStr: '' };

    try {
      const [rMembros, rTalentos, rAgenda, rBanners] = await Promise.all([
        API.listar(CONFIG.TABELAS.MEMBROS).catch(() => []),
        API.listar(CONFIG.TABELAS.TALENTOS).catch(() => []),
        API.listar(CONFIG.TABELAS.AGENDA).catch(() => []),
        API.banners().catch(() => banners)
      ]);
      membros  = rMembros  || [];
      talentos = rTalentos || [];
      agenda   = rAgenda   || [];
      banners  = rBanners  || banners;
    } catch (e) {
      console.error('[Dashboard] Erro ao carregar dados:', e);
    }

    // 3) Calcula estatísticas
    const totalMembros        = membros.length;
    const totalTalentos       = talentos.length;
    const totalEventos        = agenda.length;
    const aniversariantesHoje = banners.birthdays ? banners.birthdays.length : 0;
    const aniversariantesMes  = this._contarAniversariantesMes(membros);

    // 4) Monta HTML
    const html = `
      <div class="dashboard-grid">
        ${this._card('emerald', 'fa-users',       totalMembros,               'Membros cadastrados',       'membros')}
        ${this._card('purple',  'fa-star',        totalTalentos,              'Talentos registrados',      'talentos')}
        ${this._card('cyan',    'fa-calendar-alt', totalEventos,              'Eventos na agenda',         'agenda')}
        ${this._card('amber',   'fa-birthday-cake', aniversariantesHoje,      'Aniversariantes hoje',      null)}
        ${this._card('rose',    'fa-gift',         aniversariantesMes,        'Aniversariantes do mês',    null)}
        ${this._card('blue',    'fa-robot',        '∞',                       'Assistente IA',             'ia')}
      </div>

      <div style="margin-top:1.5rem;">
        ${this._atalhos()}
      </div>
    `;

    container.innerHTML = html;

    // 5) Atualiza banners da home (no topo)
    this._renderBanners(banners);
  },

  /* ----------------------------------------------------------
     Renderiza um card
     ---------------------------------------------------------- */
  _card(cor, icone, valor, label, acao) {
    const onclickAttr = acao ? `onclick="Menu.navegar('${acao}')"` : '';
    return `
      <div class="stat-card stat-${cor}" ${onclickAttr}>
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
     Atalhos rápidos
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
          <button class="btn btn-primary btn-lg" onclick="Agenda.novo()">
            <i class="fas fa-calendar-plus"></i> Novo evento
          </button>
          <button class="btn btn-purple btn-lg" onclick="Talentos.novo()">
            <i class="fas fa-star"></i> Novo talento
          </button>
          <button class="btn btn-danger btn-lg" onclick="Menu.navegar('ia')">
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

console.log('%c[Dashboard] Módulo carregado', 'color:#64748b;font-size:11px;');
