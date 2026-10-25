/* ============================================================
   PIBENS ADM — Módulo Diretoria e Cargos v1.5
   ============================================================
   - Puxa apenas quem tem o campo "Cargo de Liderança" preenchido
   ============================================================ */

const Diretoria = {

  _dados: [],

  async render() {
    const c = document.getElementById('content');
    c.innerHTML = UI.loading('Carregando diretoria...');
    try {
      const [cargosManuais, membros] = await Promise.all([
        API.call('adminListarCargos'),
        API.listar(CONFIG.TABELAS.MEMBROS)
      ]);
      
      this._dados = this._sincronizar(cargosManuais || [], membros || []);
      this._renderTudo();
    } catch (e) { 
      c.innerHTML = `<div class="empty-state"><div class="empty-state-icon" style="color:#dc2626;"><i class="fas fa-exclamation-triangle"></i></div><div class="empty-state-title">Erro</div><div class="empty-state-text">${UI.escapar(e.message)}</div></div>`; 
    }
  },

  _sincronizar(cargosManuais, membros) {
    const listaFinal = [...cargosManuais];
    
    membros.forEach(m => {
      // Puxa o cargo que foi digitado no cadastro do membro
      const cargoNoCadastro = m['Cargo de Liderança'];
      
      if (cargoNoCadastro && cargoNoCadastro.trim() !== '') {
        // Verifica se a pessoa já não está na lista manual com esse cargo
        const jaExiste = listaFinal.find(c => c.membro_id == m.sheetRowIndex && c.cargo === cargoNoCadastro);
        
        if (!jaExiste) {
          // Define a ordem baseada no nome do cargo
          let ordem = 50;
          const cargoLower = cargoNoCadastro.toLowerCase();
          if (cargoLower.includes('pastor')) ordem = 1;
          else if (cargoLower.includes('vice')) ordem = 2;
          else if (cargoLower.includes('secret')) ordem = 3;
          else if (cargoLower.includes('tesour')) ordem = 4;
          else if (cargoLower.includes('líder') || cargoLower.includes('lider')) ordem = 5;
          else if (cargoLower.includes('presb')) ordem = 6;
          else if (cargoLower.includes('diac')) ordem = 7;

          listaFinal.push({
            id: 'auto_' + m.sheetRowIndex,
            cargo: cargoNoCadastro,
            membro_id: m.sheetRowIndex,
            nome_membro: m.Nome,
            apelido: m.Apelido,
            ordem: ordem
          });
        }
      }
    });

    return listaFinal;
  },

  _renderTudo() {
    const c = document.getElementById('content');
    const cargosOrdenados = [...this._dados].sort((a, b) => (a.ordem || 99) - (b.ordem || 99));

    const grupos = {};
    cargosOrdenados.forEach(d => { if (!grupos[d.cargo]) grupos[d.cargo] = []; grupos[d.cargo].push(d); });

    c.innerHTML = `
      <div class="membros-toolbar" style="margin-bottom:24px;"><div style="flex:1;"></div><div class="membros-filtros"><button class="btn btn-success" onclick="Diretoria.novo()"><i class="fas fa-plus"></i> Novo Cargo Manual</button></div></div>

      ${Object.keys(grupos).length === 0 ? UI.emptyState('Nenhum cargo cadastrado', 'Preencha o "Cargo de Liderança" no cadastro de membros ou crie um manualmente.', '') : ''}

      ${Object.keys(grupos).map(cargo => `
        <div class="data-card" style="margin-bottom:16px; padding:20px; border-left:4px solid ${cargo.toLowerCase().includes('pastor') ? '#f59e0b' : '#e2e8f0'};">
          <h3 style="font-size:16px; color:#1e293b; border-bottom:1px solid #e2e8f0; padding-bottom:8px; margin-bottom:16px;">
            ${cargo.toLowerCase().includes('pastor') ? '<i class="fas fa-crown" style="color:#f59e0b; margin-right:8px;"></i>' : '<i class="fas fa-user-tie" style="color:#94a3b8; margin-right:8px;"></i>'} ${cargo}
          </h3>
          <div style="display:flex; gap:12px; flex-wrap:wrap;">
            ${grupos[cargo].map(d => {
              const isAuto = String(d.id).startsWith('auto_');
              return `
                <div style="background:${isAuto ? '#f0fdf4' : '#f8fafc'}; border:1px solid ${isAuto ? '#bbf7d0' : '#e2e8f0'}; padding:12px 16px; border-radius:12px; display:flex; align-items:center; gap:12px;">
                  <div class="avatar" style="width:40px; height:40px; font-size:16px; background:${cargo.toLowerCase().includes('pastor') ? '#fef3c7; color:#d97706' : (isAuto ? '#dcfce7; color:#059669' : '#e2e8f0; color:#475569')};">${(d.nome_membro || '?').charAt(0).toUpperCase()}</div>
                  <div>
                    <strong style="display:block; color:#1e293b; font-size:14px;">${UI.escapar(d.nome_membro || 'Membro Removido')}</strong>
                    <span style="font-size:12px; color:#64748b;">${d.apelido ? '('+d.apelido+')' : 'Membro'}</span>
                  </div>
                  
                  ${isAuto ? `
                    <span title="Cargo preenchido no cadastro do membro" style="margin-left:12px; color:#059669; font-size:12px; font-weight:600; display:flex; align-items:center; gap:4px;">
                      <i class="fas fa-sync-alt"></i> Auto
                    </span>
                  ` : `
                    <button class="btn btn-danger btn-sm" onclick="Diretoria.remover('${d.id}')" style="margin-left:12px; padding:4px 8px;" title="Remover Cargo Manual">
                      <i class="fas fa-trash"></i>
                    </button>
                  `}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `).join('')}
    `;
  },

  novo() {
    const html = `
      <div class="form-secao">
        <div class="form-group">
          <label class="form-label form-label-required">Cargo / Função</label>
          <select class="form-select" id="dir-cargo">
            <option value="Pastor Presidente">Pastor Presidente</option><option value="Vice-Presidente">Vice-Presidente</option>
            <option value="1º Secretário">1º Secretário</option><option value="2º Secretário">2º Secretário</option>
            <option value="1º Tesoureiro">1º Tesoureiro</option><option value="2º Tesoureiro">2º Tesoureiro</option>
            <option value="Diácono">Diácono</option><option value="Presbítero">Presbítero</option>
            <option value="Outro Cargo (digitar abaixo)">Outro Cargo (digitar abaixo)</option>
          </select>
        </div>
        <div class="form-group"><label class="form-label">Nome do Cargo (se for outro)</label><input class="form-input" id="dir-cargo-outro" placeholder="Ex: Líder de Casais"></div>
        <div class="form-group"><label class="form-label form-label-required">Membro</label><select class="form-select" id="dir-membro"><option value="">Carregando...</option></select></div>
      </div>
    `;
    const botoes = `<button class="btn btn-neutral" onclick="UI.closeModal()">Cancelar</button><button class="btn btn-success" onclick="Diretoria._salvar()"><i class="fas fa-save"></i> Salvar Cargo</button>`;
    UI.openModal('👑 Adicionar Cargo Manual', html, botoes);

    API.listar(CONFIG.TABELAS.MEMBROS).then(membros => {
      const select = document.getElementById('dir-membro'); if (!select) return;
      select.innerHTML = '<option value="">— Selecione o membro —</option>' + membros.sort((a,b) => a.Nome.localeCompare(b.Nome)).map(m => `<option value="${m.sheetRowIndex}">${m.Nome} ${m.Apelido ? '('+m.Apelido+')' : ''}</option>`).join('');
    });
  },

  async _salvar() {
    let cargo = document.getElementById('dir-cargo').value;
    const cargoOutro = document.getElementById('dir-cargo-outro').value.trim();
    const membroId = document.getElementById('dir-membro').value;
    
    if (cargo === 'Outro Cargo (digitar abaixo)') {
      if (!cargoOutro) return UI.toast('Digite o nome do cargo', 'error');
      cargo = cargoOutro;
    }
    if (!membroId) return UI.toast('Selecione um membro', 'error');
    
    try {
      await API.call('adminCriarCargo', [cargo, membroId]);
      UI.toast('Cargo manual adicionado!', 'success');
      UI.closeModal();
      this.render();
    } catch (e) { UI.toast('Erro: ' + e.message, 'error'); }
  },

  async remover(id) {
    if (String(id).startsWith('auto_')) {
      return UI.toast('Este cargo é automático. Vá no cadastro do membro e apague o "Cargo de Liderança".', 'info');
    }
    const ok = await UI.confirmar('Remover este cargo da diretoria?', 'Remover');
    if (!ok) return;
    try { await API.call('adminRemoverCargo', [id]); UI.toast('Cargo removido!', 'success'); this.render(); } catch (e) { UI.toast('Erro: ' + e.message, 'error'); }
  }

};
console.log('%c[Diretoria] Módulo carregado v1.5 (Liderança Exata)', 'color:#64748b;font-size:11px;');
