/* ============================================================
   PIBENS ADM — Módulo Aniversariantes
   ============================================================
   Funcionalidades:
   - Lista de aniversariantes separada em:
     • Hoje
     • Esta semana (próximos 7 dias)
     • Resto do mês
   - Idade que vai fazer
   - Botão WhatsApp com mensagem pronta
   - Filtro por mês (mês atual ou outro)
   - Navegação entre anos
   ============================================================ */

const Aniversariantes = {

  _membros: [],
  _mesFiltro: null,  // 1-12 (null = mês atual)
  _anoFiltro: null,  // ex: 2026 (null = ano atual)

  /* ==========================================================
     RENDER PRINCIPAL
     ========================================================== */
  async render() {
    const c = document.getElementById('content');
    if (!c) return;

    c.innerHTML = UI.loading('Carregando aniversariantes...');

    try {
      const membros = await API.listar(CONFIG.TABELAS.MEMBROS);
      this._membros = membros || [];
      this._renderTudo();
    } catch (e) {
      c.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon" style="color:#dc2626;"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="empty-state-title">Erro ao carregar</div>
          <div class="empty-state-text">${UI.escapar(e.message)}</div>
          <button class="btn btn-primary" onclick="Aniversariantes.render()">
            <i class="fas fa-sync"></i> Tentar de novo
          </button>
        </div>
      `;
    }
  },

  _renderTudo() {
    const c = document.getElementById('content');
    if (!c) return;

    const hoje = new Date();
    const mesAtual = this._mesFiltro || (hoje.getMonth() + 1);
    const anoAtual = this._anoFiltro || hoje.getFullYear();

    const aniversariantes = this._listarAniversariantes(mesAtual, anoAtual);

    // Separa por proximidade
    const hojeList = [];
    const semanaList = [];
    const mesList = [];

    const hojeDia = hoje.getDate();
    const hojeMes = hoje.getMonth() + 1;
    const hojeAno = hoje.getFullYear();

    aniversariantes.forEach((a) => {
      // Só calcula "hoje" e "semana" se o filtro for o mês atual do ano atual
      if (mesAtual === hojeMes && anoAtual === hojeAno) {
        if (a.dia === hojeDia) {
          hojeList.push(a);
        } else {
          // Calcula quantos dias faltam
          const dias = a.dia - hojeDia;
          if (dias > 0 && dias <= CONFIG.ANIVERSARIANTES.DIAS_SEMANA_DESTAQUE) {
            semanaList.push(a);
          } else {
            mesList.push(a);
          }
        }
      } else {
        mesList.push(a);
      }
    });

    const nomeMes = CONFIG.MESES[mesAtual - 1];
    const titulo = `${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)} ${anoAtual}`;

    c.innerHTML = `
      <div class="aniv-header">
        <div class="aniv-header-info">
          <h1 class="aniv-titulo">🎂 Aniversariantes de ${titulo}</h1>
          <p class="aniv-subtitulo">
            ${aniversariantes.length} pessoa(s) fazem aniversário neste mês
          </p>
        </div>
        <div class="aniv-filtro">
          <select class="form-select" onchange="Aniversariantes.trocarMes(this.value)">
            ${CONFIG.MESES.map((m, i) => `
              <option value="${i + 1}" ${mesAtual === (i + 1) ? 'selected' : ''}>
                ${m.charAt(0).toUpperCase() + m.slice(1)}
              </option>
            `).join('')}
          </select>
          <select class="form-select" onchange="Aniversariantes.trocarAno(this.value)">
            ${[hojeAno - 1, hojeAno, hojeAno + 1].map((a) => `
              <option value="${a}" ${anoAtual === a ? 'selected' : ''}>${a}</option>
            `).join('')}
          </select>
        </div>
      </div>

      ${hojeList.length > 0 ? this._renderSecao('🎉 HOJE', hojeList, 'hoje') : ''}
      ${semanaList.length > 0 ? this._renderSecao('📅 ESTA SEMANA', semanaList, 'semana') : ''}
      ${mesList.length > 0 ? this._renderSecao('🗓️ RESTO DO MÊS', mesList, 'mes') : ''}

      ${aniversariantes.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon"><i class="fas fa-birthday-cake"></i></div>
          <div class="empty-state-title">Nenhum aniversariante</div>
          <div class="empty-state-text">
            Ninguém faz aniversário em ${titulo}. Tente outro mês ou cadastre mais membros.
          </div>
        </div>
      ` : ''}
    `;
  },

  /* ==========================================================
     SEÇÃO (Hoje / Semana / Mês)
     ========================================================== */
  _renderSecao(titulo, lista, tipo) {
    const cards = lista.map((a) => this._renderCard(a, tipo)).join('');

    return `
      <div class="aniv-secao aniv-secao-${tipo}">
        <div class="aniv-secao-titulo">
          <h2>${titulo}</h2>
          <span class="aniv-secao-count">${lista.length}</span>
        </div>
        <div class="aniv-secao-lista">${cards}</div>
      </div>
    `;
  },

  /* ==========================================================
     CARD DO ANIVERSARIANTE
     ========================================================== */
  _renderCard(a, tipo) {
    const telefone = (a.telefone || '').replace(/\D/g, '');

    // Formata data: "qua, 15/10"
    const diaSemana = CONFIG.DIAS_SEMANA_ABREV[a.diaSemana];
    const dia = String(a.dia).padStart(2, '0');
    const mes = String(a.mes).padStart(2, '0');
    const dataFormatada = `${diaSemana}, ${dia}/${mes}`;

    // Iniciais pro avatar
    const iniciais = UI.iniciais(a.nome);

    return `
      <div class="aniv-card aniv-card-${tipo}">
        <div class="aniv-avatar" style="background:${this._corDoNome(a.nome)};">
          ${iniciais}
        </div>
        <div class="aniv-info">
          <div class="aniv-nome">${UI.escapar(a.nome)}</div>
          <div class="aniv-detalhes">
            <span class="aniv-data">
              <i class="fas fa-calendar-day"></i>
              ${tipo === 'hoje' ? 'Hoje!' : dataFormatada}
            </span>
            <span class="aniv-idade">
              <i class="fas fa-birthday-cake"></i>
              ${a.idade} anos
            </span>
          </div>
          ${telefone.length >= 10 ? `
            <div class="aniv-telefone">
              <i class="fas fa-phone"></i> ${UI.telefone(a.telefone)}
            </div>
          ` : ''}
        </div>
        ${telefone.length >= 10 ? `
          <div class="aniv-acoes">
            <button class="btn btn-success btn-sm" onclick="Aniversariantes.enviarWhats('${telefone}', '${UI.escapar(a.nome).replace(/'/g, "\\'")}')" title="Enviar parabéns">
              <i class="fab fa-whatsapp"></i> Parabéns
            </button>
          </div>
        ` : `
          <div class="aniv-acoes">
            <span style="font-size:0.75rem;color:#94a3b8;">Sem telefone</span>
          </div>
        `}
      </div>
    `;
  },

  /* ==========================================================
     COR DO AVATAR (baseada no nome)
     ========================================================== */
  _corDoNome(nome) {
    const cores = ['#2563eb', '#059669', '#7c3aed', '#e11d48', '#f59e0b', '#0891b2', '#f97316'];
    let hash = 0;
    for (let i = 0; i < (nome || '').length; i++) {
      hash = nome.charCodeAt(i) + ((hash << 5) - hash);
    }
    return cores[Math.abs(hash) % cores.length];
  },

  /* ==========================================================
     LISTAR ANIVERSARIANTES DO MÊS
     ========================================================== */
  _listarAniversariantes(mes, ano) {
    const resultado = [];

    this._membros.forEach((m) => {
      const nome = m.Nome || m.nome;
      const nasc = (m.Nascimento || m.nascimento || m.Aniversario || '').trim();
      if (!nome || !nasc) return;

      const parsed = this._parseData(nasc);
      if (!parsed) return;

      if (parsed.mes !== mes) return;

      // Calcula idade que vai fazer no ano do filtro
      let idade = null;
      if (parsed.ano) {
        idade = ano - parsed.ano;
      }

      // Dia da semana (no ano do filtro)
      const dataNiver = new Date(ano, mes - 1, parsed.dia);
      const diaSemana = dataNiver.getDay();

      resultado.push({
        nome,
        dia: parsed.dia,
        mes: parsed.mes,
        idade: idade || '?',
        telefone: m.Telefone || '',
        diaSemana
      });
    });

    // Ordena por dia
    resultado.sort((a, b) => a.dia - b.dia);

    return resultado;
  },

  /* ==========================================================
     PARSE DE DATA DE NASCIMENTO
     ========================================================== */
  _parseData(nasc) {
    let dia = null, mes = null, ano = null;

    if (nasc.indexOf('/') > -1) {
      const p = nasc.split('/');
      dia = parseInt(p[0], 10);
      mes = parseInt(p[1], 10);
      ano = p[2] ? parseInt(p[2], 10) : null;
    } else if (nasc.indexOf('-') > -1) {
      const p = nasc.split('-');
      if (p[0].length === 4) {
        ano = parseInt(p[0], 10);
        mes = parseInt(p[1], 10);
        dia = parseInt(p[2], 10);
      } else {
        dia = parseInt(p[0], 10);
        mes = parseInt(p[1], 10);
        ano = p[2] ? parseInt(p[2], 10) : null;
      }
    }

    if (!dia || !mes) return null;
    if (dia < 1 || dia > 31 || mes < 1 || mes > 12) return null;

    return { dia, mes, ano };
  },

  /* ==========================================================
     TROCA DE FILTRO
     ========================================================== */
  trocarMes(mes) {
    this._mesFiltro = parseInt(mes, 10);
    this._renderTudo();
  },

  trocarAno(ano) {
    this._anoFiltro = parseInt(ano, 10);
    this._renderTudo();
  },

  /* ==========================================================
     WHATSAPP
     ========================================================== */
  enviarWhats(telefone, nome) {
    if (!telefone || telefone.length < 10) {
      UI.toast('Telefone não cadastrado.', 'warning');
      return;
    }

    const numero = '55' + telefone.replace(/\D/g, '');

    // Escolhe uma mensagem aleatória
    const mensagens = CONFIG.ANIVERSARIANTES.MENSAGENS_WHATS;
    const mensagemBase = mensagens[Math.floor(Math.random() * mensagens.length)];
    const mensagem = mensagemBase.replace('{nome}', nome);

    const msg = encodeURIComponent(mensagem);
    window.open(`https://wa.me/${numero}?text=${msg}`, '_blank');
  }

};

console.log('%c[Aniversariantes] Módulo carregado', 'color:#64748b;font-size:11px;');
