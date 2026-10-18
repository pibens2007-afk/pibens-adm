/* ============================================================
   PIBENS ADM — Módulo Dashboard / Início v3.0
   ============================================================ */

const Dashboard = {

  async render() {
    const c = document.getElementById('content');
    if (!c) return;

    c.innerHTML = UI.loading('Carregando painel...');

    try {
      // 1. Busca todos os dados necessários de uma vez
      const [membros, talentos, agenda, aniversariantes] = await Promise.all([
        API.listar(CONFIG.TABELAS.MEMBROS),
        API.listar(CONFIG.TABELAS.TALENTOS),
        API.listar(CONFIG.TABELAS.AGENDA),
        API.banners() // Puxa os aniversariantes do dia
      ]);

      // 2. Calcula os totais
      const totalMembros = (membros || []).length;
      const totalTalentos = (talentos || []).length;
      const totalEventos = (agenda || []).length;

      // 3. Verifica se tem aniversariante hoje
      const temAniversariante = aniversariantes.birthdays && aniversariantes.birthdays.length > 0;
      const nomesAniversariantes = temAniversariante ? aniversariantes.birthdays.join(', ') : 'Nenhum membro faz aniversário hoje';

      // 4. Conta aniversariantes do mês
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

      // 5. Renderiza a tela
      c.innerHTML = `
        <div style="display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;">
          
          <!-- Card de Aniversariantes de Hoje -->
          <div class="data-card" style="flex: 1; min-width: 300px; display: flex; align-items: center; gap: 16px; padding: 20px;">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: ${temAniversariante ? '#fee2e2' : '#f1f5f9'}; display: flex; align-items: center; justify-content: center; font-size: 20px; color: ${temAniversariante ? '#dc2626' : '#94a3b8'};">
              <i class="fas fa-birthday-cake"></i>
            </div>
            <div>
              <h3 style="font-size: 13px; font-weight: 800; color: #64748b; margin: 0 0 4px 0; text-transform: uppercase;">Aniversariantes de Hoje</h3>
              <p style="font-size: 15px; font-weight: 600; color: #1e293b; margin: 0;">${nomesAniversariantes}</p>
            </div>
          </div>

          <!-- Card do Calendário Batista -->
          <div style="flex: 1; min-width: 300px; background: linear-gradient(135deg, #2563eb, #7c3aed); border-radius: 16px; padding: 20px; color: white; display: flex; align-items: center; gap: 16px;">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 20px;">
              <i class="fas fa-bookmark"></i>
            </div>
            <div>
              <h3 style="font-size: 13px; font-weight: 800; color: rgba(255,255,255,0.8); margin: 0 0 4px 0; text-transform: uppercase;">Calendário Batista CBB</h3>
              <p style="font-size: 15px; font-weight: 600; margin: 0;">${aniversariantes.baptistDates || 'Disponível'}</p>
            </div>
          </div>

        </div>

        <div class="membros-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px;">
          
          <!-- Membros -->
          <div class="membros-stat" style="padding: 24px;">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: #e0e7ff; color: #4f46e5; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 12px;">
              <i class="fas fa-users"></i>
            </div>
            <span class="membros-stat-value" style="font-size: 32px; font-weight: 800; color: #1e293b; display: block; line-height: 1;">${totalMembros}</span>
            <span class="membros-stat-label" style="font-size: 13px; color: #64748b; font-weight: 600; margin-top: 4px; display: block;">Membros cadastrados</span>
          </div>

          <!-- Talentos -->
          <div class="membros-stat" style="padding: 24px;">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: #ede9fe; color: #7c3aed; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 12px;">
              <i class="fas fa-star"></i>
            </div>
            <span class="membros-stat-value" style="font-size: 32px; font-weight: 800; color: #1e293b; display: block; line-height: 1;">${totalTalentos}</span>
            <span class="membros-stat-label" style="font-size: 13px; color: #64748b; font-weight: 600; margin-top: 4px; display: block;">Talentos registrados</span>
          </div>

          <!-- Agenda -->
          <div class="membros-stat" style="padding: 24px;">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: #cffafe; color: #0891b2; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 12px;">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <span class="membros-stat-value" style="font-size: 32px; font-weight: 800; color: #1e293b; display: block; line-height: 1;">${totalEventos}</span>
            <span class="membros-stat-label" style="font-size: 13px; color: #64748b; font-weight: 600; margin-top: 4px; display: block;">Eventos na agenda</span>
          </div>

          <!-- Aniversariantes Hoje -->
          <div class="membros-stat" style="padding: 24px;">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: #fef3c7; color: #d97706; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 12px;">
              <i class="fas fa-birthday-cake"></i>
            </div>
            <span class="membros-stat-value" style="font-size: 32px; font-weight: 800; color: #1e293b; display: block; line-height: 1;">${temAniversariante ? aniversariantes.birthdays.length : 0}</span>
            <span class="membros-stat-label" style="font-size: 13px; color: #64748b; font-weight: 600; margin-top: 4px; display: block;">Aniversariantes hoje</span>
          </div>

          <!-- Aniversariantes do Mês -->
          <div class="membros-stat" style="padding: 24px;">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: #ffe4e6; color: #e11d48; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 12px;">
              <i class="fas fa-gift"></i>
            </div>
            <span class="membros-stat-value" style="font-size: 32px; font-weight: 800; color: #1e293b; display: block; line-height: 1;">${totalAniversariantesMes}</span>
            <span class="membros-stat-label" style="font-size: 13px; color: #64748b; font-weight: 600; margin-top: 4px; display: block;">Aniversariantes do mês</span>
          </div>

          <!-- IA -->
          <div class="membros-stat" style="padding: 24px;">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: #dbeafe; color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 12px;">
              <i class="fas fa-robot"></i>
            </div>
            <span class="membros-stat-value" style="font-size: 32px; font-weight: 800; color: #1e293b; display: block; line-height: 1;">∞</span>
            <span class="membros-stat-label" style="font-size: 13px; color: #64748b; font-weight: 600; margin-top: 4px; display: block;">Assistente IA</span>
          </div>

        </div>
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

console.log('%c[Dashboard] Módulo carregado v3.0', 'color:#64748b;font-size:11px;');
