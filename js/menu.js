/* ============================================================
   PIBENS ADM — Menu / Navegação v3.0
   ============================================================ */

const Menu = {

  render() {
    const nav = document.getElementById('sidebar-nav');
    if (!nav) return;

    let html = '';

    CONFIG.MENU.forEach((grupo) => {
      if (grupo.secao) html += `<div class="nav-section">${grupo.secao}</div>`;

      grupo.itens.forEach((item) => {
        html += `
          <button class="nav-item" data-id="${item.id}" onclick="Menu.navegar('${item.id}')">
            <i class="fas ${item.icon}"></i>
            <span>${item.label}</span>
          </button>
        `;
      });
    });

    nav.innerHTML = html;
  },

  marcarAtivo(id) {
    document.querySelectorAll('#sidebar-nav .nav-item').forEach((el) => {
      if (el.dataset.id === id) el.classList.add('active');
      else el.classList.remove('active');
    });
  },

  open() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  close() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  },

  navegar(id) {
    const item = this._acharItem(id);
    if (!item) return;

    this.marcarAtivo(id);
    this.close();
    UI.setTituloTopbar(item.icon, item.label);

    const modulo = item.modulo;

    switch (modulo) {
      case 'Dashboard':        if (typeof Dashboard !== 'undefined') Dashboard.render(); break;
      case 'Mural':            if (typeof Mural !== 'undefined') Mural.render(); break;
      case 'Aniversariantes':  if (typeof Aniversariantes !== 'undefined') Aniversariantes.render(); break;
      case 'Membros':          if (typeof Membros !== 'undefined') Membros.render(); break;
      case 'BancoTalentos':    if (typeof Talentos !== 'undefined') Talentos.render(); break;
      case 'Agenda':           if (typeof Agenda !== 'undefined') Agenda.render(); break;
      case 'Financeiro':       if (typeof Financeiro !== 'undefined') Financeiro.render(); break;
      case 'Presenca':         if (typeof Presenca !== 'undefined') Presenca.render(); break;
      case 'Escalas':          if (typeof Escalas !== 'undefined') Escalas.render(); break;
      case 'Discipulado':      if (typeof Discipulado !== 'undefined') Discipulado.render(); break;
      case 'Relatorios':       if (typeof Relatorios !== 'undefined') Relatorios.render(); break;
      case 'Logs':             if (typeof Logs !== 'undefined') Logs.render(); break;
      case 'IA':               if (typeof IA !== 'undefined') IA.render(); break;
      default:
        const c = document.getElementById('content');
        if (c) c.innerHTML = UI.emptyState(
          'Módulo em construção',
          `O módulo "${modulo}" será implementado em breve.`
        );
    }

    try { localStorage.setItem('pibens_adm_ultima_pagina', id); } catch (e) {}
  },

  _acharItem(id) {
    for (const grupo of CONFIG.MENU) {
      const item = grupo.itens.find((i) => i.id === id);
      if (item) return item;
    }
    return null;
  },

  _ultimaPagina() {
    try { return localStorage.getItem('pibens_adm_ultima_pagina') || 'dashboard'; }
    catch (e) { return 'dashboard'; }
  },

  iniciar() {
    this.render();
    this.navegar(this._ultimaPagina());
  }

};

console.log('%c[Menu] Módulo carregado (v3.0 com Mural)', 'color:#64748b;font-size:11px;');
