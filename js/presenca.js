/* ============================================================
   PIBENS ADM — Módulo Presença v2.8
   ============================================================
   - Check-in com Apelido
   - Alerta de ausentes com WhatsApp humanizado
   ============================================================ */

const Presenca = {

  _dados: [],
  _membros: [],

  async render() {
    const c = document.getElementById('content');
    if (!c) return;

    c.innerHTML = UI.loading('Carregando cultos...');

    try {
      const [cultos, membros] = await Promise.all([
        API.listar(CONFIG.TABELAS.PRESENCAS),
        API.listar(CONFIG.TABELAS.MEMBROS)
      ]);
      
      this._dados = cultos || [];
      this._membros = membros || [];
      this._renderTudo();
    } catch (e) {
      c.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon" style="color:#dc2626;"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="empty-state-title">Erro ao carregar</div>
          <div class="empty-state-text">${UI.escapar(e.message)}</div>
        </div>
      `;
    }
  },

  _renderTudo() {
    const c = document.getElementById('content');
    const lista = [...this._dados].sort((a, b) => new Date(b.Data) - new Date(a.Data));

    c.innerHTML = `
      <div class="data-card" style="margin-bottom:24px; background:linear-gradient(135deg, #2563eb, #7c3aed); color:#fff; border:none; padding:24px; border-radius:16px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h2 style="margin:0 0 8px 0; font-size:22px; display:flex; align-items:center; gap:8px;">
            <i class="fas fa-church"></i> Cultos
          </h2>
          <p style="margin:0; font-size:14px; opacity:0.9;">${lista.length} culto(s) no período</p>
        </div>
        <button class="btn btn-success" style="background:#10b981; border:none; font-weight:700;" onclick="Presenca.novo()">
          <i class="fas fa-plus"></i> Novo culto
        </button>
      </div>

      <div class="data-card" style="padding:0; overflow:hidden;">
        <div class="data-table-wrap">
          <table class="data-table">
            <thead style="background:#1e293b; color:#fff;">
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Tema</th>
                <th>Pregador</th>
                <th>Presentes</th>
                <th>Taxa</th>
                <th>Faltantes</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              ${lista.length === 0 ? '<tr><td colspan="8" style="text-align:center; padding:20px;">Nenhum culto registrado</td></tr>' : ''}
              ${lista.map((p, index) => this._renderLinha(p, index, lista)).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  _renderLinha(p, index, listaCompleta) {
    const total = parseInt(p.TotalPresentes) || 0;
    const taxa = total > 0 ? Math.min(Math.round((total / 60) * 100), 100) : 0;
    const corTaxa = taxa >= 70 ? '#10b981' : taxa >= 50 ? '#f59e0b' : '#dc2626';

    let faltantesDesteCulto = [];
    
    if (index > 0) {
      const cultoAnterior = listaCompleta[index - 1];
      let presAnterior = [];
      let presAtual = [];
      try { presAnterior = JSON.parse(cultoAnterior.MembrosPresentes || '[]'); } catch(e) {}
      try { presAtual = JSON.parse(p.MembrosPresentes || '[]'); } catch(e) {}
      
      faltantesDesteCulto = this._membros.filter(m => 
        presAnterior.includes(String(m.sheetRowIndex)) && 
        !presAtual.includes(String(m.sheetRowIndex)) &&
        (m.Situação || 'Ativo') === 'Ativo'
      );
    } else if (index === 0) {
      const cultoAnterior = listaCompleta[1];
      if (cultoAnterior) {
        let presAnterior = [];
        let presAtual = [];
        try { presAnterior = JSON.parse(cultoAnterior.MembrosPresentes || '[]'); } catch(e) {}
        try { presAtual = JSON.parse(p.MembrosPresentes || '[]'); } catch(e) {}
        faltantesDesteCulto = this._membros.filter(m => 
          presAnterior.includes(String(m.sheetRowIndex)) && 
          !presAtual.includes(String(m.sheetRowIndex)) &&
          (m.Situação || 'Ativo') === 'Ativo'
        );
      }
    }

    const qtdFaltantes = faltantesDesteCulto.length;

    const botaoFaltantes = qtdFaltantes > 0 
      ? `<button class="btn btn-sm" onclick="Presenca.ver('${p.sheetRowIndex}')" style="background:#fee2e2; color:#dc2626; border:1px solid #fecaca; font-weight:700; display:flex; align-items:center; gap:4px;" title="Ver quem faltou"><i class="fas fa-user-slash"></i> ${qtdFaltantes}</button>`
      : `<span style="color:#cbd5e1; font-size:12px;">—</span>`;

    const temLink = p['Link do Culto'] && p['Link do Culto'].trim() !== '';
    const botaoYoutube = temLink 
      ? `<a href="${p['Link do Culto']}" target="_blank" class="btn btn-danger btn-sm" style="background:#dc2626; border:none; display:flex; align-items:center; justify-content:center;" title="Assistir no YouTube"><i class="fab fa-youtube"></i></a>` 
      : '';

    return `
      <tr>
        <td style="font-weight:600;">${UI.dataBR(p.Data)}</td>
        <td><span class="badge" style="background:#e0e7ff; color:#4338ca;">${UI.escapar(p.Tipo)}</span></td>
        <td>${UI.escapar(p.Tema || '—')}</td>
        <td>${UI.escapar(p.Pregador || '—')}</td>
        <td style="font-weight:700;">${total}</td>
        <td style="color:${corTaxa}; font-weight:700;">${taxa}%</td>
        <td style="text-align:center;">${botaoFaltantes}</td>
        <td class="col-actions" style="display:flex; gap:6px;">
          ${botaoYoutube}
          <button class="btn btn-success btn-sm" onclick="Presenca.editar('${p.sheetRowIndex}')" title="Editar"><i class="fas fa-edit"></i></button>
          <button class="btn btn-primary btn-sm" onclick="Presenca.ver('${p.sheetRowIndex}')" title="Fazer Check-in"><i class="fas fa-eye"></i></button>
          <button class="btn btn-danger btn-sm" onclick="Presenca.remover('${p.sheetRowIndex}')" title="Remover"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `;
  },

  novo() { this._abrirForm(null); },
  editar(id) { const r = this._dados.find(p => p.sheetRowIndex == id); if (r) this._abrirForm(r); },

  async ver(id, focarFaltantes = false) {
    const p = this._dados.find(x => x.sheetRowIndex == id);
    if (!p) return;

    UI.openModal(`📋 Chamada: ${UI.dataBR(p.Data)} - ${UI.escapar(p.Tipo)}`, UI.loading('Carregando membros...'), '');

    try {
      const listaMembros = this._membros.filter(m => (m.Situação || 'Ativo') === 'Ativo').sort((a,b) => (a.Nome||'').localeCompare(b.Nome||''));
      let presentes = [];
      try { if (p.MembrosPresentes) presentes = JSON.parse(p.MembrosPresentes); } catch (e) { presentes = []; }

      const listaCompleta = [...this._dados].sort((a, b) => new Date(b.Data) - new Date(a.Data));
      const indexAtual = listaCompleta.findIndex(x => x.sheetRowIndex == id);
      
      let faltantes = [];
      if (indexAtual < listaCompleta.length - 1) {
        const cultoAnterior = listaCompleta[indexAtual + 1];
        let presAnterior = [];
        try { presAnterior = JSON.parse(cultoAnterior.MembrosPresentes || '[]'); } catch(e) {}
        
        faltantes = listaMembros.filter(m => 
          presAnterior.includes(String(m.sheetRowIndex)) && 
          !presentes.includes(String(m.sheetRowIndex))
        );
      }

      const linkYoutube = p['Link do Culto'] && p['Link do Culto'].trim() !== ''
        ? `<div style="margin-bottom:16px;"><a href="${p['Link do Culto']}" target="_blank" style="display:inline-flex; align-items:center; gap:8px; background:#dc2626; color:#fff; padding:10px 16px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px;"><i class="fab fa-youtube"></i> Assistir Gravação do Culto</a></div>`
        : '';

      const html = `
        ${faltantes.length > 0 ? `
          <div style="background:${focarFaltantes ? '#fef2f2' : '#f8fafc'}; border:1px solid ${focarFaltantes ? '#fecaca' : '#e2e8f0'}; border-radius:8px; padding:16px; margin-bottom:16px; ${focarFaltantes ? 'box-shadow:0 0 0 3px rgba(220,38,38,0.2);' : ''}">
            <h4 style="margin:0 0 12px 0; color:#dc2626; font-size:14px; display:flex; align-items:center; gap:8px;">
              <i class="fas fa-heart"></i> Cuidado Pastoral: Ausentes neste culto (${faltantes.length})
            </h4>
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${faltantes.map(m => {
                const telLimpo = (m.Telefone || '').replace(/\D/g, '');
                
                // LÓGICA HUMANIZADA: Pega o apelido ou o primeiro nome
                const nomeChamada = m.Apelido ? m.Apelido : (m.Nome || '').split(' ')[0];
                
                // Mensagem mais acolhedora e pessoal
                const msgWpp = encodeURIComponent(`Olá ${nomeChamada}, a paz do Senhor! 💙 Sentimos sua falta no nosso último encontro. Estamos orando por você e sua família. Que Deus te abençoe!`);
                
                return `
                  <div style="display:flex; justify-content:space-between; align-items:center; background:#fff; padding:8px 12px; border-radius:6px; border:1px solid #fecaca;">
                    <span style="font-size:13px; color:#1e293b;"><strong>${UI.escapar(m.Nome)}</strong> ${m.Apelido ? `(${m.Apelido})` : ''}</span>
                    ${telLimpo ? `<a href="https://wa.me/55${telLimpo}?text=${msgWpp}" target="_blank" style="background:#25D366; color:#fff; padding:4px 10px; border-radius:6px; font-size:12px; text-decoration:none; display:flex; align-items:center; gap:4px; font-weight:600;"><i class="fab fa-whatsapp"></i> Enviar Carinho</a>` : `<span style="font-size:11px; color:#94a3b8;">Sem telefone</span>`}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        ${linkYoutube}

        <div style="margin-bottom:16px; display:flex; gap:12px; flex-wrap:wrap;">
          <div style="background:#f1f5f9; padding:12px; border-radius:8px; flex:1; min-width:120px;"><span style="font-size:11px; color:#64748b; font-weight:700;">TOTAL PRESENTES</span><div style="font-size:24px; font-weight:800; color:#1e293b;">${p.TotalPresentes || 0}</div></div>
          <div style="background:#f1f5f9; padding:12px; border-radius:8px; flex:1; min-width:120px;"><span style="font-size:11px; color:#64748b; font-weight:700;">VISITANTES</span><div style="font-size:14px; font-weight:600; color:#1e293b; margin-top:4px;">${UI.escapar(p.Visitantes || 'Nenhum')}</div></div>
          <div style="background:#f1f5f9; padding:12px; border-radius:8px; flex:1; min-width:120px;"><span style="font-size:11px; color:#64748b; font-weight:700;">PREGADOR</span><div style="font-size:14px; font-weight:600; color:#1e293b; margin-top:4px;">${UI.escapar(p.Pregador || '—')}</div></div>
        </div>

        <div style="border:1px solid #e2e8f0; border-radius:8px; overflow:hidden;">
          <div style="background:#f8fafc; padding:12px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;"><strong style="font-size:14px; color:#334155;">Lista de Presença</strong><span style="font-size:12px; color:#64748b;" id="contador-checkin">${presentes.length} marcados</span></div>
          <div style="max-height:300px; overflow-y:auto; padding:8px;">
            ${listaMembros.map(m => {
              const isChecked = presentes.includes(String(m.sheetRowIndex));
              const nomeExibicao = m.Nome + (m.Apelido ? ` <span style="color:#64748b;font-weight:400;font-size:0.85em;">(${m.Apelido})</span>` : '');
              return `<label style="display:flex; align-items:center; gap:12px; padding:8px 12px; border-radius:6px; cursor:pointer; transition:background 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'"><input type="checkbox" class="check-membro" value="${m.sheetRowIndex}" ${isChecked ? 'checked' : ''} onchange="Presenca._atualizarContador()" style="width:18px; height:18px; cursor:pointer;"><span style="font-size:14px; color:#1e293b;">${nomeExibicao}</span></label>`;
            }).join('')}
          </div>
        </div>
      `;

      const botoes = `<button class="btn btn-neutral" onclick="UI.closeModal()">Fechar</button><button class="btn btn-success" onclick="Presenca._salvarCheckin('${p.sheetRowIndex}')"><i class="fas fa-check-double"></i> Salvar Presença</button>`;
      document.getElementById('modal-body').innerHTML = html;
      document.getElementById('modal-footer').innerHTML = botoes;

    } catch (err) { UI.toast('Erro: ' + err.message, 'error'); }
  },

  _atualizarContador() {
    const m = document.querySelectorAll('.check-membro:checked').length;
    const el = document.getElementById('contador-checkin');
    if (el) el.textContent = m + ' marcados';
  },

  async _salvarCheckin(idCulto) {
    const checkboxes = document.querySelectorAll('.check-membro:checked');
    const presentes = Array.from(checkboxes).map(cb => cb.value);
    const p = this._dados.find(x => x.sheetRowIndex == idCulto);
    if (!p) return;

    const dadosAtualizados = { ...p, TotalPresentes: presentes.length.toString(), MembrosPresentes: JSON.stringify(presentes) };

    try {
      await API.salvar(CONFIG.TABELAS.PRESENCAS, dadosAtualizados, idCulto);
      UI.toast('Presença salva com sucesso!', 'success');
      UI.closeModal();
      this.render();
    } catch (e) { UI.toast('Erro ao salvar: ' + e.message, 'error'); }
  },

  _abrirForm(registro) {
    const ehEdicao = !!registro;
    const campos = CONFIG.CAMPOS.Presencas;

    const camposHTML = campos.map(campo => {
      let valor = registro ? (registro[campo.nome] || '') : '';
      if (campo.tipo === 'date' && valor) valor = UI.dataInput(valor);
      let placeholder = campo.nome;
      if (campo.nome === 'Visitantes') placeholder = 'Ex: Maria Silva, João Pedro (2)';
      else if (campo.nome === 'Observacoes') placeholder = 'Alguma observação sobre o culto...';
      else if (campo.nome === 'Tema') placeholder = 'Ex: O amor de Deus';
      else if (campo.nome === 'Pregador') placeholder = 'Ex: Pastor Alexandro';
      else if (campo.nome === 'Link do Culto') placeholder = 'Ex: https://www.youtube.com/watch?v=...';

      let input = '';
      if (campo.nome === 'Visitantes' || campo.tipo === 'textarea') input = `<textarea class="form-textarea" name="${campo.nome}" rows="3" placeholder="${placeholder}">${UI.escapar(valor)}</textarea>`;
      else if (campo.tipo === 'select') { const opts = (campo.opcoes || []).map(o => `<option value="${o}" ${valor === o ? 'selected' : ''}>${o}</option>`).join(''); input = `<select class="form-select" name="${campo.nome}"><option value="">— Selecione —</option>${opts}</select>`; }
      else input = `<input class="form-input" type="${campo.tipo}" name="${campo.nome}" value="${UI.escapar(valor)}" placeholder="${placeholder}">`;

      const isFull = (campo.nome === 'Visitantes' || campo.tipo === 'textarea' || campo.nome === 'Tema' || campo.nome === 'Link do Culto');
      const classeGrid = isFull ? 'form-grid-full' : '';

      return `<div class="form-group ${classeGrid}"><label class="form-label ${campo.obrigatorio ? 'form-label-required' : ''}">${campo.nome}</label>${input}</div>`;
    }).join('');

    const html = `<div class="form-secao"><div class="form-grid">${camposHTML}</div></div>`;
    const botoes = `<button class="btn btn-neutral" onclick="UI.closeModal()">Cancelar</button><button class="btn btn-success" onclick="Presenca._salvar('${registro?.sheetRowIndex || ''}')"><i class="fas fa-save"></i> Salvar</button>`;
    UI.openModal(ehEdicao ? '✏️ Editar Culto' : '⛪ Novo Culto', html, botoes);
  },

  async _salvar(id) {
    const form = document.getElementById('modal-body');
    const dados = {};
    CONFIG.CAMPOS.Presencas.forEach(campo => { const input = form.querySelector(`[name="${campo.nome}"]`); if (input) dados[campo.nome] = input.value.trim(); });
    if (!dados.Data || !dados.Tipo) return UI.toast('Data e Tipo são obrigatórios', 'error');
    try { await API.salvar(CONFIG.TABELAS.PRESENCAS, dados, id ? parseInt(id) : null); UI.toast('Culto salvo com sucesso!', 'success'); UI.closeModal(); this.render(); } catch (e) { UI.toast('Erro: ' + e.message, 'error'); }
  },

  async remover(id) {
    const ok = await UI.confirmar(`Remover este registro de culto?`, 'Remover');
    if (!ok) return;
    try { await API.remover(id, 'Presencas'); UI.toast('Culto removido!', 'success'); this.render(); } catch (e) { UI.toast('Erro: ' + e.message, 'error'); }
  }

};
console.log('%c[Presenca] Módulo carregado v2.8 (WhatsApp Pastoral)', 'color:#64748b;font-size:11px;');
