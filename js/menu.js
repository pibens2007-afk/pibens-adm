/* ============================================================
   PIBENS ADM — Menu / Navegação
   ============================================================
   Responsável por:
   - Renderizar a sidebar a partir de CONFIG.MENU
   - Marcar item ativo
   - Abrir/fechar a gaveta no celular
   - Navegar entre módulos
   ============================================================ */

const Menu = {

  /* ----------------------------------------------------------
     Renderiza os itens da sidebar
     ---------------------------------------------------------- */
  render() {
    const nav = document.getElementById('sidebar-nav');
    if (!nav) return;

    let html = '';

    CONFIG.MENU.forEach((grupo) => {
      // Título da seção (Principal, Cadastros, etc.)
      if (grupo.secao) {
        html += `<div class="nav-section">${grupo.secao}</div>`;
      }

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

  /* ----------------------------------------------------------
     Marca o item ativo
     ---------------------------------------------------------- */
  marcarAtivo(id) {
    const itens = document.querySelectorAll('#sidebar-nav .nav-item');
    itens.forEach((el) => {
      if (el.dataset.id === id) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  },

  /* ----------------------------------------------------------
     Abrir/fechar a gaveta (mobile)
     ---------------------------------------------------------- */
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

  /* ----------------------------------------------------------
     Navegação entre módulos
     ---------------------------------------------------------- */
  navegar(id) {
    const item = this._acharItem(id);
    if (!item) return;

    // Marca o item ativo
    this.marcarAtivo(id);

    // Fecha a gaveta no celular
    this.close();

    // Atualiza o título da topbar
    UI.setTituloTopbar(item.icon, item.label);

    // Chama o módulo correspondente
    const modulo = item.modulo;
    const container = document.getElementById('content');
    if (!container) return;

    // Roteador: cada módulo tem um objeto com o método render()
    switch (modulo) {
      case 'Dashboard':
        if (typeof Dashboard !== 'undefined') Dashboard.render();
        break;

      case 'Membros':
        if (typeof Membros !== 'undefined') Membros.render();
        break;

      case 'BancoTalentos':
        if (typeof Talentos !== 'undefined') Talentos.render();
        break;

      case 'Agenda':
        if (typeof Agenda !== 'undefined') Agenda.render();
        break;

      case 'IA':
        if (typeof IA !== 'undefined') IA.render();
        break;

      default:
        container.innerHTML = UI.emptyState(
          'Módulo em construção',
          `O módulo "${modulo}" será implementado em breve.`
        );
    }

    // Salva a última página acessada (pra reabrir nela depois)
    try {
      localStorage.setItem('pibens_adm_ultima_pagina', id);
    } catch (e) { /* ignora */ }
  },

  /* ----------------------------------------------------------
     Helpers internos
     ---------------------------------------------------------- */
  _acharItem(id) {
    for (const grupo of CONFIG.MENU) {
      const item = grupo.itens.find((i) => i.id === id);
      if (item) return item;
    }
    return null;
  },

  _ultimaPagina() {
    try {
      return localStorage.getItem('pibens_adm_ultima_pagina') || 'dashboard';
    } catch (e) {
      return 'dashboard';
    }
  },

  /* ----------------------------------------------------------
     Inicialização
     ---------------------------------------------------------- */
  iniciar() {
    this.render();

    // Navega pra última página usada (ou dashboard)
    const ultima = this._ultimaPagina();
    this.navegar(ultima);
  }

};

console.log('%c[Menu] Módulo carregado', 'color:#64748b;font-size:11px;');
