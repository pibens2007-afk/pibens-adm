/* ============================================================
   PIBENS ADM — Módulo Dashboard / Início v3.2
   ============================================================
   - Banners do topo agora clicáveis
   ============================================================ */

const Dashboard = {

  async render() {
    const c = document.getElementById('content');
    if (!c) return;

    c.innerHTML = UI.loading('Carregando painel...');

    try {
      // 1. Busca todos os dados necessários
      const [membros, talentos, agenda, aniversariantes] = await Promise.all([
        API.listar(CONFIG.TABELAS.MEMBROS),
        API.listar(CONFIG.TABELAS.TALENTOS),
        API.listar(CONFIG.TABELAS.AGENDA),
        API.banners() 
      ]);

      // 2. Calcula os totais
      const totalMembros = (membros || []).length;
      const totalTalentos = (talentos || []).length;
      const totalEventos = (agenda || []).length;

      // 3. Aniversariantes de hoje
      const temAniversariante = aniversariantes.birthdays && aniversariantes.birthdays.length > 0;
      const nomesAniversariantes = temAniversariante ? aniversariantes.birthdays.join(', ') : 'Nenhum membro faz aniversário hoje';

      // 4. Aniversariantes do mês
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

      // 5. Renderiza a tela com CSS Grid e banners clicáveis
      c.innerHTML = `
        <style>
          .dash-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
          }
          .dash-card {
            background: #fff;
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.03);
            border: 1px solid #E2E8F0;
            display: flex;
            flex-direction: column;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .dash-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.06);
          }
          .dash-card-icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            margin-bottom: 16px;
          }
          .dash-card-number {
            font-size: 32px;
            font-weight: 800;
            color: #1e293b;
            line-height: 1;
            margin-bottom: 8px;
          }
          .dash-card-label {
            font-size: 13px;
            font-weight: 600;
            color: #64748b;
            margin-top: auto;
          }
          
          /* Estilo para os banners do topo */
          .dash-banner {
            flex: 1;
            min-width: 300px;
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 20px;
            cursor: pointer;
            transition: transform 0.2s;
          }
          .dash-banner:hover {
            transform: translateY(-2px);
          }
        </style>

        <!-- BANNERS DO TOPO (CLICÁVEIS) -->
        <div style="display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;">
          
          <!-- Banner Aniversariantes de Hoje -->
          <div class="data-card dash-banner" onclick="Menu.navegar('aniversarios')">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: ${temAniversariante ? '#fee2e2' : '#f1f5f9'}; display: flex; align-items: center; justify-content: center; font-size: 20px; color: ${temAniversariante ? '#dc2626' : '#94a3b8'};">
              <i class="fas fa-birthday-cake"></i>
            </div>
            <div>
              <h3 style="font-size: 12px; font-weight: 800; color: #64748b; margin: 0 0 4px 0; text-transform: uppercase;">Aniversariantes de Hoje</h3>
              <p style="font-size: 15px; font-weight: 600; color: #1e293b; margin: 0;">${nomesAniversariantes}</p>
            </div>
          </div>

          <!-- Banner Calendário Batista -->
          <div class="dash-banner" style="background: linear-gradient(135deg, #2563eb, #7c3aed); border-radius: 16px; color: white;" onclick="Menu.navegar('aniversarios')">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 20px;">
              <i class="fas fa-bookmark"></i>
            </div>
            <div>
              <h3 style="font-size: 12px; font-weight: 800; color: rgba(255,255,255,0.8); margin: 0 0 4px 0; text-transform: uppercase;">Calendário Batista CBB</h3>
              <p style="font-size: 15px; font-weight: 600; margin: 0;">${aniversariantes.baptistDates || 'Disponível'}</p>
            </div>
          </div>

        </div>

        <!-- GRID DE CARDS (JÁ CLICÁVEIS) -->
        <div class="dash-grid">
          
          <div class="dash-card" onclick="Menu.navegar('membros')">
            <div class="dash-card-icon" style="background: #e0e7ff; color: #4f46e5;">
              <i class="fas fa-users"></i>
            </div>
            <div class="dash-card-number">${totalMembros}</div>
            <div class="dash-card-label">Membros cadastrados</div>
          </div>

          <div class="dash-card" onclick="Menu.navegar('talentos')">
            <div class="dash-card-icon" style="background: #ede9fe; color: #7c3aed;">
              <i class="fas fa-star"></i>
            </div>
            <div class="dash-card-number">${totalTalentos}</div>
            <div class="dash-card-label">Talentos registrados</div>
          </div>

          <div class="dash-card" onclick="Menu.navegar('agenda')">
            <div class="dash-card-icon" style="background: #cffafe; color: #0891b2;">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="dash-card-number">${totalEventos}</div>
            <div class="dash-card-label">Eventos na agenda</div>
          </div>

          <div class="dash-card" onclick="Menu.navegar('aniversarios')">
            <div class="dash-card-icon" style="background: #fef3c7; color: #d97706;">
              <i class="fas fa-birthday-cake"></i>
            </div>
            <div class="dash-card-number">${temAniversariante ? aniversariantes.birthdays.length : 0}</div>
            <div class="dash-card-label">Aniversariantes hoje</div>
          </div>

          <div class="dash-card" onclick="Menu.navegar('aniversarios')">
            <div class="dash-card-icon" style="background: #ffe4e6; color: #e11d48;">
              <i class="fas fa-gift"></i>
            </div>
            <div class="dash-card-number">${totalAniversariantesMes}</div>
            <div class="dash-card-label">Aniversariantes do mês</div>
          </div>

          <div class="dash-card" onclick="Menu.navegar('ia')">
            <div class="dash-card-icon" style="background: #dbeafe; color: #2563eb;">
              <i class="fas fa-robot"></i>
            </div>
            <div class="dash-card-number">∞</div>
            <div class="dash-card-label">Assistente IA</div>
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

console.log('%c[Dashboard] Módulo carregado v3.2', 'color:#64748b;font-size:11px;');
