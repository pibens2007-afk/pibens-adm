/* ============================================================
   PIBENS ADM — UI (utilitários visuais) v2.6
   ============================================================ */

const UI = {

  /* ----------------------------------------------------------
     TOASTS
     ---------------------------------------------------------- */
  toast(mensagem, tipo = 'info', duracao = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icones = {
      success: 'fa-check-circle',
      error:   'fa-times-circle',
      warning: 'fa-exclamation-triangle',
      info:    'fa-info-circle'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `
      <i class="fas ${icones[tipo] || icones.info} toast-icon"></i>
      <span>${mensagem}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 300);
    }, duracao);
  },

  /* ----------------------------------------------------------
     MODAIS
     ---------------------------------------------------------- */
  openModal(titulo, conteudoHTML, botoesHTML = '') {
    const overlay = document.getElementById('modal');
    const title   = document.getElementById('modal-title');
    const body    = document.getElementById('modal-body');
    const footer  = document.getElementById('modal-footer');

    if (!overlay) return;

    title.textContent = titulo;
    body.innerHTML = conteudoHTML;
    footer.innerHTML = botoesHTML || '';
    overlay.style.display = 'flex';
  },

  closeModal() {
    const overlay = document.getElementById('modal');
    if (overlay) overlay.style.display = 'none';
  },

  confirmar(mensagem, titulo = 'Confirmação') {
    return new Promise((resolve) => {
      const botoes = `
        <button class="btn btn-neutral" onclick="UI._resolverConfirm(false)">
          <i class="fas fa-times"></i> Cancelar
        </button>
        <button class="btn btn-danger" onclick="UI._resolverConfirm(true)">
          <i class="fas fa-check"></i> Confirmar
        </button>
      `;
      this.openModal(titulo, `<p style="font-size:1rem;color:#475569;">${mensagem}</p>`, botoes);
      this._resolverConfirm = (valor) => {
        this.closeModal();
        resolve(valor);
      };
    });
  },

  /* ----------------------------------------------------------
     LOADING
     ---------------------------------------------------------- */
  loading(mensagem = 'Carregando...') {
    return `
      <div class="loading-screen">
        <i class="fas fa-sync fa-spin"></i>
        <p>${mensagem}</p>
      </div>
    `;
  },

  emptyState(titulo, texto, botaoHTML = '') {
    return `
      <div class="empty-state">
        <div class="empty-state-icon"><i class="fas fa-inbox"></i></div>
        <div class="empty-state-title">${titulo}</div>
        <div class="empty-state-text">${texto}</div>
        ${botaoHTML}
      </div>
    `;
  },

  /* ----------------------------------------------------------
     FORMATAÇÃO DE DATA
     ---------------------------------------------------------- */
  dataBR(iso) {
    if (!iso) return '—';
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      const [a, m, d] = iso.split('-');
      return `${d}/${m}/${a}`;
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(iso)) return iso;
    return iso;
  },

  dataExtenso(iso) {
    if (!iso) return '';
    const d = iso instanceof Date ? iso : new Date(iso);
    if (isNaN(d)) return '';
    const diaSemana = CONFIG.DIAS_SEMANA[d.getDay()];
    const dia = d.getDate();
    const mes = CONFIG.MESES[d.getMonth()];
    const ano = d.getFullYear();
    return `${diaSemana}, ${dia} de ${mes} de ${ano}`;
  },

  dataInput(br) {
    if (!br) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(br)) return br;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(br)) {
      const [d, m, a] = br.split('/');
      return `${a}-${m}-${d}`;
    }
    return '';
  },

  /* ----------------------------------------------------------
     FORMATAÇÃO DE DOCUMENTOS
     ---------------------------------------------------------- */
  telefone(v) {
    if (!v) return '—';
    const n = String(v).replace(/\D/g, '');
    if (n.length === 11) return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`;
    if (n.length === 10) return `(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`;
    return v;
  },

  cpf(v) {
    if (!v) return '—';
    const n = String(v).replace(/\D/g, '');
    if (n.length === 11) return `${n.slice(0,3)}.${n.slice(3,6)}.${n.slice(6,9)}-${n.slice(9)}`;
    return v;
  },

  cep(v) {
    if (!v) return '—';
    const n = String(v).replace(/\D/g, '');
    if (n.length === 8) return `${n.slice(0,5)}-${n.slice(5)}`;
    return v;
  },

  /* ----------------------------------------------------------
     STRINGS
     ---------------------------------------------------------- */
  iniciais(nome) {
    if (!nome) return '?';
    const partes = String(nome).trim().split(/\s+/);
    if (partes.length === 1) return partes[0][0].toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  },

  capitalizar(s) {
    if (!s) return '';
    return String(s).charAt(0).toUpperCase() + String(s).slice(1).toLowerCase();
  },

  escapar(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  debounce(fn, delay = 300) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  },

  /* ----------------------------------------------------------
     CÁLCULO DE IDADE E FAIXA ETÁRIA
     ---------------------------------------------------------- */

  /**
   * Calcula a idade em anos a partir de uma data de nascimento
   * Aceita: "1990-05-12", "12/05/1990", "mai. 2, 2026"
   */
  calcularIdade(nascimento) {
    const data = this.parseDataNascimento(nascimento);
    if (!data) return null;

    const hoje = new Date();
    let idade = hoje.getFullYear() - data.ano;
    const mesAtual = hoje.getMonth() + 1;
    const diaAtual = hoje.getDate();

    if (mesAtual < data.mes || (mesAtual === data.mes && diaAtual < data.dia)) {
      idade--;
    }
    return idade;
  },

  /**
   * Retorna o objeto da faixa etária: { nome, cor, icon }
   */
  calcularFaixaEtaria(nascimento) {
    const idade = this.calcularIdade(nascimento);
    if (idade === null) return null;

    for (const faixa of CONFIG.FAIXAS_ETARIAS) {
      if (idade >= faixa.min && idade <= faixa.max) {
        return faixa;
      }
    }
    return null;
  },

  /**
   * Parseia data de nascimento em formato conhecido
   * Retorna { dia, mes, ano } ou null
   */
  parseDataNascimento(nasc) {
    if (!nasc) return null;
    nasc = String(nasc).trim();

    // Formato ISO: "1990-05-12"
    if (/^\d{4}-\d{2}-\d{2}$/.test(nasc)) {
      const [a, m, d] = nasc.split('-').map(Number);
      return { dia: d, mes: m, ano: a };
    }

    // Formato BR: "12/05/1990"
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(nasc)) {
      const [d, m, a] = nasc.split('/').map(Number);
      return { dia: d, mes: m, ano: a };
    }

    // Formato BR sem ano: "12/05"
    if (/^\d{2}\/\d{2}$/.test(nasc)) {
      const [d, m] = nasc.split('/').map(Number);
      return { dia: d, mes: m, ano: null };
    }

    return null;
  },

  /* ----------------------------------------------------------
     TOPBAR
     ---------------------------------------------------------- */
  setTituloTopbar(icone, texto) {
    const el = document.getElementById('topbar-title');
    if (!el) return;
    el.innerHTML = `<i class="fas ${icone}"></i><span>${texto}</span>`;
  },

  setDataTopbar() {
    const el = document.getElementById('topbar-date');
    if (!el) return;
    const hoje = new Date();
    const diaSemana = CONFIG.DIAS_SEMANA[hoje.getDay()];
    const dia = hoje.getDate();
    const mes = CONFIG.MESES[hoje.getMonth()];
    const ano = hoje.getFullYear();
    el.innerHTML = `<i class="fas fa-calendar-day"></i><span>${diaSemana}, ${dia} de ${mes} de ${ano}</span>`;
  }

};

console.log('%c[UI] Módulo carregado (v2.6 com faixa etária)', 'color:#64748b;font-size:11px;');
