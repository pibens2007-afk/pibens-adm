/* ============================================================
   PIBENS ADM — Autenticação (2 etapas: senha + OTP)
   ============================================================
   Etapa 1: senha → Apps Script envia código por email
   Etapa 2: código de 6 dígitos → libera o app
   Sessão: 7 dias (localStorage)
   ============================================================ */

const Auth = {

  /* ----------------------------------------------------------
     SESSÃO
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
     ETAPA 1 — LOGIN (senha)
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
      const r = await API.login(senha);

      // O backend retorna { etapa: 'otp_enviado', mensagem, destinos }
      if (r && r.etapa === 'otp_enviado') {
        input.value = '';
        this.mostrarOTP(r.destinos, r.mensagem);
      } else {
        throw new Error('Resposta inesperada do servidor.');
      }
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
     ETAPA 2 — VALIDAR CÓDIGO
     ---------------------------------------------------------- */
  async handleValidarCodigo(event) {
    event.preventDefault();

    const btn    = document.getElementById('otp-btn');
    const erroEl = document.getElementById('otp-error');
    const input  = document.getElementById('otp-input');

    if (!input || !input.value) {
      if (erroEl) erroEl.textContent = 'Digite o código.';
      return;
    }

    const codigo = input.value.trim();

    if (!/^\d{6}$/.test(codigo)) {
      if (erroEl) erroEl.textContent = 'O código deve ter 6 dígitos.';
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Validando...';
    if (erroEl) erroEl.textContent = '';

    try {
      await API.validarCodigo(codigo);
      this.salvarSessao();
      this.liberarApp();
    } catch (e) {
      if (erroEl) erroEl.textContent = e.message || 'Código inválido.';
      input.value = '';
      input.focus();
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-check-circle"></i><span>VALIDAR</span>';
    }
  },

  /* ----------------------------------------------------------
     REENVIAR CÓDIGO
     ---------------------------------------------------------- */
  async handleReenviar() {
    const btn = document.getElementById('otp-reenviar');
    const erroEl = document.getElementById('otp-error');

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Enviando...';
    }
    if (erroEl) erroEl.textContent = '';

    try {
      const r = await API.reenviarCodigo();
      UI.toast(r.mensagem || 'Novo código enviado!', 'success');
    } catch (e) {
      if (erroEl) erroEl.textContent = e.message || 'Erro ao reenviar.';
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-redo"></i> Não recebeu? Reenviar';
      }
    }
  },

  /* ----------------------------------------------------------
     VOLTAR PRA TELA DE LOGIN
     ---------------------------------------------------------- */
  voltarLogin() {
    const otpScreen = document.getElementById('otp-screen');
    const loginScreen = document.getElementById('login-screen');
    const otpInput = document.getElementById('otp-input');
    const otpError = document.getElementById('otp-error');

    if (otpScreen) otpScreen.style.display = 'none';
    if (loginScreen) loginScreen.style.display = 'flex';
    if (otpInput) otpInput.value = '';
    if (otpError) otpError.textContent = '';

    setTimeout(() => {
      const loginInput = document.getElementById('login-password');
      if (loginInput) loginInput.focus();
    }, 100);
  },

  /* ----------------------------------------------------------
     CONTROLE DE EXIBIÇÃO
     ---------------------------------------------------------- */
  liberarApp() {
    const loginScreen = document.getElementById('login-screen');
    const otpScreen   = document.getElementById('otp-screen');
    const appRoot     = document.getElementById('app-root');

    if (loginScreen) loginScreen.style.display = 'none';
    if (otpScreen)   otpScreen.style.display = 'none';
    if (appRoot)     appRoot.style.display = 'flex';

    if (typeof App !== 'undefined' && typeof App.iniciar === 'function') {
      App.iniciar();
    }
  },

  mostrarLogin() {
    const loginScreen = document.getElementById('login-screen');
    const otpScreen   = document.getElementById('otp-screen');
    const appRoot     = document.getElementById('app-root');

    if (loginScreen) loginScreen.style.display = 'flex';
    if (otpScreen)   otpScreen.style.display = 'none';
    if (appRoot)     appRoot.style.display = 'none';

    setTimeout(() => {
      const input = document.getElementById('login-password');
      if (input) input.focus();
    }, 100);
  },

  mostrarOTP(destinos, mensagem) {
    const loginScreen = document.getElementById('login-screen');
    const otpScreen   = document.getElementById('otp-screen');
    const appRoot     = document.getElementById('app-root');
    const subtitle    = document.getElementById('otp-subtitle');
    const otpInput    = document.getElementById('otp-input');
    const otpError    = document.getElementById('otp-error');

    if (loginScreen) loginScreen.style.display = 'none';
    if (otpScreen)   otpScreen.style.display = 'flex';
    if (appRoot)     appRoot.style.display = 'none';

    if (subtitle) {
      let texto = 'Enviamos um código de 6 dígitos para:';
      if (destinos && destinos.length > 0) {
        const lista = destinos.map(function (e) {
          return '<strong>' + UI.escapar(e) + '</strong>';
        }).join(', ');
        texto += '<br>' + lista;
      }
      subtitle.innerHTML = texto;
    }

    if (otpError) otpError.textContent = '';
    if (otpInput) {
      otpInput.value = '';
      setTimeout(function () { otpInput.focus(); }, 150);
    }
  },

  /* ----------------------------------------------------------
     LOGOUT
     ---------------------------------------------------------- */
  async logout() {
    const ok = await UI.confirmar('Deseja realmente sair do sistema?', 'Sair');
    if (!ok) return;

    this.limparSessao();
    location.reload();
  },

  /* ----------------------------------------------------------
     INICIALIZAÇÃO
     ---------------------------------------------------------- */
  iniciar() {
    if (this.temSessaoValida()) {
      this.liberarApp();
    } else {
      this.mostrarLogin();
    }
  }

};

/* Máscara no input do OTP (só números) */
document.addEventListener('input', function (e) {
  if (e.target && e.target.id === 'otp-input') {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
  }
});

console.log('%c[Auth] Módulo carregado (OTP)', 'color:#64748b;font-size:11px;');
