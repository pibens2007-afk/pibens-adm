/* ============================================================
   PIBENS ADM — Camada de API
   ============================================================
   Responsável por:
   - Fazer requisições POST pro Apps Script
   - Tratar timeout (25s com AbortController)
   - Tratar erros de JSON / rede
   - Atalhos específicos (login, OTP, CRUD, IA)
   ============================================================ */

const API = {

  /* ----------------------------------------------------------
     Requisição principal
     ----------------------------------------------------------
     Uso:
       await API.call('listarRegistros', ['Membros'])
       await API.call('salvarRegistro', ['Membros', dados, null])
       await API.call('removerRegistro', [123])
     ---------------------------------------------------------- */
  async call(funcao, args = []) {
    if (!funcao) throw new Error('Função não especificada.');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);

    try {
      const resp = await fetch(CONFIG.API_URL, {
        method: 'POST',
        cache: 'no-store',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ funcao, args }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const texto = await resp.text();
      let json;

      try {
        json = JSON.parse(texto);
      } catch (e) {
        console.error('[API] Resposta não-JSON:', texto.substring(0, 300));
        throw new Error(CONFIG.MSG.ERRO_JSON);
      }

      if (!json.ok) {
        throw new Error(json.erro || CONFIG.MSG.ERRO_GENERICO);
      }

      return json.data;

    } catch (e) {
      clearTimeout(timeoutId);

      if (e.name === 'AbortError') {
        throw new Error(CONFIG.MSG.ERRO_CONEXAO);
      }

      if (e instanceof TypeError && e.message.includes('fetch')) {
        throw new Error('Sem conexão com o servidor. Verifique sua internet.');
      }

      throw e;
    }
  },

  /* ----------------------------------------------------------
     AUTENTICAÇÃO
     ---------------------------------------------------------- */

  // Etapa 1: envia a senha, recebe { etapa: 'otp_enviado', destinos }
  login(senha) {
    return this.call('login', [senha]);
  },

  // Etapa 2: valida o código de 6 dígitos
  validarCodigo(codigo) {
    return this.call('validarCodigo', [codigo]);
  },

  // Reenvia um novo código
  reenviarCodigo() {
    return this.call('reenviarCodigo');
  },

  /* ----------------------------------------------------------
     CRUD GENÉRICO
     ---------------------------------------------------------- */

  listar(tabela) {
    return this.call('listarRegistros', [tabela]);
  },

  salvar(tabela, dados, id = null) {
    return this.call('salvarRegistro', [tabela, dados, id]);
  },

  remover(id) {
    return this.call('removerRegistro', [id]);
  },

  /* ----------------------------------------------------------
     BANNERS
     ---------------------------------------------------------- */
  banners() {
    return this.call('getHomeBanners');
  },

  /* ----------------------------------------------------------
     IA (GROQ)
     ---------------------------------------------------------- */
  devocional()      { return this.call('devocionalDiario'); },
  resumirAgenda()   { return this.call('resumirAgenda'); },
  duvidaBiblica(q)  { return this.call('duvidaBiblica', [q]); },
  relatorioMensal() { return this.call('relatorioMensal'); },

  /* ----------------------------------------------------------
     FINANCEIRO (atalhos)
     ---------------------------------------------------------- */
  listarFinanceiro() {
    return this.listar(CONFIG.TABELAS.FINANCEIRO);
  },

  salvarFinanceiro(dados, id = null) {
    return this.salvar(CONFIG.TABELAS.FINANCEIRO, dados, id);
  },

  removerFinanceiro(id) {
    return this.remover(id);
  }

};

/* ----------------------------------------------------------
   Helper: executa uma chamada com tratamento de erro automático
   ----------------------------------------------------------
   Uso:
     const data = await APIComErro(() => API.listar('Membros'));
   ---------------------------------------------------------- */
async function APIComErro(fn, mostrarToast = true) {
  try {
    return await fn();
  } catch (e) {
    console.error('[API]', e);
    if (mostrarToast && typeof UI !== 'undefined') {
      UI.toast(e.message || CONFIG.MSG.ERRO_GENERICO, 'error');
    }
    throw e;
  }
}

console.log('%c[API] Módulo carregado (OTP + Financeiro)', 'color:#64748b;font-size:11px;');
