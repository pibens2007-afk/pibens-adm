/* ============================================================
   PIBENS ADM — Autenticação
   ============================================================
   Responsável por:
   - Login (valida senha no Apps Script)
   - Sessão de 7 dias (localStorage)
   - Logout
   - Controle de exibição: tela de login vs app
   ============================================================ */

const Auth = {

  /* ----------------------------------------------------------
     Sessão
     ---------------------------------------------------------- */
  temSessaoValida() {
    const raw = localStorage.getItem(CONFIG.SESSAO_KEY);
    if (!raw) return false;
    try {
      const s = JSON.parse(raw);
      return s.expira && Date.now() < s.expira;
    } catch (e) {
      return false;
    }
  },

  salvarSessao() {
    const expira = Date.now() + (CONFIG.SESSAO_DIAS * 24 * 60 * 60 * 1000);
    localStorage.setItem(CONFIG.SESSAO_KEY, JSON.stringify({ expira }));
  },

  limparSessao() {
    localStorage.removeItem(CONFIG.SESSAO_KEY);
  },

  /* ----------------------------------------------------------
     Login
     ---------------------------------------------------------- */
  async handleLogin(event) {
    event.preventDefault();

    const btn    = document.getElementById('login-btn');
    const erroEl = document.getElementById('login-error');
    const input  = document.getElementById('login-password');

    if (!input || !input.value) {
      if (erroEl) erroEl.textContent = 'Digite a senha.';
      return;
    }

    const senha = input.value;

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Verificando...';
    if (erroEl) erroEl.textContent = '';

    try {
      await API.login(senha);
      this.salvarSessao();
      this.liberarApp();
    } catch (e) {
      if (erroEl) erroEl.textContent = e.message || CONFIG.MSG.SENHA_INCORRETA;
      input.value = '';
      input.focus();
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-sign-in-alt"></i><span>ENTRAR</span>';
    }
  },

  /* ----------------------------------------------------------
     Logout
     ---------------------------------------------------------- */
  async logout() {
    const ok = await UI.confirmar('Deseja realmente sair do sistema?', 'Sair');
    if (!ok) return;

    this.limparSessao();
    location.reload();
  },

  /* ----------------------------------------------------------
     Controle de exibição
     ---------------------------------------------------------- */
  liberarApp() {
    const loginScreen = document.getElementById('login-screen');
    const appRoot     = document.getElementById('app-root');

    if (loginScreen) loginScreen.style.display = 'none';
    if (appRoot)     appRoot.style.display = 'flex';

    // Inicializa o app (dashboard, menu, etc.)
    if (typeof App !== 'undefined' && typeof App.iniciar === 'function') {
      App.iniciar();
    }
  },

  mostrarLogin() {
    const loginScreen = document.getElementById('login-screen');
    const appRoot     = document.getElementById('app-root');

    if (loginScreen) loginScreen.style.display = 'flex';
    if (appRoot)     appRoot.style.display = 'none';

    // Foca no campo de senha
    setTimeout(() => {
      const input = document.getElementById('login-password');
      if (input) input.focus();
    }, 100);
  },

  /* ----------------------------------------------------------
     Inicialização
     ---------------------------------------------------------- */
  iniciar() {
    if (this.temSessaoValida()) {
      this.liberarApp();
    } else {
      this.mostrarLogin();
    }
  }

};

console.log('%c[Auth] Módulo carregado', 'color:#64748b;font-size:11px;');
