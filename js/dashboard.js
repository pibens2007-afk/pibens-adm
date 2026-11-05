/* ============================================================
   PIBENS ADM — Módulo Dashboard / Início v3.3
   ============================================================
   - Banners do topo clicáveis
   - Banner do Calendário aponta para a tela Calendário
   ============================================================ */

const Dashboard = {

  async render() {
    const c = document.getElementById('content');
    if (!c) return;

    c.innerHTML = UI.loading('Carregando painel...');

    try {
      const [membros, talentos, agenda, aniversariantes] = await Promise.all([
        API.listar(CONFIG.TABELAS.MEMBROS),
        API.listar(CONFIG.TABELAS.TALENTOS),
        API.listar(CONFIG.TABELAS.AGENDA),
        API.banners() 
      ]);

      const totalMembros = (membros || []).length;
      const totalTalentos = (talentos || []).length;
      const totalEventos = (agenda || []).length;

      const temAniversariante = aniversariantes.birthdays && aniversariantes.birthdays.length > 0;
      const nomesAniversariantes = temAniversariante ? aniversariantes.birthdays.join(', ') : 'Nenhum membro faz aniversário hoje';

      const mesAtual = new Date().getMonth() + 1;
      let totalAniversariantesMes = 0;
      (membros || []).forEach(m => {
        const nasc = String(m.Nascimento || '').trim();
        if (nasc) {
          const partes = nasc.split('-');
          if (partes.length === 3 && parseInt(partes[1]) === mesAtual) {
            totalAniversariantesMes++;
          }
        }
      });

      c.innerHTML = `
        <section class="dash-highlights" aria-label="Destaques">
          <button type="button" class="dash-banner dash-banner-birthday" onclick="Menu.navegar('aniversarios')">
            <span class="dash-banner-icon"><i class="fas fa-birthday-cake"></i></span>
            <span class="dash-banner-copy">
              <span class="dash-banner-title">Aniversariantes de hoje</span>
              <span class="dash-banner-text">${nomesAniversariantes}</span>
            </span>
            <i class="fas fa-arrow-right dash-banner-arrow" aria-hidden="true"></i>
          </button>
          <button type="button" class="dash-banner dash-banner-calendar" onclick="Menu.navegar('calendario')">
            <span class="dash-banner-icon"><i class="fas fa-bookmark"></i></span>
            <span class="dash-banner-copy">
              <span class="dash-banner-title">Calendário Batista CBB</span>
              <span class="dash-banner-text">${aniversariantes.baptistDates || 'Disponível'}</span>
            </span>
            <i class="fas fa-arrow-right dash-banner-arrow" aria-hidden="true"></i>
          </button>
        </section>

        <section class="dash-section-heading">
          <div>
            <span class="dash-eyebrow">Visão geral</span>
            <h2>Resumo da igreja</h2>
          </div>
          <span class="dash-updated"><i class="fas fa-circle"></i> Dados atualizados</span>
        </section>

        <section class="dash-grid" aria-label="Indicadores">
          <button type="button" class="dash-card dash-card-violet" onclick="Menu.navegar('membros')">
            <span class="dash-card-icon">
              <i class="fas fa-users"></i>
            </span>
            <span class="dash-card-number">${totalMembros}</span>
            <span class="dash-card-label">Membros cadastrados</span>
            <i class="fas fa-users dash-card-art" aria-hidden="true"></i>
          </button>

          <button type="button" class="dash-card dash-card-purple" onclick="Menu.navegar('talentos')">
            <span class="dash-card-icon">
              <i class="fas fa-star"></i>
            </span>
            <span class="dash-card-number">${totalTalentos}</span>
            <span class="dash-card-label">Talentos registrados</span>
            <i class="fas fa-trophy dash-card-art" aria-hidden="true"></i>
          </button>

          <button type="button" class="dash-card dash-card-cyan" onclick="Menu.navegar('agenda')">
            <span class="dash-card-icon">
              <i class="fas fa-calendar-alt"></i>
            </span>
            <span class="dash-card-number">${totalEventos}</span>
            <span class="dash-card-label">Eventos na agenda</span>
            <i class="fas fa-calendar-check dash-card-art" aria-hidden="true"></i>
          </button>

          <button type="button" class="dash-card dash-card-amber" onclick="Menu.navegar('aniversarios')">
            <span class="dash-card-icon">
              <i class="fas fa-birthday-cake"></i>
            </span>
            <span class="dash-card-number">${temAniversariante ? aniversariantes.birthdays.length : 0}</span>
            <span class="dash-card-label">Aniversariantes hoje</span>
            <i class="fas fa-gift dash-card-art" aria-hidden="true"></i>
          </button>

          <button type="button" class="dash-card dash-card-rose" onclick="Menu.navegar('aniversarios')">
            <span class="dash-card-icon">
              <i class="fas fa-gift"></i>
            </span>
            <span class="dash-card-number">${totalAniversariantesMes}</span>
            <span class="dash-card-label">Aniversariantes do mês</span>
            <i class="fas fa-gift dash-card-art" aria-hidden="true"></i>
          </button>

          <button type="button" class="dash-card dash-card-blue" onclick="Menu.navegar('ia')">
            <span class="dash-card-icon">
              <i class="fas fa-robot"></i>
            </span>
            <span class="dash-card-number">∞</span>
            <span class="dash-card-label">Assistente IA</span>
            <i class="fas fa-microchip dash-card-art" aria-hidden="true"></i>
          </button>
        </section>

        <section class="dash-assistant">
          <div class="dash-assistant-mark"><i class="fas fa-robot"></i></div>
          <div class="dash-assistant-copy">
            <span class="dash-eyebrow">Assistente IA</span>
            <h2>Sempre ao seu lado para ajudar na gestão da sua igreja.</h2>
            <p>Encontre ferramentas inteligentes para apoiar sua rotina.</p>
            <button type="button" class="btn btn-primary dash-assistant-action" onclick="Menu.navegar('ia')">
              Acessar assistente <i class="fas fa-arrow-right"></i>
            </button>
          </div>
          <i class="fas fa-book-open dash-assistant-art" aria-hidden="true"></i>
          <span class="dash-assistant-glow" aria-hidden="true"></span>
        </section>
      `;

    } catch (e) {
      c.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon" style="color:#dc2626;"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="empty-state-title">Erro ao carregar o painel</div>
          <div class="empty-state-text">${UI.escapar(e.message)}</div>
          <button class="btn btn-primary" onclick="Dashboard.render()">
            <i class="fas fa-sync"></i> Tentar de novo
          </button>
        </div>
      `;
    }
  }

};

console.log('%c[Dashboard] Módulo carregado v3.3', 'color:#64748b;font-size:11px;');
