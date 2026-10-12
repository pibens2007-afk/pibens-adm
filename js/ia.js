/* ============================================================
   PIBENS ADM — Módulo IA (Gemini)
   ============================================================ */

const IA = {

  /* ----------------------------------------------------------
     Render principal
     ---------------------------------------------------------- */
  render() {
    const c = document.getElementById('content');
    if (!c) return;

    c.innerHTML = `
      <div class="ia-grid">
        ${this._card('devocional', 'fa-book-bible', 'Devocional Diário', 'Gere um devocional com versículo, reflexão e oração.', 'Gerar devocional')}
        ${this._card('agenda',      'fa-calendar-check', 'Resumir Agenda', 'Resumo dos próximos eventos da igreja.', 'Resumir agenda')}
        ${this._card('relatorio',   'fa-chart-line', 'Relatório Mensal', 'Análise pastoral com base nos dados do sistema.', 'Gerar relatório')}
        ${this._card('duvida',      'fa-question-circle', 'Dúvida Bíblica', 'Pergunte qualquer coisa sobre a Bíblia.', null)}
      </div>

      <div id="ia-result" class="ia-result" style="display:none;">
        <div class="ia-result-title">
          <i class="fas fa-robot"></i>
          <span id="ia-result-title-text">Resposta</span>
        </div>
        <div id="ia-result-content" class="ia-result-content"></div>
      </div>
    `;
  },

  /* ----------------------------------------------------------
     Card individual
     ---------------------------------------------------------- */
  _card(id, icone, titulo, descricao, botao) {
    const inputHTML = id === 'duvida'
      ? `<input id="ia-duvida-input" class="form-input" placeholder="Ex: O que significa João 3:16?" style="margin-bottom:0.75rem;">`
      : '';

    const botaoHTML = botao
      ? `<button class="btn btn-danger btn-block" onclick="IA.gerar('${id}')">
           <i class="fas ${icone}"></i> ${botao}
         </button>`
      : `<button class="btn btn-danger btn-block" onclick="IA.gerar('${id}')">
           <i class="fas ${icone}"></i> Perguntar
         </button>`;

    return `
      <div class="ia-card">
        <div class="ia-card-icon"><i class="fas ${icone}"></i></div>
        <div class="ia-card-title">${titulo}</div>
        <div class="ia-card-desc">${descricao}</div>
        ${inputHTML}
        ${botaoHTML}
      </div>
    `;
  },

  /* ----------------------------------------------------------
     Gera a resposta
     ---------------------------------------------------------- */
  async gerar(tipo) {
    const resultBox = document.getElementById('ia-result');
    const titleEl   = document.getElementById('ia-result-title-text');
    const contentEl = document.getElementById('ia-result-content');

    if (!resultBox || !contentEl) return;

    // Determina função
    let funcao = '';
    let titulo = '';
    let args   = [];

    switch (tipo) {
      case 'devocional':
        funcao = 'devocionalDiario';
        titulo = '📖 Devocional Diário';
        break;

      case 'agenda':
        funcao = 'resumirAgenda';
        titulo = '📅 Resumo da Agenda';
        break;

      case 'relatorio':
        funcao = 'relatorioMensal';
        titulo = '📊 Relatório Mensal';
        break;

      case 'duvida': {
        const input = document.getElementById('ia-duvida-input');
        const pergunta = input ? input.value.trim() : '';
        if (!pergunta) {
          UI.toast('Digite a dúvida primeiro.', 'error');
          if (input) input.focus();
          return;
        }
        funcao = 'duvidaBiblica';
        titulo = '❓ Dúvida Bíblica';
        args   = [pergunta];
        break;
      }

      default:
        return;
    }

    // Mostra loading
    resultBox.style.display = 'block';
    if (titleEl) titleEl.textContent = titulo;
    contentEl.innerHTML = '<span class="spinner" style="border-top-color:#e11d48;border-color:#fecdd3;border-top-color:#e11d48;"></span> Consultando IA...';

    // Rola pra ver o resultado (mobile)
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'start' });

    try {
      const r = await API.call(funcao, args);
      const texto = r && r.texto ? r.texto : JSON.stringify(r);
      contentEl.textContent = texto;
    } catch (e) {
      contentEl.innerHTML = `<span style="color:#dc2626;font-weight:700;">Erro:</span> ${UI.escapar(e.message)}`;
    }
  }

};

console.log('%c[IA] Módulo carregado', 'color:#64748b;font-size:11px;');
