/* ============================================================
   PIBENS ADM — Camada de API
   ============================================================ */

const API = {

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

  login(senha) {
    return this.call('login', [senha]);
  },

  listar(tabela) {
    return this.call('listarRegistros', [tabela]);
  },

  salvar(tabela, dados, id = null) {
    return this.call('salvarRegistro', [tabela, dados, id]);
  },

  remover(id) {
    return this.call('removerRegistro', [id]);
  },

  banners() {
    return this.call('getHomeBanners');
  },

  devocional()      { return this.call('devocionalDiario'); },
  resumirAgenda()   { return this.call('resumirAgenda'); },
  duvidaBiblica(q)  { return this.call('duvidaBiblica', [q]); },
  relatorioMensal() { return this.call('relatorioMensal'); }

};

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

console.log('%c[API] Módulo carregado', 'color:#64748b;font-size:11px;');
