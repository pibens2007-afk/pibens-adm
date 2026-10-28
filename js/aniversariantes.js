/* ============================================================
   PIBENS ADM — Módulo Aniversariantes v2.4
   ============================================================
   - Blindado contra CSS global
   - Tarja "HOJE" com z-index alto
   ============================================================ */

const Aniversariantes = {

  _dados: [],

  async render() {
    const c = document.getElementById('content');
    if (!c) return;

    c.innerHTML = UI.loading('Carregando aniversariantes...');

    try {
      const dados = await API.listar(CONFIG.TABELAS.MEMBROS);
      this._dados = dados || [];
      this._renderTudo();
    } catch (e) {
      c.innerHTML = `<div class="empty-state"><div class="empty-state-icon" style="color:#dc2626;"><i class="fas fa-exclamation-triangle"></i></div><div class="empty-state-title">Erro</div><div class="empty-state-text">${UI.escapar(e.message)}</div></div>`;
    }
  },

  _renderTudo() {
    const c = document.getElementById('content');
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const diaAtual = hoje.getDate();

    const aniversariantesHoje = [];
    const aniversariantesMes = [];

    this._dados.forEach(m => {
      const nasc = String(m.Nascimento || '').trim();
      if (!nasc) return;
      const partes = nasc.split('-');
      if (partes.length !== 3) return;
      
      const mes = parseInt(partes[1], 10);
      const dia = parseInt(partes[2], 10);
      
      if (mes === mesAtual) {
        const idade = hoje.getFullYear() - parseInt(partes[0], 10);
        const aniversariante = {
          id: m.sheetRowIndex,
          nome: m.Nome,
          apelido: m.Apelido,
          telefone: m.Telefone,
          dia: dia,
          idade: idade
        };

        if (dia === diaAtual) aniversariantesHoje.push(aniversariante);
        else aniversariantesMes.push(aniversariante);
      }
    });

    aniversariantesMes.sort((a, b) => a.dia - b.dia);
    const mesNome = hoje.toLocaleDateString('pt-BR', { month: 'long' });

    c.innerHTML = `
      ${aniversariantesHoje.length > 0 ? `
        <div style="margin-bottom:24px;">
          <h3 style="font-size:14px; color:#64748b; text-transform:uppercase; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
            <i class="fas fa-star" style="color:#dc2626;"></i> Fazem aniversário hoje!
          </h3>
          <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:16px;">
            ${aniversariantesHoje.map(a => this._renderCardDestaque(a)).join('')}
          </div>
        </div>
      ` : ''}

      <div class="data-card" style="margin-bottom:24px; background:linear-gradient(135deg, #e11d48, #be185d); color:#fff; border:none; padding:24px; border-radius:16px;">
        <h2 style="margin:0 0 8px 0; font-size:22px; display:flex; align-items:center; gap:8px;">
          <i class="fas fa-birthday-cake"></i> Aniversariantes de ${mesNome}
        </h2>
        <p style="margin:0; font-size:14px; opacity:0.9;">${aniversariantesMes.length} pessoa(s) fazendo aniversário este mês</p>
      </div>

      ${aniversariantesMes.length === 0 ? UI.emptyState('Nenhum aniversariante no restante do mês', 'Volte no próximo mês!', '') : ''}

      <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:16px;">
        ${aniversariantesMes.map(a => this._renderCardNormal(a)).join('')}
      </div>
    `;
  },

  _renderCardDestaque(a) {
    const nomeChamada = a.apelido ? a.apelido : a.nome.split(' ')[0];
    const telLimpo = (a.telefone || '').replace(/\D/g, '');
    const msgWpp = encodeURIComponent(`Olá ${nomeChamada}, a paz do Senhor! 🎉 Passando para te desejar um feliz aniversário! Que este novo ano de vida seja repleto de bênçãos, saúde e muita alegria. Um grande abraço da família PIBENS! 🙏🎂`);
    const linkWpp = telLimpo ? `https://wa.me/55${telLimpo}?text=${msgWpp}` : '#';

    // BLINDAGEM DO CARD
    return `
      <div class="data-card" style="padding:20px; border:1px solid #fecaca; border-left:4px solid #dc2626; position:relative; background:#fef2f2; overflow:hidden; border-radius:12px;">
        
        <div style="position:absolute; top:0; right:0; background:#dc2626; color:#fff; padding:6px 12px; border-radius:0 0 0 12px; font-size:11px; font-weight:800; z-index:10; display:flex; align-items:center; gap:4px; text-transform:uppercase; letter-spacing:0.5px;">
          <i class="fas fa-star" style="color:#fff; margin:0;"></i> Hoje
        </div>
        
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px; margin-top:8px;">
          <div style="width:48px; height:48px; border-radius:50%; background:#fee2e2; color:#dc2626; display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:bold;">
            ${a.nome.charAt(0)}
          </div>
          <div>
            <h3 style="margin:0; font-size:16px; color:#1e293b; font-weight:700;">${UI.escapar(a.nome)}</h3>
            <p style="margin:4px 0 0 0; font-size:13px; color:#64748b;">${a.idade} anos - Dia ${a.dia}</p>
          </div>
        </div>

        ${telLimpo ? `
          <a href="${linkWpp}" target="_blank" style="display:flex; align-items:center; justify-content:center; gap:8px; width:100%; background:#25D366; color:#fff; padding:12px; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px; border:none; outline:none;">
            <i class="fab fa-whatsapp" style="font-size:22px !important; color:#fff !important; margin:0 !important; padding:0 !important; line-height:1 !important;"></i>
            <span style="color:#fff !important;">Enviar Parabéns</span>
          </a>
        ` : `<p style="text-align:center; font-size:12px; color:#94a3b8; margin:0;">Sem telefone cadastrado</p>`}
      </div>
    `;
  },

  _renderCardNormal(a) {
    const nomeChamada = a.apelido ? a.apelido : a.nome.split(' ')[0];
    const telLimpo = (a.telefone || '').replace(/\D/g, '');
    const msgWpp = encodeURIComponent(`Olá ${nomeChamada}, a paz do Senhor! 🎉 Passando para te desejar um feliz aniversário! Que este novo ano de vida seja repleto de bênçãos, saúde e muita alegria. Um grande abraço da família PIBENS! 🙏🎂`);
    const linkWpp = telLimpo ? `https://wa.me/55${telLimpo}?text=${msgWpp}` : '#';

    return `
      <div class="data-card" style="padding:20px; border:1px solid #e2e8f0; border-left:4px solid #e11d48; background:#fff; border-radius:12px;">
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
          <div style="width:48px; height:48px; border-radius:50%; background:#ffe4e6; color:#e11d48; display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:bold;">
            ${a.nome.charAt(0)}
          </div>
          <div>
            <h3 style="margin:0; font-size:16px; color:#1e293b; font-weight:700;">${UI.escapar(a.nome)}</h3>
            <p style="margin:4px 0 0 0; font-size:13px; color:#64748b;">${a.idade} anos - Dia ${a.dia}</p>
          </div>
        </div>

        ${telLimpo ? `
          <a href="${linkWpp}" target="_blank" style="display:flex; align-items:center; justify-content:center; gap:8px; width:100%; background:#25D366; color:#fff; padding:12px; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px; border:none; outline:none;">
            <i class="fab fa-whatsapp" style="font-size:22px !important; color:#fff !important; margin:0 !important; padding:0 !important; line-height:1 !important;"></i>
            <span style="color:#fff !important;">Enviar Parabéns</span>
          </a>
        ` : `<p style="text-align:center; font-size:12px; color:#94a3b8; margin:0;">Sem telefone cadastrado</p>`}
      </div>
    `;
  }

};
console.log('%c[Aniversariantes] Módulo carregado v2.4 (Blindado)', 'color:#64748b;font-size:11px;');
