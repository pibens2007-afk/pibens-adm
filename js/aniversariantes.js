/* ============================================================
   PIBENS ADM — Módulo Aniversariantes v2.3
   ============================================================
   - Ícone do WhatsApp com tamanho forçado via inline
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
          <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:16px;">
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

      <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:16px;">
        ${aniversariantesMes.map(a => this._renderCardNormal(a)).join('')}
      </div>
    `;
  },

  _renderCardDestaque(a) {
    const nomeChamada = a.apelido ? a.apelido : a.nome.split(' ')[0];
    const telLimpo = (a.telefone || '').replace(/\D/g, '');
    const msgWpp = encodeURIComponent(`Olá ${nomeChamada}, a paz do Senhor! 🎉 Passando para te desejar um feliz aniversário! Que este novo ano de vida seja repleto de bênçãos, saúde e muita alegria. Um grande abraço da família PIBENS! 🙏🎂`);
    const linkWpp = telLimpo ? `https://wa.me/55${telLimpo}?text=${msgWpp}` : '#';

    return `
      <div class="data-card" style="padding:20px; border-left:4px solid #dc2626; position:relative; background:#fef2f2;">
        <span style="position:absolute; top:-10px; right:16px; background:#dc2626; color:#fff; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:700;">
          <i class="fas fa-star"></i> HOJE!
        </span>
        
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
          <div class="avatar" style="width:48px; height:48px; font-size:18px; background:#fee2e2; color:#dc2626;">${a.nome.charAt(0)}</div>
          <div>
            <h3 style="margin:0; font-size:16px; color:#1e293b;">${UI.escapar(a.nome)}</h3>
            <p style="margin:4px 0 0 0; font-size:13px; color:#64748b;">${a.idade} anos - Dia ${a.dia}</p>
          </div>
        </div>

        ${telLimpo ? `
          <a href="${linkWpp}" target="_blank" style="display:flex; align-items:center; justify-content:center; gap:8px; width:100%; background:#25D366; color:#fff; padding:10px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px;">
            <div style="width:20px; height:20px; display:flex; align-items:center; justify-content:center;">
              <i class="fab fa-whatsapp" style="font-size:20px !important; color:#fff !important; line-height:1 !important; margin:0 !important; padding:0 !important;"></i>
            </div>
            Enviar Parabéns
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
      <div class="data-card" style="padding:20px; border-left:4px solid #e11d48;">
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
          <div class="avatar" style="width:48px; height:48px; font-size:18px; background:#ffe4e6; color:#e11d48;">${a.nome.charAt(0)}</div>
          <div>
            <h3 style="margin:0; font-size:16px; color:#1e293b;">${UI.escapar(a.nome)}</h3>
            <p style="margin:4px 0 0 0; font-size:13px; color:#64748b;">${a.idade} anos - Dia ${a.dia}</p>
          </div>
        </div>

        ${telLimpo ? `
          <a href="${linkWpp}" target="_blank" style="display:flex; align-items:center; justify-content:center; gap:8px; width:100%; background:#25D366; color:#fff; padding:10px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px;">
            <div style="width:20px; height:20px; display:flex; align-items:center; justify-content:center;">
              <i class="fab fa-whatsapp" style="font-size:20px !important; color:#fff !important; line-height:1 !important; margin:0 !important; padding:0 !important;"></i>
            </div>
            Enviar Parabéns
          </a>
        ` : `<p style="text-align:center; font-size:12px; color:#94a3b8; margin:0;">Sem telefone cadastrado</p>`}
      </div>
    `;
  }

};
console.log('%c[Aniversariantes] Módulo carregado v2.3 (Ícone corrigido)', 'color:#64748b;font-size:11px;');
