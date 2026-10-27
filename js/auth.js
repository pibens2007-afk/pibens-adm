/* ============================================================
   PIBENS ADM — Autenticação v2.2
   ============================================================ */

const Auth = {
  _emailTemporario: '', // Guarda o email entre o login e o OTP

  async handleLogin(event) {
    if (event) event.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');
    const erro = document.getElementById('login-error');

    if (!email || !senha) { erro.textContent = 'Preencha email e senha.'; return; }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
    erro.textContent = '';

    try {
      const res = await API.login(email, senha);
      
      if (res.etapa === 'otp_enviado') {
        this._emailTemporario = email; // Salva para usar no OTP
        
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('otp-screen').style.display = 'flex';
        
        const subtitle = document.getElementById('otp-subtitle');
        if (subtitle && res.destinos) {
          subtitle.innerHTML = `Enviamos um código para:<br><strong>${res.destinos.join(', ')}</strong>`;
        }
        
        document.getElementById('otp-input').value = '';
        document.getElementById('otp-input').focus();
        document.getElementById('otp-error').textContent = '';
      }
    } catch (e) {
      erro.textContent = e.message || 'Erro ao tentar entrar.';
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> <span>ENTRAR</span>';
    }
  },

  async handleValidarCodigo(event) {
    if (event) event.preventDefault();
    
    const input = document.getElementById('otp-input');
    const codigo = input.value.trim();
    const btn = document.getElementById('otp-btn');
    const erro = document.getElementById('otp-error');

    if (!codigo || codigo.length !== 6) { erro.textContent = 'Digite os 6 dígitos.'; return; }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validando...';
    erro.textContent = '';

    try {
      // Envia o email e o código
      const res = await API.validarCodigo(this._emailTemporario, codigo);
      
      if (res && res.usuario) {
        localStorage.setItem('pibens_adm_usuario', JSON.stringify(res.usuario));
        if (typeof UI !== 'undefined') UI.toast('Bem-vindo, ' + res.usuario.nome + '!', 'success');
      }

      document.getElementById('otp-screen').style.display = 'none';
      document.getElementById('app-root').style.display = 'flex';
      
      // Atualiza o nome no menu lateral
      const nomeMenu = document.getElementById('current-user-name');
      if (nomeMenu && res.usuario) nomeMenu.textContent = res.usuario.nome;

      if (typeof Menu !== 'undefined') Menu.iniciar();
      
    } catch (e) {
      erro.textContent = e.message || 'Código inválido.';
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-check-circle"></i> <span>VALIDAR</span>';
      input.value = '';
      input.focus();
    }
  },

  async handleReenviar() {
    if (!this._emailTemporario) return;
    const btn = document.getElementById('otp-reenviar');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    
    try {
      await API.reenviarCodigo(this._emailTemporario);
      if (typeof UI !== 'undefined') UI.toast('Novo código enviado!', 'success');
    } catch (e) {
      if (typeof UI !== 'undefined') UI.toast('Erro: ' + e.message, 'error');
    }
    setTimeout(() => { btn.disabled = false; btn.innerHTML = '<i class="fas fa-redo"></i> Reenviar código'; }, 5000);
  },

  voltarLogin() {
    this._emailTemporario = '';
    document.getElementById('otp-screen').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('login-password').value = '';
    document.getElementById('login-password').focus();
  },

  logout() {
    localStorage.removeItem('pibens_adm_usuario');
    localStorage.removeItem('pibens_adm_ultima_pagina');
    window.location.reload();
  }
};
console.log('%c[Auth] Módulo carregado v2.2', 'color:#64748b;font-size:11px;');
