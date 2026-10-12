/* ============================================================
   PIBENS ADM — Orquestrador principal
   ============================================================
   Roda ao carregar a página. Responsável por:
   - Inicializar os módulos na ordem correta
   - Verificar sessão e direcionar (login ou app)
   - Atualizar elementos globais (data, versão, etc.)
   ============================================================ */

const App = {

  /* ----------------------------------------------------------
     Inicialização principal (chamada ao carregar)
     ---------------------------------------------------------- */
  async iniciar() {
    console.log('%c[App] Inicializando...', 'color:#2563eb;font-weight:bold;');

    try {
      // 1) Preenche ano no rodapé
      const anoEl = document.getElementById('footer-year');
      if (anoEl) anoEl.textContent = new Date().getFullYear();

      // 2) Atualiza a data na topbar
      UI.setDataTopbar();

      // 3) Monta o menu (sidebar) e já navega pra última página
      Menu.iniciar();

      // 4) Carrega os banners do topo (aniversariantes + CBB)
      //    O dashboard vai renderizar os banners por conta própria,
      //    mas se o usuário já estiver em outra tela, isso garante
      //    que os banners apareçam mesmo assim.
      this._carregarBannersGlobais();

      console.log('%c[App] Pronto!', 'color:#059669;font-weight:bold;');

    } catch (e) {
      console.error('[App] Erro na inicialização:', e);
      UI.toast('Erro ao iniciar o app: ' + e.message, 'error', 6000);
    }
  },

  /* ----------------------------------------------------------
     Carrega os banners do topo (independe do módulo ativo)
     ---------------------------------------------------------- */
  async _carregarBannersGlobais() {
    try {
      const info = await API.banners();
      if (typeof Dashboard !== 'undefined' && typeof Dashboard._renderBanners === 'function') {
        Dashboard._renderBanners(info);
      }
    } catch (e) {
      console.warn('[App] Não foi possível carregar banners:', e.message);
    }
  }

};

/* ============================================================
   BOOT — Roda quando a página termina de carregar
   ============================================================ */
window.addEventListener('load', () => {
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color:#2563eb;');
  console.log(`%c${CONFIG.APP_NAME} v${CONFIG.APP_VERSION}`, 'color:#2563eb;font-weight:bold;font-size:16px;');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color:#2563eb;');

  Auth.iniciar();
});

console.log('%c[App] Módulo carregado', 'color:#64748b;font-size:11px;');
