/* ============================================================
   PIBENS ADM — Inicialização do App v2.1
   ============================================================ */

const App = {
  
  async iniciar() {
    try {
      // Verifica se o usuário já está logado (sessão salva)
      const usuarioSalvo = localStorage.getItem('pibens_adm_usuario');
      
      if (usuarioSalvo) {
        // Já está logado, vai direto pro app
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('otp-screen').style.display = 'none';
        document.getElementById('app-root').style.display = 'flex';
        
        // Atualiza o nome no menu lateral
        const user = JSON.parse(usuarioSalvo);
        const nomeMenu = document.querySelector('.sidebar-user-name');
        if (nomeMenu && user.nome) nomeMenu.textContent = user.nome;

        // Inicia o Menu
        if (typeof Menu !== 'undefined') Menu.iniciar();
        
      } else {
        // Não está logado, mostra a tela de login
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('app-root').style.display = 'none';
        
        // Foca no campo de senha
        const inputSenha = document.getElementById('login-password');
        if (inputSenha) inputSenha.focus();
      }
      
      // Preenche o ano no rodapé
      const footerYear = document.getElementById('footer-year');
      if (footerYear) footerYear.textContent = new Date().getFullYear();
      
      // Preenche a data no topo
      const topbarDate = document.getElementById('topbar-date');
      if (topbarDate) {
        const hoje = new Date();
        const opcoes = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        topbarDate.querySelector('span').textContent = hoje.toLocaleDateString('pt-BR', opcoes);
      }

    } catch (e) {
      console.error('Erro ao iniciar o App:', e);
    }
  }

};

// Inicia o aplicativo assim que a página carregar
document.addEventListener('DOMContentLoaded', () => {
  App.iniciar();
});

console.log('%c[App] Módulo carregado v2.1', 'color:#64748b;font-size:11px;');
