/* ============================================================
   PIBENS ADM — Módulo Relatórios v2.0
   ============================================================
   - Relatório detalhado de Membros com filtros
   - Cards dinâmicos (Membros, Homens, Mulheres, Idade)
   ============================================================ */

const Relatorios = {

  _dados: [],
  _filtroSexo: '',
  _filtroIdade: '',
  _filtroMinisterio: '',
  _filtroSituacao: '',

  async render() {
    const c = document.getElementById('content');
    if (!c) return;

    c.innerHTML = UI.loading('Carregando relatórios...');

    try {
      const dados = await API.listar(CONFIG.TABELAS.MEMBROS);
      this._dados = dados || [];
      this._renderTudo();
    } catch (e) {
      c.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon" style="color:#dc2626;"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="empty-state-title">Erro ao carregar</div>
          <div class="empty-state-text">${UI.escapar(e.message)}</div>
          <button class="btn btn-primary" onclick="Relatorios.render()">
            <i class="fas fa-sync"></i> Tentar de novo
          </button>
        </div>
      `;
    }
  },

  _renderTudo() {
    const c = document.getElementById('content');
    const filtrados = this._filtrar();

    // Estatísticas baseadas no filtro atual
    const total = filtrados.length;
    const homens = filtrados.filter(m => m.Sexo === 'Masculino').length;
    const mulheres = filtrados.filter(m => m.Sexo === 'Feminino').length;
    
    // Contagem de faixas etárias
    let criancas = 0, adolescentes = 0, jovens = 0, adultos = 0, idosos = 0;
    filtrados.forEach(m => {
      const faixa = UI.calcularFaixaEtaria(m.Nascimento);
      if (!faixa) return;
      if (faixa.nome === 'Criança') criancas++;
      else if (faixa.nome === 'Adolescente') adolescentes++;
      else if (faixa.nome === 'Jovem') jovens++;
      else if (faixa.nome === 'Adulto') adultos++;
      else if (faixa.nome === 'Idoso') idosos++;
    });

    c.innerHTML = `
      <!-- FILTROS -->
      <div class="data-card" style="padding:16px; margin-bottom:24px; display:flex; flex-wrap:wrap; gap:12px; align-items:flex-end;">
        <div class="form-group" style="margin-bottom:0; flex:1; min-width:150px;">
          <label class="form-label" style="font-size:12px;">Sexo</label>
          <select class="form-select" onchange="Relatorios._filtrarSexo(this.value)">
            <option value="">Todos</option>
            <option value="Masculino" ${this._filtroSexo === 'Masculino' ? 'selected' : ''}>Masculino</option>
            <option value="Feminino" ${this._filtroSexo === 'Feminino' ? 'selected' : ''}>Feminino</option>
          </select>
        </div>
        
        <div class="form-group" style="margin-bottom:0; flex:1; min-width:150px;">
          <label class="form-label" style="font-size:12px;">Faixa Etária</label>
          <select class="form-select" onchange="Relatorios._filtrarIdade(this.value)">
            <option value="">Todas</option>
            <option value="Criança" ${this._filtroIdade === 'Criança' ? 'selected' : ''}>Criança (0-11)</option>
            <option value="Adolescente" ${this._filtroIdade === 'Adolescente' ? 'selected' : ''}>Adolescente (12-17)</option>
            <option value="Jovem" ${this._filtroIdade === 'Jovem' ? 'selected' : ''}>Jovem (18-21)</option>
            <option value="Adulto" ${this._filtroIdade === 'Adulto' ? 'selected' : ''}>Adulto (22-59)</option>
            <option value="Idoso" ${this._filtroIdade === 'Idoso' ? 'selected' : ''}>Idoso (60+)</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom:0; flex:1; min-width:150px;">
          <label class="form-label" style="font-size:12px;">Ministério</label>
          <select class="form-select" onchange="Relatorios._filtrarMinisterio(this.value)">
            <option value="">Todos</option>
            ${CONFIG.MINISTERIOS.map(m => `<option value="${m.nome}" ${this._filtroMinisterio === m.nome ? 'selected' : ''}>${m.nome}</option>`).join('')}
          </select>
        </div>

        <div class="form-group" style="margin-bottom:0; flex:1; min-width:150px;">
          <label class="form-label" style="font-size:12px;">Situação</label>
          <select class="form-select" onchange="Relatorios._filtrarSituacao(this.value)">
            <option value="">Todas</option>
            <option value="Ativo" ${this._filtroSituacao === 'Ativo' ? 'selected' : ''}>Ativo</option>
            <option value="Inativo" ${this._filtroSituacao === 'Inativo' ? 'selected' : ''}>Inativo</option>
          </select>
        </div>

        <button class="btn btn-neutral" onclick="Relatorios._limparFiltros()" style="height:42px;">
          <i class="fas fa-eraser"></i> Limpar
        </button>
      </div>

      <!-- CARDS DE RESUMO -->
      <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:16px; margin-bottom:24px;">
        <div class="data-card" style="padding:20px; border-left:4px solid #2563eb;">
          <h3 style="font-size:12px; color:#64748b; margin:0 0 8px 0; text-transform:uppercase;">Total Filtrado</h3>
          <div style="font-size:32px; font-weight:800; color:#1e293b;">${total}</div>
        </div>
        <div class="data-card" style="padding:20px; border-left:4px solid #3b82f6;">
          <h3 style="font-size:12px; color:#64748b; margin:0 0 8px 0; text-transform:uppercase;">Homens</h3>
          <div style="font-size:32px; font-weight:800; color:#3b82f6;">${homens}</div>
        </div>
        <div class="data-card" style="padding:20px; border-left:4px solid #e11d48;">
          <h3 style="font-size:12px; color:#64748b; margin:0 0 8px 0; text-transform:uppercase;">Mulheres</h3>
          <div style="font-size:32px; font-weight:800; color:#e11d48;">${mulheres}</div>
        </div>
        <div class="data-card" style="padding:20px; border-left:4px solid #10b981;">
          <h3 style="font-size:12px; color:#64748b; margin:0 0 8px 0; text-transform:uppercase;">Ativos</h3>
          <div style="font-size:32px; font-weight:800; color:#10b981;">${filtrados.filter(m => (m.Situação || 'Ativo') === 'Ativo').length}</div>
        </div>
      </div>

      <!-- DISTRIBUIÇÃO POR IDADE -->
      <div class="data-card" style="padding:20px; margin-bottom:24px;">
        <h3 style="font-size:14px; color:#1e293b; margin:0 0 16px 0;">Distribuição por Faixa Etária</h3>
        <div style="display:flex; gap:8px; align-items:flex-end; height:100px;">
          ${[
            { label: 'Crianças', val: criancas, cor: '#0891b2' },
            { label: 'Adolescentes', val: adolescentes, cor: '#2563eb' },
            { label: 'Jovens', val: jovens, cor: '#7c3aed' },
            { label: 'Adultos', val: adultos, cor: '#059669' },
            { label: 'Idosos', val: idosos, cor: '#f59e0b' }
          ].map(item => {
            const altura = total > 0 ? (item.val / total) * 100 : 0;
            return `
              <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; height:100%;">
                <span style="font-size:12px; font-weight:700; color:${item.cor}; margin-bottom:4px;">${item.val}</span>
                <div style="width:100%; height:${Math.max(altura, 2)}%; background:${item.cor}; border-radius:6px 6px 0 0; min-height:4px; transition:height 0.3s;"></div>
                <span style="font-size:10px; color:#64748b; margin-top:6px; text-align:center; line-height:1.2;">${item.label}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- TABELA DE MEMBROS FILTRADOS -->
      <div class="data-card" style="padding:0; overflow:hidden;">
        <table class="data-table">
          <thead style="background:#f8fafc;">
            <tr>
              <th>Nome</th>
              <th>Sexo</th>
              <th>Idade</th>
              <th>Ministérios</th>
              <th>Situação</th>
            </tr>
          </thead>
          <tbody>
            ${filtrados.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding:20px; color:#64748b;">Nenhum membro atende a esses filtros.</td></tr>' : ''}
            ${filtrados.slice(0, 50).map(m => {
              const idade = UI.calcularIdade(m.Nascimento);
              const mins = m.Ministérios ? JSON.parse(m.Ministérios || '[]') : [];
              return `
                <tr>
                  <td><strong>${UI.escapar(m.Nome)}</strong> ${m.Apelido ? `<span style="color:#64748b;font-size:12px;">(${m.Apelido})</span>` : ''}</td>
                  <td><span class="badge" style="background:${m.Sexo === 'Masculino' ? '#e0e7ff; color:#3b82f6' : m.Sexo === 'Feminino' ? '#ffe4e6; color:#e11d48' : '#f1f5f9; color:#64748b'};">${m.Sexo || '—'}</span></td>
                  <td>${idade ? idade + ' anos' : '—'}</td>
                  <td style="font-size:12px; color:#64748b;">${mins.length > 0 ? mins.join(', ') : '—'}</td>
                  <td><span class="badge" style="background:${(m.Situação || 'Ativo') === 'Ativo' ? '#dcfce7; color:#059669' : '#fee2e2; color:#dc2626'};">${m.Situação || 'Ativo'}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        ${filtrados.length > 50 ? `<div style="padding:12px; text-align:center; font-size:12px; color:#64748b; background:#f8fafc; border-top:1px solid #e2e8f0;">Mostrando os primeiros 50 de ${filtrados.length} resultados.</div>` : ''}
      </div>
    `;
  },

  _filtrar() {
    let lista = [...this._dados];

    if (this._filtroSexo) {
      lista = lista.filter(m => m.Sexo === this._filtroSexo);
    }

    if (this._filtroIdade) {
      lista = lista.filter(m => {
        const faixa = UI.calcularFaixaEtaria(m.Nascimento);
        return faixa && faixa.nome === this._filtroIdade;
      });
    }

    if (this._filtroMinisterio) {
      lista = lista.filter(m => {
        const mins = m.Ministérios ? JSON.parse(m.Ministérios || '[]') : [];
        return mins.includes(this._filtroMinisterio);
      });
    }

    if (this._filtroSituacao) {
      lista = lista.filter(m => (m.Situação || 'Ativo') === this._filtroSituacao);
    }

    return lista;
  },

  _filtrarSexo(val) { this._filtroSexo = val; this._renderTudo(); },
  _filtrarIdade(val) { this._filtroIdade = val; this._renderTudo(); },
  _filtrarMinisterio(val) { this._filtroMinisterio = val; this._renderTudo(); },
  _filtrarSituacao(val) { this._filtroSituacao = val; this._renderTudo(); },

  _limparFiltros() {
    this._filtroSexo = '';
    this._filtroIdade = '';
    this._filtroMinisterio = '';
    this._filtroSituacao = '';
    this._renderTudo();
  }

};

console.log('%c[Relatorios] Módulo carregado v2.0 com filtros', 'color:#64748b;font-size:11px;');
